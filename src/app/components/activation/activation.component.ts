import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { Utils } from 'src/app/services/Utils.service';
declare var $: any;
@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.css']
})
export class ActivationComponent implements OnInit {
  carddata: any;
  title = 'Activation-Call Support at the Transit For SetUp Code';
  workType: string;
  form: any;
  password: any;
  organization: string;
  environment = '';
  constructor(private router: Router, private _ngZone: NgZone,
    private electronService: ElectronService) {
    this.environment = localStorage.getItem('environment');
    this.electronService.ipcRenderer.on('verifyCallResult', (event, data) => {
      const activationData = this.validJSON(data);
      if (activationData === true) {
        this._ngZone.run(() => {
          localStorage.removeItem('deviceInfo');
          const deviceInfo = Utils.getInstance.createDeviceInfoDefaultRecord();
          localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
          this.carddata = new Array(JSON.parse(data));
          this.password = this.carddata[0].deviceSetup.password;
          this.organization = this.carddata[0].deviceSetup.organizationName;
          localStorage.setItem('organization', this.organization);
          localStorage.setItem('pass', this.password);
          this.router.navigate(['/verify']);
        });
      } else {
        $('#activationModal').modal({
          backdrop: 'static',
          keyboard: false
        });
      }
    });
  }

  validJSON(data) {
    try {
      JSON.parse(data);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * here sending assetId and setupCode for device login
   *
   * @param {*} form
   * @memberof ActivationComponent
   */
  activationCall(form: any) {
    if (this.save(form)) {
      const data = {
        assetId: form.value.hardware,
        setupCode: form.value.setupid,
      };
      localStorage.setItem('assetId', form.value.hardware);
      this.electronService.ipcRenderer.send('verifycall', data, this.environment);
    }
  }
  save(form: any): boolean {
    if (!form.valid) {
      return false;
    }
    return true;
  }

  /**
   * click on back button it will go to previous screen
   *
   * @param {*} form
   * @memberof ActivationComponent
   */
  goToPrevious(form: any) {
    this.router.navigate(['/setup']);
  }

  ngOnInit() {

  }
}
