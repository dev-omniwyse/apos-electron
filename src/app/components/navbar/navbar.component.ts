import { Component, OnInit,Output, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
declare var $ : any
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  subscription: any;
  hideHeader = true;
terminalNumber:any = "";
  // @Output()  hideHeader;
  constructor(private cdtaservice: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {
    this.subscription = this.cdtaservice.headerShowHide$.subscribe(
      mission => {
        if (mission == "hideHeader")
          this.hideHeader = false;
        else
          this.hideHeader = true;
      });
      this.subscription = this.cdtaservice.terminalNumber$.subscribe(
        mission => {
         this.terminalNumber = mission;
        });
  }

  logOut() {
    console.log("logging out");
    let shiftreportUser = localStorage.getItem("userID")
    let shiftreport = JSON.parse(localStorage.getItem("shiftReport"))
    let userData
    shiftreport.forEach(element => {
      if (element.userID == shiftreportUser) {
        userData = element
      }
    });
    if (userData.shiftState !="3") {
      $("#warning").modal('show');
    } else {
      localStorage.removeItem("shiftReport");
      localStorage.removeItem("mainShiftClose")
      localStorage.removeItem("closingPausedMainShift")
      this.router.navigate(['/login'])
    }
    // if (shiftreportUser != undefined) {
    //   localStorage.removeItem("shiftReport")
    //   this.router.navigate(['/login'])
    // }



    //console.log('read call', cardName)
  }

  ngOnInit() {
    let item = localStorage.getItem("header");
  }

}



