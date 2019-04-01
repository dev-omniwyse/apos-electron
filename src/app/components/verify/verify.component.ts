import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  carddata: any
  title = '';
  form: any;
  next: any;
  something: any;
  password:any
  AgencyName:any
  organization :any
  environment="";
  @Output() hideHeader = new EventEmitter();
  constructor(private cdtaservice: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {

    this.environment = localStorage.getItem('environment');
        this.electronService.ipcRenderer.on('activationCallResult', (event, data) => {
        if (data != undefined && data != "") {
          this._ngZone.run(() => {
            this.cdtaservice.announceHeaderShowHide("hideHeader");
            this.router.navigate(['/login'])
          });
      }
  });
  }


  verifyCall() {
    
      var data = {
        assetId: localStorage.getItem("assetId"),
        password: localStorage.getItem("pass"),
      }
    this.electronService.ipcRenderer.send('activationcall', this.environment, data)
   }


  goToPrevious(form: any) {
      
    // Navigate to the personal page
    this.router.navigate(['/personal']);

}

goToNext(form: any) {
    this.cdtaservice.announceHeaderShowHide("hideHeader");
    this.router.navigate(['/login']);

// }
}
  ngOnInit() {
    this.organization = localStorage.getItem("organization")
  }

}