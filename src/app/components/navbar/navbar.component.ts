import { Component, OnInit, Output, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { environment } from '../../../environments/environment';
import { SessionServiceApos } from 'src/app/session';


declare var $: any;
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  subscription: any;
  hideHeader = true;
  terminalNumber: any = undefined;
  hideAndShowLogout: Boolean;
  today = new Date();
  versionDate = new Date();
  isSessionExpired: Boolean;


  constructor(private cdtaservice: CdtaService, private router: Router, private _ngZone: NgZone, private sessionService: SessionServiceApos,
    private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {
    this.subscription = this.cdtaservice.headerShowHide$.subscribe(
      mission => {
        if (mission == 'hideHeader') {
          this.hideHeader = false;
        } else {
          this.hideHeader = true;
        }
      });
    this.subscription = this.cdtaservice.terminalNumber$.subscribe(
      mission => {
        this.terminalNumber = mission; 
      });
    this.subscription = this.cdtaservice.goToLogin$.subscribe(
      proceedToLogIn => {
        if (proceedToLogIn == true) {
          this.isSessionExpired = true;
          this.logOut();
          $('#userTimedOut').modal('show');
        } else {
          this.isSessionExpired = false;
        }
      });
  }

  /**
   * User logout functionality based on shift Reports
   *
   * @memberof NavbarComponent
   */

  logOut() {

    this.sessionService.sessionStop();

    const shiftreportUser = localStorage.getItem('userID');
    const shiftreport = JSON.parse(localStorage.getItem('shiftReport'));
    let userData;
    shiftreport.forEach(element => {
      if (element.userID == shiftreportUser) {
        userData = element;
      }
    });
    if (userData.shiftState != '3' && userData.shiftType == '0') {
      (this.isSessionExpired) ? this.router.navigate(['login']) : $('#warning').modal('show');
    } else if (userData.shiftState == '3' && userData.shiftType == '1' && localStorage.getItem('closingPausedMainShift') == 'true') {
      localStorage.removeItem('shiftReport');
      localStorage.removeItem('mainShiftClose');
      localStorage.removeItem('closingPausedMainShift');
      localStorage.removeItem('mainShiftUser');
      this.cdtaservice.setterminalNumber(undefined);
      this.router.navigate(['login']);
    } else if (userData.shiftState == '3' && userData.shiftType == '1') {
      this.cdtaservice.setterminalNumber(undefined);
      this.router.navigate(['login']);
    } else if (userData.shiftState != '3' && userData.shiftType == '1') {
      (this.isSessionExpired) ? this.router.navigate(['login']) : $('#warning').modal('show');
    } else {
      localStorage.removeItem('shiftReport');
      localStorage.removeItem('mainShiftClose');
      localStorage.removeItem('mainShiftUser');
      localStorage.removeItem('closingPausedMainShift');
      this.cdtaservice.setterminalNumber(undefined);
      this.router.navigate(['login']);
    }
    if(this.isSessionExpired == false){
      localStorage.removeItem('deviceLocked');
      localStorage.removeItem('userEmail');
    } else {
      // nothing to do
    }
  }



  /**
   *This Method is used to lock the device
   *
   * @memberof NavbarComponent
   */
  lockDevice() {
    this.router.navigate(['/login']);
    this.cdtaservice.setterminalNumber(undefined);
    localStorage.setItem('deviceLocked', 'true');
  }

  /**
   *This is the function to navigate to browser link of this app
   *
   * @memberof NavbarComponent
   */
  navigateToGenfare() {
    let urlToNavigate = '';
    if (environment.production) {
      urlToNavigate = 'https://link.cdta.org';
    } else {
      urlToNavigate = 'https://cdta-' + localStorage.getItem('environment') + '.gfcp.io';
      this.electronService.ipcRenderer.send('navigateToGenfare', urlToNavigate);
    }
  }

  ngOnInit() {
    // This is the  Date in Header
    setInterval(() => {
      this.today = new Date();
    }, 1000);

  }
}



