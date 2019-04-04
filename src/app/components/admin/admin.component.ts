import { Component, NgZone, OnInit, ɵMethodFn } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { MethodFn } from '@angular/core/src/reflection/types';
import { MethodCall } from '@angular/compiler';
import { Utils } from 'src/app/services/Utils.service';
// import { ConsoleReporter } from 'jasmine';
// import {setInterval, clearInterval} from 'timers';
declare var $: any

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  public loading: Boolean = false;
  openShift = true
  closingPausedMainShift = false
  mainShiftPaused = false
  shiftType: any
  shiftState: any
  mainShiftReOpen: Boolean = false
  mainshiftCloser: Boolean = false
  statusOfShiftReport: string = ""
  openingDrawerBal: any = 0
  expectedCash: any = 0
  actualCash: any = 0
  overShort: any = 0
  synCompleted: any
  numOfAttempts = 0;
  maxLoopingCount = 600;
  public deviceInfoNew: Boolean = false
  intervalSyc: any
  configData: any
  SyncMethod: any
  isCurrentSync: Boolean = false;
  public fareTotal: any = 0
  public nonFareTotal: any = 0
  public fareAndNonFareTotal: any = 0

  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, ) {

    this.electronService.ipcRenderer.on('adminSalesResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        JSON.parse(data).forEach(element => {
          // if (element.userID == localStorage.getItem("userId")) {
          if (element.isMerchandise == 0) {
            this.fareTotal = this.fareTotal + element.value
          } else if (element.isMerchandise == 1) {
            this.nonFareTotal = this.nonFareTotal + element.value
          }
          this.fareAndNonFareTotal = this.fareTotal + this.nonFareTotal

        });
        //localStorage.setItem("allSales", data)

        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
        return JSON.parse(data)
      }
    });
    this.electronService.ipcRenderer.on('adminSalesPaymentResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data.length != 0) {
        //this.show = true;
        JSON.parse(data).forEach(element => {
          if (element.paymentMethod == "CASH") {
            console.log("CASH PAYMENTS", element.paymentAmount, this.expectedCash)

            this.expectedCash = Number(this.expectedCash) + element.paymentAmount
            this.expectedCash = this.expectedCash.toFixed(2)
            localStorage.setItem("expectedCash", this.expectedCash)
            console.log("CASH fareAndNonFareTotal", this.actualCash, this.expectedCash)

            this.overShort = (Number(this.actualCash) - this.expectedCash).toFixed(2)
            this.overShort = Math.abs(this.overShort)

          }

        });
        // localStorage.setItem("paymentTypes", data)


        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('adminCloseShiftResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          //this.router.navigate(['/addproduct'])
          // this.carddata = new Array(JSON.parse(data));
        });
      }
    });
    this.electronService.ipcRenderer.on('adminOpenShiftResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('adminSyncResult', (event, data) => {
      if (data != undefined && data != "") {

        if (data == true) {
          this.electronService.ipcRenderer.send('isSyncCompleted')
        }
        this._ngZone.run(() => {
          //  this.router.navigate(['/addproduct'])
        });
      }
    });

    this.SyncMethod = this.electronService.ipcRenderer.on('isSyncCompletedResult', (event, data) => {
      console.log("data synch", data)
      console.log("number of attempts", this.numOfAttempts)
      var isSyncDone: boolean = Boolean(data);
      var timer: any;
      this._ngZone.run(() => {
        if (!isSyncDone) {
          console.log("isSyncDone", isSyncDone)
          timer = setTimeout(() => {

            if (this.isCurrentSync && !isSyncDone && this.numOfAttempts < 600) {
              this.numOfAttempts++;
              this.electronService.ipcRenderer.send('isSyncCompleted')
            }
          }, 1000);
          // this.intervalSyc = setInterval(() => {
          //   if (this.isCurrentSync && !isSyncDone && this.numOfAttempts < 600) {
          //     this.numOfAttempts++;
          //     this.electronService.ipcRenderer.send('isSyncCompleted')
          //   }
          // }, 2000)
        }
        else if (isSyncDone == true) {
          let deviceData = JSON.parse(localStorage.getItem('deviceInfo'));
          deviceData.CURRENT_UNSYNCED_TRANSACTION_NUMBER = 0;
          deviceData.CURRENT_UNSYNCED_TRANSACTION_VALUE = 0;
          localStorage.setItem('deviceInfo', JSON.stringify(deviceData));
          this.isCurrentSync = false;
          clearTimeout(timer);
          // clearInterval(this.intervalSyc);
          $("#continueSyncModal").modal("hide")
          $("#successSyncModal").modal("show")
          console.log("sync has been done buddy")

        }
        else {
          this.isCurrentSync = false;
          console.log("Sync error");
          $("#errorSyncModal").modal("show")
        }
      });
    });
    this.electronService.ipcRenderer.on('adminDeviceConfigResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this.configData = JSON.parse(data);
        this.deviceInfoNew = this.configData.LAST_SYNC_WAS_SUCCESS
        console.log("this.deviceInfoNew", this.deviceInfoNew)

        this._ngZone.run(() => {

          localStorage.setItem("deviceConfigData", data);
          // this.router.navigate(['/deviceconfig'])

        });
      }
    });
    // this.electronService.ipcRenderer.on('adminTerminalConfigResult', (event, data) => {
    //   if (data != undefined && data != "") {
    //     //this.show = true;
    //     localStorage.setItem("terminalConfig", data);
    //     this._ngZone.run(() => {
    //       // this.router.navigate(['/addproduct'])
    //     });
    //   }
    // });
    this.electronService.ipcRenderer.on('adminShiftSaleSummaryResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          //this.router.navigate(['/addproduct'])
        });
      }
    });


  }

  getPresentShiftReport() {
    let userID = localStorage.getItem("userID")
    let shiftUsers = JSON.parse(localStorage.getItem("shiftReport"));
    var specificUserDetails = []
    shiftUsers.forEach(element => {
      if (element.userID == userID) {
        specificUserDetails.push(element)
      }
    });
    this.cdtaService.printAllOrSpecificShiftData(specificUserDetails)
  }

  getSalesReports(event) {
    let reliefShif = JSON.parse(localStorage.getItem("shiftReport"));
    reliefShif.forEach(element => {
      console.log("sales report", element.shiftType, element.timeOpened, element.timeClosed)
      if (element.userID == localStorage.getItem("userID")) {
        this.electronService.ipcRenderer.send('adminSales', Number(element.shiftType), element.initialOpeningTime, element.timeClosed)
        this.electronService.ipcRenderer.send('adminSalesPaymentMethod', Number(element.userID), Number(element.shiftType), element.initialOpeningTime, element.timeClosed, null, null, null)
      } else {

      }
    });
    //console.log('read call', cardName)
  }
  adminCloseShift(event) {
    this.electronService.ipcRenderer.send('adminCloseShift')
    //console.log('read call', cardName)
  }

  adminOpenShift(event) {
    this.electronService.ipcRenderer.send('adminOpenShift')
    //console.log('read call', cardName)
  }

  adminDeviceConfig() {
    this.electronService.ipcRenderer.send('adminDeviceConfig')
    //console.log('read call', cardName)
  }
  adminShiftSaleSummary(event) {
    this.electronService.ipcRenderer.send('adminShiftSaleSummary')
    //console.log('read call', cardName)
  }
  // getTerminalConfig() {
  //   this.electronService.ipcRenderer.send('adminTerminalConfig')
  // }
  mainShiftPause() {

    let shiftStore = JSON.parse(localStorage.getItem("shiftReport"))
    let shiftreportUser = localStorage.getItem("userID")
    shiftStore.forEach(element => {
      if (element.userID == shiftreportUser && element.shiftType == "0") {
        element.shiftState = "4";
        localStorage.setItem("mainShiftUserLock", element.userEmail)
        //var disableUntilReopenShift = true
        localStorage.setItem("disableUntilReOpenShift", "true")
      }

    })
    localStorage.setItem("shiftReport", JSON.stringify(shiftStore))

    this.router.navigate(['/login'])

  }
  closePausedMainShift() {
    this.closingPausedMainShift = true
    localStorage.setItem("closingPausedMainShift", this.closingPausedMainShift.toString())
  }

  reOpenShift() {

    let shiftStore = JSON.parse(localStorage.getItem("shiftReport"))
    let shiftreportUser = localStorage.getItem("userID")
    shiftStore.forEach(element => {
      if (element.userID == shiftreportUser && element.shiftState == "4") {
        element.shiftState = "0";
        this.mainShiftReOpen = false
        // this.mainshiftcloser = false
        this.shiftState = "0"
        this.shiftType = "0"
        element.timeOpened = new Date().getTime();
        localStorage.setItem("disableUntilReOpenShift", "false")
      }

    })
    localStorage.setItem("shiftReport", JSON.stringify(shiftStore))
    localStorage.setItem("shiftReopenedByMainUser", "true")
    localStorage.setItem("hideModalPopup", "true")
  }

  hideModalPop() {
    let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    let userId = localStorage.getItem("userID")

    shiftReports.forEach(element => {
      if ((element.shiftType == "0" && element.shiftState == "0") || (element.shiftType == "1" && element.shiftState == "0")) {
        localStorage.setItem("hideModalPopup", "true")
      } else {

        if (localStorage.getItem("shiftReopenedByMainUser") == "true") {
          localStorage.setItem("hideModalPopup", "true")
        } else {
          localStorage.setItem("hideModalPopup", "false")
        }

      }
    })

  }

  syncData() {
    this.loading = true;
    // this.maxLoopingCount = 600;
    this.isCurrentSync = true;
    this.numOfAttempts = 0;
    $("#continueSyncModal").modal("show")
    this.electronService.ipcRenderer.send('adminSync')
    //console.log('read call', cardName)
  }

  ngOnInit() {
    let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    let userId = localStorage.getItem("userID")

    shiftReports.forEach(element => {
      if (element.shiftState == "3" && element.userID == userId && localStorage.getItem("closingPausedMainShift") == "false") {
        this.closingPausedMainShift = true
        this.statusOfShiftReport = "Main Shift is Closed and Relief Shift is Closed"

      } else
        if (element.shiftState == "3" && element.userID == userId && localStorage.getItem("closingPausedMainShift") == "true") {
          this.closingPausedMainShift = true
          this.statusOfShiftReport = "Main Shift is Closed and Relief Shift is Closed"
        } else
          if (element.shiftState == "3" && element.userID == userId && element.shiftType == "0" && localStorage.getItem("mainShiftClose")) {
            this.shiftType = "0"
            this.shiftState = "3"
            this.mainshiftCloser = true
            this.statusOfShiftReport = "Main Shift is Closed"
            localStorage.setItem("ShiftOpenPauseStatus", this.statusOfShiftReport)
          } else
            if (element.shiftState == "3" && element.userID == userId && element.shiftType == "0") {
              this.shiftType = "0"
              this.shiftState = "3"
              this.statusOfShiftReport = "Main Shift is Closed"

              localStorage.setItem("ShiftOpenPauseStatus", this.statusOfShiftReport)

            } else if (element.shiftState == "0" && element.shiftType == "0" && element.userID == userId) {
              this.shiftState = "0"
              this.shiftType = "0"

              this.statusOfShiftReport = "Main Shift is Opened"
              if (localStorage.getItem("hideModalPopup") == "true") {
                $("#readyForSaleModal").modal('hide');
              } else {
                $("#readyForSaleModal").modal('show');
              }

            } else if (element.shiftState == "4" && element.userID == userId && element.shiftType == "0") {
              this.shiftType = "0"
              this.shiftState = "4"
              this.statusOfShiftReport = "Main Shift is Paused"
              localStorage.setItem("ShiftOpenPauseStatus", this.statusOfShiftReport)
            } else if (element.shiftState == "3" && element.userID == userId && element.shiftType == "1") {
              this.shiftType = "1"
              this.shiftState = "3"
              // if (localStorage.getItem("mainShiftClose") == "true" && localStorage.getItem("mainShiftClose") != undefined) {
              //   this.mainshiftCloser = true
              // } else {
              //   this.shiftType = "1"
              //   this.shiftState = "3"
              //  this.statusOfShiftReport = "Main Shift is Paused "
              // }
              this.statusOfShiftReport = "Main Shift is Paused "
            } else if (element.shiftState == "0" && element.userID == userId && element.shiftType == "1") {
              this.shiftType = "1";
              this.shiftState = "0"
              if (localStorage.getItem("hideModalPopup") == "true") {
                $("#readyForSaleModal").modal('hide');
              } else {
                $("#readyForSaleModal").modal('show');
              }
              this.statusOfShiftReport = "Relief Shift is Opened"
            }
    });

    shiftReports.forEach(element => {
      if (element.userID == localStorage.getItem("userID")) {
        if (element.openingDrawer != undefined && element.openingDrawer != "") {
          this.openingDrawerBal = (Number(this.openingDrawerBal) + element.openingDrawer).toFixed(2)
          this.expectedCash = this.openingDrawerBal
          localStorage.setItem("expectedCash", this.expectedCash)

        }
        if (element.closingDrawer != undefined && element.closingDrawer != "") {
          this.actualCash = (this.actualCash + element.closingDrawer).toFixed(2)
        }
        this.overShort = (this.actualCash - this.expectedCash).toFixed(2)
        this.overShort = Math.abs(this.overShort)
        if (element.initialOpeningTime != 0) {
          this.electronService.ipcRenderer.send('adminSales', Number(element.shiftType), element.initialOpeningTime, element.timeClosed)
          console.log("element.initialOpeningTime, element.timeClosed", element.initialOpeningTime, element.timeClosed)
          this.electronService.ipcRenderer.send('adminSalesPaymentMethod', Number(element.userID), Number(element.shiftType), element.initialOpeningTime, element.timeClosed, null, null, null)
        }

      }

    });

  }


}
