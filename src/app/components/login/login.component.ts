import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CdtaService } from '../../cdta.service';
import { ElectronService } from 'ngx-electron';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    username: string;
    password: string;
    errorMsg: Boolean = false;
    carddata: any

    usersData = {
        "users": [
            {
                "username": "admin@cdta.com",
                "password": "123456aA"
            },
            {
                "username": "superadmin@cdta.com",
                "password": "123456aA"
            }


        ]
    }

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private cdtaservice: CdtaService, private _ngZone: NgZone, private electronService: ElectronService
    ) { 

        this.electronService.ipcRenderer.on('loginCallResult', (event, data) => {
            if (data != undefined && data != "") {
               // this.show = true;

                this._ngZone.run(() => {
                   // this.carddata = new Array(JSON.parse(data));
                   // console.log('this.carddata', this.carddata);
                    this.router.navigate(['/readcard'])
                });
            }
        });
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        // console.log(process.env.PATH);
       // let shift = JSON.parse(localStorage.getItem("openShift"));
      //  if (shift != undefined || shift != null) {
        localStorage.removeItem("openShift")
        localStorage.removeItem("closeShift")
        localStorage.removeItem("mainShiftClosed")
       // } 

    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.cdtaservice.login(this.f.username.value, this.f.password.value)
            .subscribe((data: any) => {
                this.router.navigate(['/readcard']);
            },
                error => {
                    // this.alertService.error(error);
                    this.loading = false;
                });
    }


    jsonValues() {
        this.cdtaservice.jsonData()
            .subscribe((data: any) => {
                this.router.navigate(['/readcard']);

                console.log('json data', data)
                var base64 = btoa(data.aws.credentials.accessKey + "|" + data.aws.credentials.secretKey + '|' + data.aws.credentials.sessionId)
                console.log('base64', base64);

            },
                error => {
                    // this.alertService.error(error);
                    // this.loading = false;
                });
    }

    Login() {
        // for (var a = 0; a < this.usersData.users.length; a++) {
        //     if (this.username == this.usersData.users[a].username && this.password == this.usersData.users[a].password) {
        //         this.router.navigate(['/readcard']);
        //     }else{
        //         this.errorMsg = true
        //     }
        // }
        var user = {
            username: this.username,
            password: this.password
        }
        this.electronService.ipcRenderer.send('logincall', user)
        

    }
}

