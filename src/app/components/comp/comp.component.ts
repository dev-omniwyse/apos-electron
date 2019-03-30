
import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { TransactionService } from 'src/app/services/Transaction.service';
import { MediaType, TICKET_GROUP, TICKET_TYPE } from 'src/app/services/MediaType';
@Component({
  selector: 'app-comp',
  templateUrl: './comp.component.html',
  styleUrls: ['./comp.component.css']
})
export class CompComponent implements OnInit {
  @Output() processCompensation = new EventEmitter();
  @Output() processCompensationCancel = new EventEmitter();
  @Output() compensationReason = new EventEmitter();
  @Input() reason: boolean;
  @Input() reasonForComp: string;

  // public reason: Boolean = true
  // public reasonForComp: string
  public buttonArray = ["DEFECTIVE CARD", "LOST CARD", "SCHEDULE DELAYS", "OTHERS"]
  constructor(private cdtaservice: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {
   
    


  }


  compReason(value) {
    this.compensationReason.emit(value);
    // this.reasonForComp = value
    // if (this.reason == true && value == "OTHERS") {
    //   this.reason = false
    //   this.reasonForComp = ""
    // } else {
    //   localStorage.setItem("compReason", this.reasonForComp)
    // }
  }
  compNavigate() {
    this.processCompensationCancel.emit();
    // if (this.reason == true) {
    //   this.router.navigate(['/addproduct'])
    // } else if (this.reason == false) {
    //   this.reason = true
    // }
  }

  compensation() {
    //this.electronService.ipcRenderer.send('compensation')
    //console.log('read call', cardName)
    localStorage.setItem("compReason", this.reasonForComp);
    this.processCompensation.emit();
    // console.log('reason for comp', this.reasonForComp)
    // this.router.navigate(['/carddata'])

  }


  

  

  ngOnInit() {

  }




  

}
