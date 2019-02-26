import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-shift-sales-summary',
  templateUrl: './shift-sales-summary.component.html',
  styleUrls: ['./shift-sales-summary.component.css']
})
export class ShiftSalesSummaryComponent implements OnInit {
  sales = []
  selectedValue: any
  salesData: any
  salesPaymentData : any

  constructor(private cdtaservice: CdtaService, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {

    this.electronService.ipcRenderer.on('adminSalesResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        localStorage.setItem("allSales", data)
        this.salesData = JSON.parse(data);
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
  }

  ngOnInit() {


    this.sales = JSON.parse(localStorage.getItem("shiftReport"));
    //   let all = {
    //     userEmail:"--All--",
    //     userID: "",
    //     shiftID: "0",
    //     shiftType: "",
    //     shiftState: "3",
    //     openingDrawer: "0.00",
    //     closingDrawer: "0.00",
    //     initialOpeningTime: 0,
    //     timeOpened: 0,
    //     timeClosed: 0,
    //     userThatClosedShift: ""
    // }
    // this.sales.push(all)

    // this.cdtaservice.getsalesJson().subscribe(data => {
    //   if (data != '') {
    //     console.log("sales json", data)
    //     this.salesData = data
    //   }

    // });
    this.salesData = JSON.parse(localStorage.getItem("allSales"));
    
    this.cdtaservice.getsalesPaymentJson().subscribe(data => {
      if (data != '') {
        console.log("sales json", data)
        this.salesPaymentData = data
      }

    });
  }

  hidePopUp() {
    // this.hideModalPopup = true
    // localStorage.setItem("hideModalPopup",this.hideModalPopup.toString())
    let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    let userId = localStorage.getItem("userID")
    shiftReports.forEach(element => {
      if ((element.shiftType == "0" && element.shiftState == "0") || (element.shiftType == "1" && element.shiftState == "0")) {
        localStorage.setItem("hideModalPopup", "true")
      } else {
        localStorage.setItem("hideModalPopup", "false")
      }
    })
  }

  shiftSaleSummary() {
    console.log("selectedValue:", this.selectedValue)
    // console.log("saleSummary", JSON.parse(saleSummary))
    this.electronService.ipcRenderer.send('adminSales', Number(this.selectedValue.shiftType), this.selectedValue.initialOpeningTime, this.selectedValue.timeClosed)
  }

}
