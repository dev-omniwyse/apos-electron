import { Component, OnInit, NgZone } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ElectronService } from 'ngx-electron';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
declare var $: any;

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.css']
})
export class EnvironmentComponent implements OnInit {
  showView = false;
  isFromSetup = false;
  selectedEnvironment = {};
  environments = [{ 'name': 'DEMO', 'value': 'demo' }, { 'name': 'DEV', 'value': 'dev' },
   { 'name': 'INTG', 'value': 'intg' }, { 'name': 'LOCAL', 'value': 'local' },
    { 'name': 'PREP', 'value': 'prep' }, { 'name': 'QA', 'value': 'qa' },
    { 'name': 'QE', 'value': 'qe' }, { 'name': 'STAGING', 'value': 'staging' },
    { 'name': 'UAT', 'value': 'uat' }];

  constructor(private cdtaservice: CdtaService, private electronService: ElectronService, private router: Router, private _ngZone: NgZone) {
    this.electronService.ipcRenderer.on('switchLoginCallResult', (event, data) => {
      if (data !== undefined && data !== '' && this.isFromSetup) {
        this.isFromSetup = false;
        localStorage.setItem('terminalConfigJson', data);
        this._ngZone.run(() => {
          if (JSON.parse(data).EquipmentId !== 0) {
            this.cdtaservice.announceHeaderShowHide('hideHeader');
            this.router.navigate(['/login']);
          } else {
            this.showView = true;
          }
        });
      }
    });
    if (environment.production) {
      this.router.navigate(['/setup']);
    }
  }

  ngOnInit() {
    this.cdtaservice.announceHeaderShowHide('hideHeader');
    this.isFromSetup = true;
    this.electronService.ipcRenderer.send('switchlogincall');
  }

  /**
   * Selecting Environments and showing pop up here
   *
   * @param {*} environment
   * @memberof EnvironmentComponent
   */
  selectEnvironment(environments) {
    this.selectedEnvironment = environments.name;
    $('#environmentSetupModal').modal({
      backdrop: 'static',
      keyboard: false
    });
    localStorage.setItem('environment', environments.value);
  }
  /**
   * when you click on continue button it is navigating to setup component
   *
   * @memberof EnvironmentComponent
   */
  navigateToDashboard() {
    this.router.navigate(['/setup']);
  }

}
