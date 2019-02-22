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
  sales: []

  constructor(private cdtaservice: CdtaService, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {

    this.electronService.ipcRenderer.on('adminSalesResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        localStorage.setItem("allSales", data)
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
  }

  ngOnInit() {

    this.sales = JSON.parse(localStorage.getItem("shiftReport"));
  }

  shiftSaleSummary(saleSummary) {
    console.log("saleSummary", saleSummary)
    this.electronService.ipcRenderer.send('adminSales', Number(saleSummary.shiftType), saleSummary.initialOpeningTime, saleSummary.timeClosed)
  }

}
