import { Component, NgZone, OnInit, ɵMethodFn } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { MethodFn } from '@angular/core/src/reflection/types';
import { MethodCall } from '@angular/compiler';
import { Utils } from 'src/app/services/Utils.service';

declare var $: any;
declare var pcsc: any;
// tslint:disable-next-line:prefer-const
let pcs = pcsc();
let cardName: any = '';
pcs.on('reader', function (reader) {
  console.log('reader', reader);
  console.log('New reader detected', reader.name);

  reader.on('error', function (err) {
    console.log('Error(', this.name, '):', err.message);
  });

  reader.on('status', function (status) {
    console.log('Status(', this.name, '):', status);
    /* check what has changed */
    // tslint:disable-next-line:no-bitwise
    const changes = this.state ^ status.state;
    if (changes) {
      // tslint:disable-next-line:no-bitwise
      if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
        console.log('card removed'); /* card removed */
        reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Disconnected');
          }
        });
        // tslint:disable-next-line:no-bitwise
      } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
        cardName = reader.name;
        console.log('sample', cardName);
        console.log('card inserted'); /* card inserted */
        reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, function (err, protocol) {
          if (err) {
            console.log(err);
          } else {
            console.log('Protocol(', reader.name, '):', protocol);
            reader.transmit(new Buffer([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol,
              // tslint:disable-next-line:no-shadowed-variable
              function (err: any, data: { toString: (arg0: string) => void; }) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('Data received', data);
                  console.log('Data base64', data.toString('base64'));
                  // reader.close();
                  // pcs.close();
                }
              });
          }
        });
      }
    }
  });

  reader.on('end', function () {
    console.log('Reader', this.name, 'removed');
  });
});

pcs.on('error', function (err) {
  console.log('PCSC error', err.message);
});

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  public loading: Boolean = false;
  openShift = true;
  closingPausedMainShift = false;
  mainShiftPaused = false;
  shiftType: any;
  shiftState: any;
  mainShiftReOpen: Boolean = false;
  mainshiftCloser: Boolean = false;
  statusOfShiftReport: any = '';
  openingDrawerBal: any = 0;
  expectedCash: any = 0;
  actualCash: any = 0;
  overShort: any = 0;
  synCompleted: any;
  numOfAttempts = 0;
  maxLoopingCount = 0;
  public deviceInfoNew: Boolean = false;
  intervalSyc: any;
  configData: any;
  SyncMethod: any;
  isCurrentSync: Boolean = false;
  catalogData = [];
  terminalConfigJson: any = [];
  public fareTotal: any = 0;
  public nonFareTotal: any = 0;
  public fareAndNonFareTotal: any = 0;

  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone,
    private electronService: ElectronService, ) {

    this.electronService.ipcRenderer.on('adminSalesResult', (event, data) => {
      if (data != undefined && data != '') {
        JSON.parse(data).forEach(element => {
          if (element.isMerchandise == 0) {
            this.fareTotal = this.fareTotal + element.value;
          } else if (element.isMerchandise == 1) {
            this.nonFareTotal = this.nonFareTotal + element.value;
          }
          this.fareAndNonFareTotal = this.fareTotal + this.nonFareTotal;

        });
        this._ngZone.run(() => {
        });
        return JSON.parse(data);
      }
    });
    this.electronService.ipcRenderer.on('adminSalesPaymentResult', (event, data) => {
      if (data != undefined && data.length != 0) {
        JSON.parse(data).forEach(element => {
          if (element.paymentMethod == 'CASH') {

            this.expectedCash = Number(this.expectedCash) + element.paymentAmount;
            this.expectedCash = this.expectedCash.toFixed(2);
            localStorage.setItem('expectedCash', this.expectedCash);
            this.overShort = (Number(this.actualCash) - this.expectedCash).toFixed(2);
            this.overShort = Math.abs(this.overShort);
          }
        });
        this._ngZone.run(() => {
        });
      }
    });


    this.electronService.ipcRenderer.on('adminSyncResult', (event, data) => {
      if (data != undefined && data != '') {
        if (data == true) {
          this.electronService.ipcRenderer.send('isSyncCompleted');
        }
        this._ngZone.run(() => {
        });
      }
    });

    // This Method for Handling SYNC Data
    this.SyncMethod = this.electronService.ipcRenderer.on('isSyncCompletedResult', (event, data) => {
      console.log('data synch', data);
      console.log('number of attempts', this.numOfAttempts);
      // tslint:disable-next-line:prefer-const
      let isSyncDone: boolean = Boolean(data);
      let timer: any;
      this._ngZone.run(() => {
        if (!isSyncDone) {
          console.log('isSyncDone', isSyncDone);
          timer = setTimeout(() => {

            if (this.isCurrentSync && !isSyncDone && this.numOfAttempts < this.maxLoopingCount) {
              this.numOfAttempts++;
              this.electronService.ipcRenderer.send('isSyncCompleted');
            }
          }, 1000);

        } else if (isSyncDone == true) {
          const deviceData = JSON.parse(localStorage.getItem('deviceInfo'));
          deviceData.CURRENT_UNSYNCED_TRANSACTION_NUMBER = 0;
          deviceData.CURRENT_UNSYNCED_TRANSACTION_VALUE = 0;
          localStorage.setItem('deviceInfo', JSON.stringify(deviceData));
          this.isCurrentSync = false;
          clearTimeout(timer);
          this.getTerminalConfigJson();
          this.getProductCatalogJson();
          // clearInterval(this.intervalSyc);
          $('#continueSyncModal').modal('hide');
          $('#successSyncModal').modal('show');
          console.log('sync has been done buddy');

        } else {
          this.isCurrentSync = false;
          console.log('Sync error');
          $('#errorSyncModal').modal('show');
        }
      });
    });
    // Device Configuration Data From Backend
    this.electronService.ipcRenderer.on('adminDeviceConfigResult', (event, data) => {
      if (data != undefined && data != '') {
        this.configData = JSON.parse(data);
        this.deviceInfoNew = this.configData.LAST_SYNC_WAS_SUCCESS;
        console.log('this.deviceInfoNew', this.deviceInfoNew);

        this._ngZone.run(() => {

          localStorage.setItem('deviceConfigData', data);

        });
      }
    });


  }

