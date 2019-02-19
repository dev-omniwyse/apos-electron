import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { ElectronService } from 'ngx-electron';
import { CdtaService } from 'src/app/cdta.service';
@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {

  title = 'Please make sure the following peripherals are attached:';
   
    form: any;
    showView = false;
    constructor(private router: Router, private cdtaservice: CdtaService, private electronService:ElectronService,private _ngZone: NgZone,private ref: ChangeDetectorRef, private http: HttpClient) {
        this.electronService.ipcRenderer.on('switchLoginCallResult', (event, data) => {
            if (data != undefined && data != "") {
                alert(data);
                localStorage.setItem('terminalConfigJson',data)
                this._ngZone.run(() => {
                  if(JSON.parse(data).EquipmentId !=0){
                    this.cdtaservice.announceHeaderShowHide("hideHeader");
                    this.router.navigate(['/login'])
                  } else {
                      this.showView = true;
                  }

                   
                    // this.carddata = new Array(JSON.parse(data));
                    // console.log('this.carddata', this.carddata);
                   
                });
            }
        });
    }

    ngOnInit() {
        this.cdtaservice.announceHeaderShowHide("showHeader");
        this.electronService.ipcRenderer.send("switchlogincall");
    }

    ngOnChanges(){
        // this.electronService.ipcRenderer.send("switchlogincall");
    }

    save(form: any): boolean {
        if (!form.valid) {
            return false;
        }  
      
        return true;
    }

    goToNext(form: any) {
        if (this.save(form)) {
            // Navigate to the work page
            this.router.navigate(['/activation']);
        }
    }

}
