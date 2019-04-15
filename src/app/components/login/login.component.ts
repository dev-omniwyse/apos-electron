import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CdtaService } from '../../cdta.service';
import { ElectronService } from 'ngx-electron';
import { Utils } from 'src/app/services/Utils.service';

declare var $: any

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    public loading: Boolean = false;
    //loading = false;
    submitted = false;
    returnUrl: string;
    username: string;
    password: string;
    userdata: any
    errorMsg: string = ""
    carddata: any
    shiftType: any
    shiftState: any
    public statusOfShiftReport: string
    public hideAndShowLogout: Boolean = false
    public lockedByUser: string = ''
    public ownedByUser: string = ''
    public statusOfShiftReportBoolean: Boolean = false
    public lockedByUserBoolean: Boolean = false
    public ownedByUserBoolean: Boolean = false
    shiftReport: any = [
        {
            userEmail: "",
            userID: "",
            shiftID: "0",
            shiftType: "0",
            shiftState: "3",
            openingDrawer: 0.00,
            closingDrawer: 0.00,
            initialOpeningTime: 0,
            timeOpened: 0,
            timeClosed: 0,
            userThatClosedShift: ""
        }
    ]




    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private cdtaservice: CdtaService, private _ngZone: NgZone, private electronService: ElectronService
    ) {

        this.electronService.ipcRenderer.on('loginCallResult', (event, data) => {
            if (data != undefined && data != "") {
                // this.loading = false
                let localDeviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
                if(null == localDeviceInfo || undefined == localDeviceInfo){
                    let deviceInfo = Utils.getInstance.createDeviceInfoDefaultRecord();
                    localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
                }                
                this.userdata = JSON.parse(data)
                localStorage.removeItem("readCardData");
                localStorage.setItem("userID", this.userdata.personId)
                localStorage.setItem("userEmail", this.userdata.username)
                let shiftStore = JSON.parse(localStorage.getItem("shiftReport"))
                var shiftIndex: any = 0;
                shiftStore.forEach(element => {
                    console.log("element", element);
                    // if (element.shiftState == "3" && element.userID != "" && element.shiftType == "0") {

                    //     localStorage.removeItem("shiftReport")

                    //     let newShiftReport = [ {
                    //         userEmail: this.userdata.username,
                    //         userID: this.userdata.personId,
                    //         shiftID: "0",
                    //         shiftType: "0",
                    //         shiftState: "3",
                    //         openingDrawer: "0.00",
                    //         closingDrawer: "0.00",
                    //         initialOpeningTime: 0,
                    //         timeOpened: 0,
                    //         timeClosed: 0,
                    //         userThatClosedShift: ""
                    //     }]

                    //     localStorage.setItem("shiftReport", JSON.stringify(newShiftReport))

                    // } else
                    if (element.shiftState == "3" && element.userID == "") {
                        element.userID = this.userdata.personId
                        element.userEmail = this.userdata.username;
                        element.shiftType = "0"
                        // localStorage.setItem("mainShiftUser",)
                    } else if (element.userID != this.userdata.personId && element.userID != "") {
                        shiftIndex++;

                    }
                    else if (element.shiftState == "4" && element.userID == this.userdata.personId && element.shiftType == "0") {

                    }


                });
                if (shiftIndex == shiftStore.length) {
                    let newShiftReport = {
                        userEmail: this.userdata.username,
                        userID: this.userdata.personId,
                        shiftID: "0",
                        shiftType: "1",
                        shiftState: "3",
                        openingDrawer: 0.00,
                        closingDrawer: 0.00,
                        initialOpeningTime: 0,
                        timeOpened: 0,
                        timeClosed: 0,
                        userThatClosedShift: ""
                    }
                    shiftStore.push(newShiftReport)
                }

                localStorage.setItem("shiftReport", JSON.stringify(shiftStore))

                this._ngZone.run(() => {
                    // this.carddata = new Array(JSON.parse(data));
                    // console.log('this.carddata', this.carddata);
                    this.router.navigate(['/readcard'])
                });
            } else {
                this.loading = false
                $("#errorLogin").modal("show")
                //this.errorMsg = " Please Enter valid Details"

            }
        });
    }
    resetUser() {
        this.username = '';
    }
    resetPassword() {
        this.password = '';
    }
    ngOnInit() {

        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // if(localStorage.getItem("userEmail") != undefined){
        //    // this.hideAndShowLogout = false
        //    // localStorage.setItem("hideAndShowLogout", this.hideAndShowLogout.toString())
        //    } 
        localStorage.removeItem("expectedCash")
        localStorage.removeItem("mainShiftClosed")
        localStorage.removeItem("mainShiftClose")

        if (localStorage.getItem("shiftReport") == null) {
            localStorage.setItem("shiftReport", JSON.stringify(this.shiftReport))
            this.statusOfShiftReportBoolean = true
            this.statusOfShiftReport = "Main Shift is Closed"
        } else if (localStorage.getItem("shiftReport") != null) {
            let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
            let userId = localStorage.getItem("userID")
            shiftReports.forEach(element => {
                if (element.shiftState == "3" && element.userID != "" && element.shiftType == "0") {
                    localStorage.removeItem("shiftReport")
                    localStorage.setItem("shiftReport", JSON.stringify(this.shiftReport))
                    this.statusOfShiftReportBoolean = true
                    this.statusOfShiftReport = "Main Shift is Closed"
                    if (localStorage.getItem("closingPausedMainShift") == "true") {
                        localStorage.removeItem("closingPausedMainShift")
                    }
                    localStorage.removeItem("mainUserExpectedCash")
                } else
                    if (element.shiftState == "3" && element.shiftType == "0" && localStorage.getItem("mainShiftClose")) {
                        this.statusOfShiftReportBoolean = true
                        this.statusOfShiftReport = "Main Shift is Closed"
                    } else
                        if (element.shiftState == "3" && element.shiftType == "0") {
                            this.statusOfShiftReportBoolean = true
                            this.statusOfShiftReport = "Main Shift is Closed"
                        }
                        else if (element.shiftState == "4" && element.shiftType == "0") {
                            this.statusOfShiftReportBoolean = true

                            this.statusOfShiftReport = "Main Shift is Paused"
                            if (localStorage.getItem("mainShiftUserLock") != undefined) {
                                this.ownedByUserBoolean = true
                                this.ownedByUser = localStorage.getItem("mainShiftUserLock")
                            }


                        } else if (element.shiftState == "0" && element.shiftType == "0" && element.userEmail != "") {
                            // this.statusOfShiftReport = "Main Shift is Paused"
                            this.lockedByUserBoolean = true
                            this.lockedByUser = localStorage.getItem("userEmail")

                        } else if (element.shiftState == "0" && element.shiftType == "1" && element.userEmail != "") {
                            this.ownedByUserBoolean = false
                            localStorage.removeItem("closingPausedMainShift")

                        }
            })
        }






    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }
        console.log("cdtaService")
        // this.loading = true;
        this.cdtaservice.login(this.f.username.value, this.f.password.value)
            .subscribe((data: any) => {
                this.router.navigate(['/readcard']);
            },
                error => {
                    // this.alertService.error(error);
                    // this.loading = false;
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
    enterKey(e) {
        if (e.keyCode == 13) {
            this.Login();
            return false;
        }
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
        if (user.username == undefined || user.password == undefined) {
            return $("#emptyLogin").modal("show")
            // return this.errorMsg = " Username Or Password Shouldn't be Empty"
        } else {
            console.log("main.js" + user)
            //this.loading = true;
            this.electronService.ipcRenderer.send('logincall', user)
        }



    }
}

