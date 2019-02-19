import { Component, NgZone, OnInit } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

declare var $: any

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  openShift = true
  mainShiftClosed = false
  mainShiftPaused = false
  shiftType = true


  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, ) {

    this.electronService.ipcRenderer.on('adminSalesResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        localStorage.setItem("salesReport", data)
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
        //this.show = true;
        this._ngZone.run(() => {
          //  this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('adminDeviceConfigResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        localStorage.setItem("deviceConfigData", data);
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('adminTerminalConfigResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        localStorage.setItem("terminalConfig", data);
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('adminShiftSaleSummaryResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          //this.router.navigate(['/addproduct'])
        });
      }
    });


  }

  mainShiftClosing() {
    this.mainShiftClosed = true
    localStorage.setItem("mainShiftClosed", this.mainShiftClosed.toString())
  }
  getSalesReports(event) {
    this.electronService.ipcRenderer.send('adminSales', localStorage.getItem("userId"), localStorage.getItem("sales"))
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
  adminSync(event) {
    this.electronService.ipcRenderer.send('adminSync')
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
  getTerminalConfig() {
    this.electronService.ipcRenderer.send('adminTerminalConfig')
  }
  mainShiftPause() {
    this.mainShiftPaused = true
    localStorage.setItem("mainShiftPaused", this.mainShiftPaused.toString())
    localStorage.removeItem("openShift")
    this.router.navigate(['/login'])
  }

  reOpenShift() {
    this.mainShiftPaused = false
    this.openShift = false
    this.mainShiftPaused = false
    localStorage.removeItem("mainShiftClosed")
    localStorage.removeItem("mainShiftPaused")
  }

  ngOnInit() {
    let reliefShif = JSON.parse(localStorage.getItem("sales"));

    if (reliefShif.shiftType == "main") {
      this.shiftType = true
    }else if(reliefShif.shiftType == "relief") {
      this.shiftType = false
    }
    
    let shift = JSON.parse(localStorage.getItem("openShift"));
    if (shift != undefined || shift != null) {
      this.openShift = false
      $("#readyForSaleModal").modal('show');
    }
    else if (localStorage.getItem("mainShiftClosed") == "true") {
      this.mainShiftClosed = true
    } else
      if (localStorage.getItem("mainShiftPaused") == "true") {
        this.mainShiftPaused = true
        this.mainShiftClosed = false
      }
      else {
        this.openShift = true

    }

  }


}
