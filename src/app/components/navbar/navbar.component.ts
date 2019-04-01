import { Component, OnInit,Output, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import {formatDate } from '@angular/common';

declare var $: any
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  subscription: any;
  hideHeader = true;
  terminalNumber: any = undefined;
  hideAndShowLogout : Boolean 
  today = new Date();
  versionDate = new Date();
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
    if (userData.shiftState != "3" && userData.shiftType == "0") {
      $("#warning").modal('show');
    }
    else if (userData.shiftState == "3" && userData.shiftType == "1" && localStorage.getItem("closingPausedMainShift") == "true") {
      localStorage.removeItem("shiftReport");
      localStorage.removeItem("mainShiftClose")
      localStorage.removeItem("closingPausedMainShift")
      this.cdtaservice.setterminalNumber(undefined);
      this.router.navigate(['login'])
    }
    else if (userData.shiftState == "3" && userData.shiftType == "1") {
      this.cdtaservice.setterminalNumber(undefined);
      this.router.navigate(['login'])
    }
    else if (userData.shiftState != "3" && userData.shiftType == "1") {
      $("#warning").modal('show');
    }
    else {
      localStorage.removeItem("shiftReport");
      localStorage.removeItem("mainShiftClose")
      localStorage.removeItem("closingPausedMainShift")
      this.cdtaservice.setterminalNumber(undefined);
      this.router.navigate(['login'])
    }
    localStorage.removeItem("userEmail")
  }

  navigateToGenfare(){
    var urlToNavigate = "https://tarc-"+localStorage.getItem("environment")+".gfcp.io";
    this.electronService.ipcRenderer.send('navigateToGenfare',urlToNavigate);
  }

  ngOnInit() {
    let item = localStorage.getItem("header");
    setInterval(() => {
      this.today = new Date();
      }, 1000); 

    setInterval(() => {
      this.today = new Date();
    }, 1000); 
  }
}



