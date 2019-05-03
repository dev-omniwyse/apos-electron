import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CdtaService } from 'src/app/cdta.service';
import { environment } from '../../../environments/environment';
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
    constructor(private router: Router, private cdtaservice: CdtaService) {
        this.isProduction = environment.production;
    }

    /**
     * Intializing the component
     * we will hide the header and will make a switchlogincall
     * here we are setting the environment name in localStorage
     * @memberof SetupComponent
     */
    ngOnInit() {
        this.cdtaservice.announceHeaderShowHide('showHeader');
        this.isFromSetup = true;
        if (this.isProduction) {
            localStorage.clear();
            localStorage.setItem('environment', 'prod');
        } else {
            const environmentName = localStorage.getItem('environment');
            localStorage.clear();

            localStorage.setItem('environment', environmentName);
        }
    }

    /**
     * checking the form is valid or not
     *
     * @param {*} form
     * @returns {boolean}
     * @memberof SetupComponent
     */
    save(form: any): boolean {
        if (!form.valid) {
            return false;
        }

        return true;
    }

    /**
     * when we click on Next button navigating to activation screen
     *
     * @param {*} form
     * @memberof SetupComponent
     */
    goToNext(form: any) {
        if (this.save(form)) {
            this.router.navigate(['/activation']);
        }
    }

}
