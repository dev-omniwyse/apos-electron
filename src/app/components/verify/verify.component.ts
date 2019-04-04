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

    // this.electronService.ipcRenderer.on('verifyCallResult', (event, data) => {
    //   alert(data);
    //   if (data != undefined && data != "") {
    //     alert(data);
    //     this._ngZone.run(() => {
    //       this.carddata = new Array(JSON.parse(data));
    //       this.password =  this.carddata.password;
    //       console.log('this.carddata', this.carddata);
    //       // this.router.navigate(['/carddata'])
    //     });
    //   }
    // });
    this.environment = localStorage.getItem('environment');
        this.electronService.ipcRenderer.on('activationCallResult', (event, data) => {
          
        if (data != undefined && data != "") {
          this._ngZone.run(() => {
            this.cdtaservice.announceHeaderShowHide("hideHeader");
            this.router.navigate(['/login'])
              // this.carddata = new Array(JSON.parse(data));
              // console.log('this.carddata', this.carddata);
             
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
    this.router.navigate(['/activation']);

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