/**
 * This Method To Print All Shifts Sales and their Payments
 *
 * @memberof AdminComponent
 */
getPresentShiftReport() {
    this.cdtaService.printAllOrSpecificShiftData(null);
  }

  /**
   * This Method to get terminal configuration data from backend
   *
   * @memberof AdminComponent
   */
  getTerminalConfigJson() {
    this.electronService.ipcRenderer.once('terminalConfigResult', (event, data) => {
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          localStorage.setItem('terminalConfigJson', data);
          this.terminalConfigJson = JSON.parse(data);
          this.maxLoopingCount = this.terminalConfigJson.StandardSyncInterval;
          this.cdtaService.setterminalNumber(JSON.parse(data).SerialNumber);
        });
      }
    });
    this.electronService.ipcRenderer.send('terminalConfigcall');
  }

  getProductCatalogJson() {
    this.electronService.ipcRenderer.once('getProductCatalogResult', (event, data) => {
      localStorage.setItem('catalogJSON', JSON.stringify(data));
      const item = JSON.parse(localStorage.getItem('catalogJSON'));
      this.catalogData = JSON.parse(item).Offering;
      this.setOffering();
    });
    this.electronService.ipcRenderer.send('productCatalogJson', cardName);
  }


  setOffering() {
    const offeringSList = [];
    this.catalogData.forEach(element => {

      const jsonObj: any = {
        'OfferingId': element.OfferingId,
        'ProductIdentifier': element.ProductIdentifier,
        'Description': element.Description,
        'UnitPrice': element.UnitPrice,
        'IsTaxable': element.IsTaxable,
        'IsMerchandise': element.IsMerchandise,
        'IsAccountBased': element.IsAccountBased,
        'IsCardBased': element.IsCardBased
      };
      offeringSList.push(jsonObj);
    });
    this.electronService.ipcRenderer.once('saveOfferingResult', (event, data) => {
      if (data != undefined && data != '') {
        console.log('Offerings Success');
      }
    });
    this.electronService.ipcRenderer.send('saveOffering', '{"data": ' + JSON.stringify(offeringSList) + '}');
  }

  /**
   * This Method to Get Current logged in User Sales and Payments By Default
   *
   * @param {*} event
   * @memberof AdminComponent
   */
  getSalesReports(event) {
    const reliefShif = JSON.parse(localStorage.getItem('shiftReport'));
    reliefShif.forEach(element => {
      console.log('sales report', element.shiftType, element.timeOpened, element.timeClosed);
      if (element.userID == localStorage.getItem('userID')) {
        this.electronService.ipcRenderer.send('adminSales', Number(element.shiftType), element.initialOpeningTime, element.timeClosed);
        this.electronService.ipcRenderer.send('adminSalesPaymentMethod',
          Number(element.userID), Number(element.shiftType), element.initialOpeningTime, element.timeClosed, null, null, null);
      } else {

      }
    });

  }

  /**
   * This Method to get device configurtaion details.
   *
   * @memberof AdminComponent
   */
  adminDeviceConfig() {
    this.electronService.ipcRenderer.send('adminDeviceConfig');
  }

  /**
   * This method To pause the main shift  by main shift user
   * state will change to 4
   * @memberof AdminComponent
   */
  mainShiftPause() {
    const shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
    const shiftreportUser = localStorage.getItem('userID');
    shiftStore.forEach(element => {
      if (element.userID == shiftreportUser && element.shiftType == '0') {
        element.shiftState = '4';
        localStorage.setItem('mainShiftUserLock', element.userEmail);
        localStorage.setItem('disableUntilReOpenShift', 'true');
      }

    });
    localStorage.setItem('shiftReport', JSON.stringify(shiftStore));

    if (localStorage.getItem('expectedCash') != undefined) {
      // tslint:disable-next-line:prefer-const
      let mainUserExpectedCash = localStorage.getItem('expectedCash');
      localStorage.setItem('mainUserExpectedCash', mainUserExpectedCash);
    } else {
      localStorage.setItem('mainUserExpectedCash', this.expectedCash);
    }
    this.router.navigate(['/login']);
  }

  /**
   *This Method is to know whether the cash drawer is open or not.
   *
   * @memberof AdminComponent
   */
  handleOpenCashDrawerResult() {
    this.electronService.ipcRenderer.once('openCashDrawerResult', (event, data) => {
      if (data != undefined && data != '') {
        if (data) {
          console.log('cash drawer opened Sucessfully');
        } else {
          console.log('cash drawer open Failed');
        }
      }
    });
  }

  /**
   * Method to open the cash drawer when click on nosale tab.
   *
   * @memberof AdminComponent
   */
  openCashDrawerForNoSale() {
    this.handleOpenCashDrawerResult();
    this.openCashDrawer();

  }

  /**
   *Method to open the Cash drawer
   *
   * @memberof AdminComponent
   */
  openCashDrawer() {
    this.electronService.ipcRenderer.send('openCashDrawer');
  }

