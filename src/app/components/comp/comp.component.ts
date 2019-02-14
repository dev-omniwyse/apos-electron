
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
  constructor(private cdtaservice: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) { }

  compReason() {
    if (this.reason == true) {
      this.reason = false
    }
  }
  compNavigate() {
    if (this.reason == true) {
      this.router.navigate(['/addproduct'])
    } else if (this.reason == false) {
      this.reason = true
    }
  }
  ngOnInit() {

  }

}
