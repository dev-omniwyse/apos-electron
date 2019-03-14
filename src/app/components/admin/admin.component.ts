import { Component, NgZone, OnInit, ɵMethodFn } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { MethodFn } from '@angular/core/src/reflection/types';
import { MethodCall } from '@angular/compiler';
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
  openingDrawerBal: Number
  synCompleted: any
  numOfAttempts = 0;
  maxLoopingCount = 600;
  public deviceInfoNew: Boolean = false
  intervalSyc: any
  configData: any
  SyncMethod: any
  isCurrentSync: Boolean = false;
  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, ) {

    this.electronService.ipcRenderer.on('adminSalesResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        localStorage.setItem("allSales", data)
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
        return JSON.parse(data)
      }
    });
    this.electronService.ipcRenderer.on('adminSalesPaymentResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        localStorage.setItem("paymentTypes", data)
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
          this.isCurrentSync = false;
          clearTimeout(timer);
          // clearInterval(this.intervalSyc);
          $("#continueSyncModal").modal("hide")
          $("#successSyncModal").modal("show")
          console.log("sync has been done buddy")
          // this.electronService.ipcRenderer.removeListener("isSyncCompletedResult",this.SyncMethod);
          // this.electronService.ipcRenderer.removeListener("adminSyncResult");
          // if (isSyncDone) {
          // this.electronService.ipcRenderer.send('adminDeviceConfig')
          // console.log("this.deviceInfoNew ", this.deviceInfoNew)
          // if (this.deviceInfoNew == true) {
          //   var UpdateDeviceConfig = JSON.parse(localStorage.getItem("deviceConfigData"))
          //   UpdateDeviceConfig.CURRENT_UNSYNCED_TRANSACTION_VALUE = 0;
          //   UpdateDeviceConfig.CURRENT_UNSYNCED_TRANSACTION_NUMBER = 0;
          //   localStorage.setItem("deviceConfigData", UpdateDeviceConfig)
          //  // $("#successSyncModal").modal("show")
          // }
          // } else {
          //   console.log("Sync Timeout");
          // }
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



  getSalesReports(event) {
    let reliefShif = JSON.parse(localStorage.getItem("shiftReport"));
    reliefShif.forEach(element => {
      console.log("sales report", element.shiftType, element.timeOpened, element.timeClosed)
      this.electronService.ipcRenderer.send('adminSales', Number(element.shiftType), element.initialOpeningTime, element.timeClosed)
      this.electronService.ipcRenderer.send('adminSalesPaymentMethod', Number(element.userID), Number(element.shiftType), element.initialOpeningTime, element.timeClosed, null, null, null)
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
  }
  hideModalPop() {
    let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    let userId = localStorage.getItem("userID")

    shiftReports.forEach(element => {
      if ((element.shiftType == "0" && element.shiftState == "0") || (element.shiftType == "1" && element.shiftState == "0")) {
        localStorage.setItem("hideModalPopup", "true")
      } else {
        // if((element.shiftState == "4"|| element.shiftState == "0") && element.userID == userId){
        //   localStorage.setItem("hideModalPopup", "true") 
        // }else{
        //   localStorage.setItem("hideModalPopup", "false")
        // }
        if(localStorage.getItem("shiftReopenedByMainUser") == "true"){

          localStorage.setItem("hideModalPopup", "true") 
        }else{
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

      if (element.shiftState == "3" && element.userID == userId && localStorage.getItem("closingPausedMainShift")) {
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
      if (element.userID == userId) {
        this.openingDrawerBal = element.openingDrawer
        // } else if (element.shiftType == "1" && element.userID == userId) {
        //   this.openingDrawerBal = element.openingDrawer
      }
    });

    // let shift = JSON.parse(localStorage.getItem("openShift"));
    // if (shift != undefined || shift != null) {
    //   this.openShift = false
    //   $("#readyForSaleModal").modal('show');
    // }
    // else if (localStorage.getItem("mainShiftClosed") == "true") {
    //   this.mainShiftClosed = true
    // } else
    //   if (localStorage.getItem("mainShiftPaused") == "true") {
    //     this.mainShiftPaused = true
    //     this.mainShiftClosed = false
    //   }
    //   else {
    //     this.openShift = true

    //   }

  }


}