/**
 * This Method is to close the Paused Main Shift
 *
 * @memberof AdminComponent
 */
closePausedMainShift() {
    this.closingPausedMainShift = true;
    localStorage.setItem('closingPausedMainShift', this.closingPausedMainShift.toString());
    this.handleOpenCashDrawerResult();
    this.openCashDrawer();
  }

  /**
   * This method is to re-open the Main Shift.
   *
   * @memberof AdminComponent
   */
  reOpenShift() {

    const shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
    const shiftreportUser = localStorage.getItem('userID');
    this.handleOpenCashDrawerResult();
    this.openCashDrawer();
    shiftStore.forEach(element => {
      if (element.userID == shiftreportUser && element.shiftState == '4') {
        element.shiftState = '0';
        this.mainShiftReOpen = false;
        this.shiftState = '0';
        this.shiftType = '0';
        element.timeOpened = new Date().getTime();
        localStorage.setItem('disableUntilReOpenShift', 'false');
      }

    });
    localStorage.setItem('shiftReport', JSON.stringify(shiftStore));
    localStorage.setItem('shiftReopenedByMainUser', 'true');
    localStorage.setItem('hideModalPopup', 'true');
  }

  /**
   *This Method is to Hide/Show the popup based on open/close of shifts
   *
   * @memberof AdminComponent
   */
  hideModalPop() {
    const shiftReports = JSON.parse(localStorage.getItem('shiftReport'));
    shiftReports.forEach(element => {
      if ((element.shiftType == '0' && element.shiftState == '0') || (element.shiftType == '1' && element.shiftState == '0')) {
        localStorage.setItem('hideModalPopup', 'true');
      } else {

        if (localStorage.getItem('shiftReopenedByMainUser') == 'true') {
          localStorage.setItem('hideModalPopup', 'true');
        } else {
          localStorage.setItem('hideModalPopup', 'false');
        }

      }
    });

  }

  /**
   * This Method Is used to print the last transaction of smartcard
   */
  lastTransactionReceipt() {
    // tslint:disable-next-line:prefer-const
    let timestamp = new Date().getTime();
    const lastTransactionReceipt = localStorage.getItem('lastTransactionReceipt');
    if (lastTransactionReceipt != undefined) {
      this.electronService.ipcRenderer.send('printReceipt', lastTransactionReceipt, timestamp);
    }
  }

  /**
   * Method to SYNC the Data.
   */
  syncData() {
    this.loading = true;
    // this.maxLoopingCount = 600;
    this.isCurrentSync = true;
    this.numOfAttempts = 0;
    $('#continueSyncModal').modal('show');
    this.electronService.ipcRenderer.send('adminSync');
  }

  ngOnInit() {
    const shiftReports = JSON.parse(localStorage.getItem('shiftReport'));
    const userId = localStorage.getItem('userID');
    this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
    this.maxLoopingCount = this.terminalConfigJson.StandardSyncInterval;
    shiftReports.forEach(element => {

      if (element.shiftState == '3' && element.userID == userId && localStorage.getItem('closingPausedMainShift') == 'true') {
        this.closingPausedMainShift = true;
        this.statusOfShiftReport = 'Main Shift is Closed and Relief Shift is Closed';
      } else
        if (element.shiftState == '3' && element.userID == userId && element.shiftType == '0' &&
          localStorage.getItem('mainShiftClose')) {
          this.shiftType = '0';
          this.shiftState = '3';
          this.mainshiftCloser = true;
          this.statusOfShiftReport = 'Main Shift is Closed';
          localStorage.setItem('ShiftOpenPauseStatus', this.statusOfShiftReport);
        } else
          if (element.shiftState == '3' && element.userID == userId && element.shiftType == '0') {
            this.shiftType = '0';
            this.shiftState = '3';
            this.statusOfShiftReport = 'Main Shift is Closed';

            localStorage.setItem('ShiftOpenPauseStatus', this.statusOfShiftReport);

          } else if (element.shiftState == '0' && element.shiftType == '0' && element.userID == userId) {
            this.shiftState = '0';
            this.shiftType = '0';

            this.statusOfShiftReport = 'Main Shift is Opened';
            if (localStorage.getItem('hideModalPopup') == 'true') {
              $('#readyForSaleModal').modal('hide');
            } else {
              $('#readyForSaleModal').modal('show');
            }

          } else if (element.shiftState == '4' && element.userID == userId && element.shiftType == '0') {
            this.shiftType = '0';
            this.shiftState = '4';
            this.statusOfShiftReport = 'Main Shift is Paused';
            localStorage.setItem('ShiftOpenPauseStatus', this.statusOfShiftReport);
          } else if (element.shiftState == '3' && element.userID == userId && element.shiftType == '1') {
            this.shiftType = '1';
            this.shiftState = '3';
            this.statusOfShiftReport = 'Main Shift is Paused ';
          } else if (element.shiftState == '0' && element.userID == userId && element.shiftType == '1') {
            this.shiftType = '1';
            this.shiftState = '0';
            if (localStorage.getItem('hideModalPopup') == 'true') {
              $('#readyForSaleModal').modal('hide');
            } else {
              $('#readyForSaleModal').modal('show');
            }
            this.statusOfShiftReport = 'Relief Shift is Opened';
          }
    });

    shiftReports.forEach(element => {
      if (element.userID == localStorage.getItem('userID')) {
        this.openingDrawerBal = (Number(this.openingDrawerBal) + element.openingDrawer).toFixed(2);
        this.expectedCash = this.openingDrawerBal;
        localStorage.setItem('expectedCash', this.expectedCash);
        if (element.closingDrawer != undefined && element.closingDrawer != '') {
          this.actualCash = (this.actualCash + element.closingDrawer).toFixed(2);
        }
        this.overShort = (this.actualCash - this.expectedCash).toFixed(2);
        this.overShort = Math.abs(this.overShort);
        if (element.initialOpeningTime != 0) {
          this.electronService.ipcRenderer.send('adminSales', Number(element.shiftType), element.initialOpeningTime, element.timeClosed);
          this.electronService.ipcRenderer.send('adminSalesPaymentMethod', Number(element.userID), Number(element.shiftType),
            element.initialOpeningTime, element.timeClosed, null, null, null);
        }

      }

    });

  }


}
