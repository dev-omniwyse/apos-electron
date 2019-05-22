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
  sales = [];
  selectedValue: any = 0;
  selectedValues: any;
  salesData: any;
  salesPaymentData: any;
  public totalSold: any = 0;
  public backendPaymentReport = [];
  public backendSalesReport = [];
  constructor(private cdtaservice: CdtaService, private route: ActivatedRoute,
    private router: Router, private _ngZone: NgZone, private electronService: ElectronService,
     private ref: ChangeDetectorRef, private http: HttpClient) {

    this.electronService.ipcRenderer.on('allSalesResult', (event, data, userID, shiftType) => {
      if (data != undefined && data.length != 0) {
        this._ngZone.run(() => {
          if (this.selectedValue == 0) {
            this.salesData = JSON.parse(data);
            // tslint:disable-next-line:prefer-const
            let salesReport: any = JSON.parse(data);
            for (let report = 0; report < salesReport.length; report++) {
              salesReport[report].userID = userID;
              salesReport[report].shiftType = shiftType;
              this.backendSalesReport.push(salesReport[report]);
            }
            this.salesData = cdtaservice.getUniqueSaletReport(this.backendSalesReport);
          } else {
            this.backendSalesReport = [];
            this.salesData = JSON.parse(data);

          }
        });
      }
    });

    this.electronService.ipcRenderer.on('allPaymentsResult', (event, data, userID, shiftType) => {
      if (data != undefined && data.length != 0) {
        this._ngZone.run(() => {
          if (this.selectedValue == 0) {
            // tslint:disable-next-line:prefer-const
            let paymentReport: any = JSON.parse(data);
            for (let report = 0; report < paymentReport.length; report++) {
              paymentReport[report].userID = userID;
              paymentReport[report].shiftType = shiftType;
              this.totalSold = +(this.totalSold + paymentReport[report].paymentAmount).toFixed(2);
              this.backendPaymentReport.push(paymentReport[report]);
            }
            this.salesPaymentData = cdtaservice.iterateAndFindUniquePaymentTypeString(this.backendPaymentReport);
          } else {
            this.totalSold = 0.00;
            this.backendPaymentReport = [];
            JSON.parse(data).forEach(element => {
              this.totalSold = +(this.totalSold + element.paymentAmount).toFixed(2);
            });
            this.salesPaymentData = JSON.parse(data);
          }
        });
        return this.salesPaymentData;
      }
    });

    this.electronService.ipcRenderer.on('printSummaryReportResult', (event, data) => {
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
        });
      }
    });

    this.electronService.ipcRenderer.on('printReceiptHeaderResult', (event, data) => {
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
        });
      }
    });

    this.electronService.ipcRenderer.on('printSummaryPaymentsReportResult', (event, data) => {
      if (data != undefined && data != '') {
        console.log('printSummaryPaymentsReportResult Done', data);
        this.salesPaymentData = JSON.parse(data);
        this._ngZone.run(() => {
        });
      }
    });
  }


  ngOnInit() {

    this.sales = JSON.parse(localStorage.getItem('shiftReport'));
    this.selectedValue = 0;
    console.log('this.selectedValue', this.selectedValue);
    const shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
    // To Get All Shift Users Sales and their Payments
    shiftStore.forEach(element => {
      this.electronService.ipcRenderer.send('allSales',
      Number(element.shiftType), element.initialOpeningTime, element.timeClosed, Number(element.userID));
      this.electronService.ipcRenderer.send('allPayments',
      Number(element.userID), Number(element.shiftType), element.initialOpeningTime, element.timeClosed, null, null, null);
    });
  }

  /**
   *This function is to hide or show popup based on shifts opening/closing
   *
   * @memberof ShiftSalesSummaryComponent
   */

  hidePopUp() {
    const shiftReports = JSON.parse(localStorage.getItem('shiftReport'));
    shiftReports.forEach(element => {
      if ((element.shiftType == '0' && element.shiftState == '0') || (element.shiftType == '1' && element.shiftState == '0')|| (element.shiftType == 'unknown' && element.shiftState == '0')) {
        localStorage.setItem('hideModalPopup', 'true');
      } else if (element.shiftState == '3' && element.userID == localStorage.getItem('userID')) {
        localStorage.setItem('hideModalPopup', 'false');
      }
    });

    this.electronService.ipcRenderer.removeAllListeners('allSalesResult');
    this.electronService.ipcRenderer.removeAllListeners('allPaymentsResult');
  }

  /**
   *This Method to get sales and payments of respective shift users
   *
   * @memberof ShiftSalesSummaryComponent
   */
  shiftSaleSummary() {
    if (this.selectedValues == 0) {
      this.selectedValue = 0;
      const shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
      this.totalSold = 0;
      this.backendPaymentReport = [];
      this.backendSalesReport = [];
      shiftStore.forEach(element => {
        this.electronService.ipcRenderer.send('allSales',
        Number(element.shiftType), element.initialOpeningTime, element.timeClosed, Number(element.userID));
        this.electronService.ipcRenderer.send('allPayments',
        Number(element.userID), Number(element.shiftType), element.initialOpeningTime, element.timeClosed, null, null, null);
      });
    } else {
      this.selectedValue = this.selectedValues;
      this.electronService.ipcRenderer.send('allSales',
      Number(this.selectedValues.shiftType), this.selectedValues.initialOpeningTime,
      this.selectedValues.timeClosed, Number(this.selectedValues.userID));
      this.electronService.ipcRenderer.send('allPayments',
      Number(this.selectedValues.userID), Number(this.selectedValues.shiftType),
      this.selectedValues.initialOpeningTime, this.selectedValues.timeClosed, null, null, null);
    }
  }

  /**
   * This Method To Print The Shift's Sales Summary for Particular and All Users.
   *
   * @memberof ShiftSalesSummaryComponent
   */
  printSummaryReceipt() {
    // tslint:disable-next-line:prefer-const
    let specificUser = [];
    if (this.selectedValue == 0) {
      this.cdtaservice.printAllOrSpecificShiftData(null);
    } else {
      specificUser.push(this.selectedValue);
      this.cdtaservice.printAllOrSpecificShiftData(specificUser);
    }
  }

}
