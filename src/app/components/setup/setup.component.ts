import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { ElectronService } from 'ngx-electron';
import { CdtaService } from 'src/app/cdta.service';
import {environment} from '../../../environments/environment'
@Component({
    selector: 'app-setup',
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {

    title = 'Please make sure the following peripherals are attached:';
    form: any;
    showView = false;
    isFromSetup = false;
    isProduction: boolean;
    constructor(private route: ActivatedRoute,private router: Router, private cdtaservice: CdtaService, private electronService:ElectronService,private _ngZone: NgZone,private ref: ChangeDetectorRef, private http: HttpClient) {
        console.log(environment.production)
        this.isProduction = environment.production;

        // this.electronService.ipcRenderer.on('switchLoginCallResult', (event, data) => {
        //     if (data != undefined && data != "" && this.isFromSetup) {
        //         this.isFromSetup = false;
        //         localStorage.setItem('terminalConfigJson',data)
        //         this._ngZone.run(() => {
        //           if(JSON.parse(data).EquipmentId !=0){
        //             this.cdtaservice.announceHeaderShowHide("hideHeader");
        //             this.router.navigate(['/login'])
        //           } else {
        //               this.showView = true;
        //           }
        //         });
        //     }
        // });
    }

    ngOnInit() {
        this.cdtaservice.announceHeaderShowHide("showHeader");
        this.isFromSetup = true;
        if(this.isProduction) {
            localStorage.clear()
            localStorage.setItem('environment','prod');
        } else {
            var environment = localStorage.getItem('environment');
            localStorage.clear();

            localStorage.setItem('environment', environment);
        }
     
    }

    ngOnChanges() {
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
