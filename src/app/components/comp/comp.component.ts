
import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-comp',
  templateUrl: './comp.component.html',
  styleUrls: ['./comp.component.css']
})
export class CompComponent implements OnInit {
  public reason: Boolean = true
  public reasonForComp: string
  public buttonArray = ["DEFECTIVE CARD", "LOST CARD", "SCHEDULE DELAYS", "OTHERS"]
  constructor(private cdtaservice: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {


    this.electronService.ipcRenderer.on('compensationResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          //this.router.navigate(['/addproduct'])
        });
      }
    });

  }

  compReason(value) {
    this.reasonForComp = value
    if (this.reason == true && value == "OTHERS") {
      this.reason = false
    } else {
      // this.reasonForComp = value
      localStorage.setItem("compReason", this.reasonForComp)
    }
  }
  compNavigate() {
    if (this.reason == true) {
      this.router.navigate(['/addproduct'])
    } else if (this.reason == false) {
      this.reason = true
    }
  }

  compensation() {
    //this.electronService.ipcRenderer.send('compensation')
    //console.log('read call', cardName)
    localStorage.setItem("compReason", this.reasonForComp)
    console.log('reason for comp', this.reasonForComp)
    this.router.navigate(['/carddata'])
  }

  ngOnInit() {

  }

}
