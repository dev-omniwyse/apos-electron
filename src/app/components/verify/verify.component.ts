import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';
import { CdtaService } from '../../cdta.service';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  carddata: any;
  title = '';
  form: any;
  next: any;
  something: any;
  password: any;
  AgencyName: any;
  organization: any;
  environment = '';
  @Output() hideHeader = new EventEmitter();
  constructor(private cdtaservice: CdtaService, private router: Router, private _ngZone: NgZone,
    private electronService: ElectronService) {
    this.environment = localStorage.getItem('environment');
    this.electronService.ipcRenderer.on('activationCallResult', (event, data) => {
      if (data !== undefined && data !== '') {
        this._ngZone.run(() => {
          this.cdtaservice.announceHeaderShowHide('hideHeader');
          this.router.navigate(['/login']);
        });
      }
    });
  }


  /**
   * passing assetId and password for device activation
   *
   * @memberof VerifyComponent
   */
  verifyCall() {
    const data = {
      assetId: localStorage.getItem('assetId'),
      password: localStorage.getItem('pass'),
    };
    this.electronService.ipcRenderer.send('activationcall', this.environment, data);
  }


  /**
   * if you click on No button on verify component, it will go to previous activation screen
   *
   * @param {*} form
   * @memberof VerifyComponent
   */
  goToPrevious(form: any) {
    this.router.navigate(['/activation']);

  }

  /**
   * navigating to login screen
   *
   * @param {*} form
   * @memberof VerifyComponent
   */
  goToNext(form: any) {
    this.cdtaservice.announceHeaderShowHide('hideHeader');
    this.router.navigate(['/login']);

    // }
  }
  /**
   * Intializing the component
   * getting organization name from local storage
   * @memberof VerifyComponent
   */
  ngOnInit() {
    this.organization = localStorage.getItem('organization');
  }
}
