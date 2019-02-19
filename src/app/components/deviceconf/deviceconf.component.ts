import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-deviceconf',
  templateUrl: './deviceconf.component.html',
  styleUrls: ['./deviceconf.component.css']
})
export class DeviceconfComponent implements OnInit {
public deviceConfig =[]
public terminalData = []
public device : any
public terminalConfig : any
  constructor() { }

  ngOnInit() {
    this.device = localStorage.getItem("deviceConfigData");
    this.deviceConfig = new Array(JSON.parse(this.device));
    this.terminalConfig = localStorage.getItem("terminalConfig");
    this.terminalData = new Array(JSON.parse(this.terminalConfig))
  }

}
