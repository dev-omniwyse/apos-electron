import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-deviceconf',
  templateUrl: './deviceconf.component.html',
  styleUrls: ['./deviceconf.component.css']
})
export class DeviceconfComponent implements OnInit {
  public deviceConfig = []
  public terminalData = []
  public device: any
  public terminalConfig: any
  maxPayAsYouGo: number;
  CURRENT_UNSYNCED_TRANSACTION_NUMBER: 0;
  CURRENT_UNSYNCED_TRANSACTION_VALUE: 0;
  LIFETIME_TRANSACTION_COUNT: 0;
  LIFETIME_TRANSACTION_VALUE: 0;
  constructor() { }

  ngOnInit() {
    this.device = localStorage.getItem("deviceConfigData");
    this.deviceConfig = new Array(JSON.parse(this.device));
    this.terminalConfig = localStorage.getItem("terminalConfigJson");
    this.terminalData = new Array(JSON.parse(this.terminalConfig));
    let deviceData = JSON.parse(localStorage.getItem('deviceInfo'));
    this.CURRENT_UNSYNCED_TRANSACTION_NUMBER = deviceData.CURRENT_UNSYNCED_TRANSACTION_NUMBER;
    this.CURRENT_UNSYNCED_TRANSACTION_VALUE = deviceData.CURRENT_UNSYNCED_TRANSACTION_VALUE;
    this.LIFETIME_TRANSACTION_COUNT = deviceData.LIFETIME_TRANSACTION_COUNT;
    this.LIFETIME_TRANSACTION_VALUE = deviceData.LIFETIME_TRANSACTION_VALUE;
  }

}
