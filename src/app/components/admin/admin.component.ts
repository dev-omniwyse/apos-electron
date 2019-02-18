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

  public openShift = true
  public closeShift = true
  public mainShiftClosed = false
  public mainShiftPaused = false

  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, ) {

    this.electronService.ipcRenderer.on('adminSalesResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
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
  closeShifts() {
    localStorage.setItem("closeShift", this.closeShift.toString())
  }
  adminSales(event) {
    this.electronService.ipcRenderer.send('adminSales')
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
  adminDeviceConfig(event) {
    this.electronService.ipcRenderer.send('adminDeviceConfig')
    //console.log('read call', cardName)
  }
  adminShiftSaleSummary(event) {
    this.electronService.ipcRenderer.send('adminShiftSaleSummary')
    //console.log('read call', cardName)
  }

  mainShiftPause() {
    this.mainShiftPaused = true
    localStorage.setItem("mainShiftPaused", this.mainShiftPaused.toString())
    this.router.navigate(['/login'])
  }

  reOpenShift(){
    this.mainShiftPaused = false
    localStorage.removeItem("mainShiftClosed")
  }

  ngOnInit() {
    let shift = JSON.parse(localStorage.getItem("openShift"));
    if (localStorage.getItem("mainShiftPaused") == "true") {
      this.mainShiftPaused = true
      this.mainShiftClosed = false
      this.openShift = false
    }else
    if (shift == undefined || shift == null) {
      this.openShift = true
    } else if (localStorage.getItem("mainShiftClosed") == "true") {
      this.mainShiftClosed = true
    }
    else {
      this.openShift = false
      $("#readyForSaleModal").modal('show');

    }

  }


}
