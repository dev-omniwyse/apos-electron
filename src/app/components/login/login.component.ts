import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CdtaService } from '../../cdta.service';
import { ElectronService } from 'ngx-electron';

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
                this.userdata = JSON.parse(data)
                localStorage.removeItem("readCardData");
                localStorage.setItem("userID", this.userdata.personId)
                localStorage.setItem("userEmail", this.userdata.username)
                let shiftStore = JSON.parse(localStorage.getItem("shiftReport"))
                var shiftIndex: any = 0;
                shiftStore.forEach(element => {

                    if (element.shiftState == "3" && element.userID == "") {
                        element.userID = this.userdata.personId
                        element.userEmail = this.userdata.username;
                        element.shiftType = "0"
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

                    this.router.navigate(['/readcard'])
                });
            } else {
                this.loading = false
                $("#errorLogin").modal("show")
            }
        });
    }

    ngOnInit() {

        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

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
                            this.lockedByUserBoolean = true
                            this.lockedByUser = localStorage.getItem("userEmail")

                        } else if (element.shiftState == "0" && element.shiftType == "1" && element.userEmail != "") {
                            this.ownedByUserBoolean = false

                        }
            })
        }

    }

    Login() {
        var user = {
            username: this.username,
            password: this.password
        }
        if (user.username == undefined || user.password == undefined) {
            return $("#emptyLogin").modal("show")
        } else {
            this.electronService.ipcRenderer.send('logincall', user)
        }
    }
}

