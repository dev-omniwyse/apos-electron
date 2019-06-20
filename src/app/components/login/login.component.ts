import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CdtaService } from '../../cdta.service';
import { ElectronService } from 'ngx-electron';
import { Utils } from 'src/app/services/Utils.service';
import { SessionServiceApos } from 'src/app/session';

declare var $: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    public loading: Boolean = false;
    submitted = false;
    returnUrl: string;
    username: string;
    password: string;
    userdata: any;
    errorMsg: any = '';
    carddata: any;
    shiftType: any;
    shiftState: any;
    public statusOfShiftReport: string;
    public hideAndShowLogout: Boolean = false;
    public lockedByUser: any = '';
    public ownedByUser: any = '';
    public statusOfShiftReportBoolean: Boolean = false;
    public lockedByUserBoolean: Boolean = false;
    public ownedByUserBoolean: Boolean = false;
    public shiftPausedOrNot: Boolean = false;
    public userPermissions: any;
    shiftReport: any = [
        {
            userEmail: '',
            userID: '',
            shiftID: '0',
            shiftType: '0',
            shiftState: '3',
            openingDrawer: 0.00,
            closingDrawer: 0.00,
            initialOpeningTime: 0,
            timeOpened: 0,
            timeClosed: 0,
            userThatClosedShift: '',
            splUser: ''
        }
    ];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router, private sessionService: SessionServiceApos,
        private cdtaservice: CdtaService, private _ngZone: NgZone, private electronService: ElectronService
    ) {

        this.electronService.ipcRenderer.on('loginCallResult', (event, data) => {
            if (data != undefined && data != '') {
                //var permission = this.userPermissions.PERMISSIONS;
                this.userdata = JSON.parse(data);
                localStorage.setItem('userData', data);
                if (this.checkPermissions(this.userdata.permissions, this.userPermissions.ALLPERMISSIONS)) {
                    if (localStorage.getItem('deviceLocked') == 'true' && this.userdata.permissions.indexOf(this.userPermissions.PERMISSIONS.PERM_APOS_UNLOCK_DEVICE) == -1) {
                        return $('#lockDevicePermission').modal('show');
                    } else {
                        console.log('permission available');
                        console.log('login user data', data);
                        if (localStorage.getItem('deviceLocked') == 'true' && localStorage.getItem('deviceLockedByUser') == this.userdata.username) {
                            localStorage.removeItem('deviceLocked');
                        }
                        const localDeviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
                        if (null == localDeviceInfo || undefined == localDeviceInfo) {
                            const deviceInfo = Utils.getInstance.createDeviceInfoDefaultRecord();
                            localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
                        }
                        localStorage.removeItem('readCardData');
                        localStorage.setItem('userID', this.userdata.personId);
                        localStorage.setItem('userEmail', this.userdata.username);
                        const shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
                        let shiftIndex: any = 0;
                        shiftStore.forEach(element => {

                            if (element.shiftState == '3' && element.userID == '') {
                                element.userID = this.userdata.personId;
                                element.userEmail = this.userdata.username;
                                element.shiftType = '0';
                                // localStorage.setItem("mainShiftUser",)
                            } else if (element.userID != this.userdata.personId && element.userID != '') {
                                shiftIndex++;

                            }
                            if (element.shiftState == '4' && element.shiftType == '0') {
                                this.shiftPausedOrNot = true;
                            }
                        });
                        if (shiftIndex === shiftStore.length) {
                            const newShiftReport = {
                                userEmail: this.userdata.username,
                                userID: this.userdata.personId,
                                shiftID: '0',
                                shiftType: '1',
                                shiftState: '3',
                                openingDrawer: 0.00,
                                closingDrawer: 0.00,
                                initialOpeningTime: 0,
                                timeOpened: 0,
                                timeClosed: 0,
                                userThatClosedShift: '',
                                splUser: ''
                            };
                            shiftStore.push(newShiftReport);
                        }

                        localStorage.setItem('shiftReport', JSON.stringify(shiftStore));

                        this._ngZone.run(() => {
                            this.router.navigate(['/home']);
                        });
                    }
                }
                else {
                    $('#errorLogin').modal('show');
                }
            }
            else {
                this.loading = false;
                $('#errorLogin').modal('show');
            }
        });
    }
    resetUser() {
        this.username = '';
    }
    resetPassword() {
        this.password = '';
    }
    checkPermissions(userpermissionsDB, localpermission) {
        var isHavePermissions = false;
        userpermissionsDB.forEach(function (x) {
            localpermission.forEach(function (y) {
                if (x == y) { isHavePermissions = true; }
            });
        });
        return isHavePermissions;
    }
    ngOnInit() {

        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        localStorage.setItem('isAccountBased', 'false');
        localStorage.removeItem('expectedCash');
        localStorage.removeItem('mainShiftClosed');
        localStorage.removeItem('mainShiftClose');

        this.cdtaservice.getUserPermissionsJson().subscribe(data => this.userPermissions = data, error => console.log(error));
        // This whole functionality is show the message at login time whether the shift closed/paused
        // and removing some local storage items when main shift is closed
        if (localStorage.getItem('shiftReport') == null) {
            localStorage.setItem('shiftReport', JSON.stringify(this.shiftReport));
            this.statusOfShiftReportBoolean = true;
            this.statusOfShiftReport = 'Main Shift is Closed';
            localStorage.removeItem('deviceLocked');
        } else if (localStorage.getItem('shiftReport') != null) {
            const shiftReports = JSON.parse(localStorage.getItem('shiftReport'));
            const userId = localStorage.getItem('userID');
            shiftReports.forEach(element => {
                if (element.shiftState == '3' && element.userID != '' && element.shiftType == '0') {
                    localStorage.removeItem('shiftReport');
                    localStorage.removeItem('deviceLocked');
                    localStorage.setItem('shiftReport', JSON.stringify(this.shiftReport));
                    this.statusOfShiftReportBoolean = true;
                    this.statusOfShiftReport = 'Main Shift is Closed';
                    if (localStorage.getItem('closingPausedMainShift') == 'true') {
                        localStorage.removeItem('closingPausedMainShift');
                    }
                    localStorage.removeItem('mainUserExpectedCash');
                } else
                    if (element.shiftState == '3' && element.shiftType == '0' && localStorage.getItem('mainShiftClose')) {
                        this.statusOfShiftReportBoolean = true;
                        this.statusOfShiftReport = 'Main Shift is Closed';
                    } else
                        if (element.shiftState == '3' && element.shiftType == '0') {
                            this.statusOfShiftReportBoolean = true;
                            this.statusOfShiftReport = 'Main Shift is Closed';
                            localStorage.removeItem('deviceLocked');
                        } else if (element.shiftState == '4' && element.shiftType == '0') {
                            this.statusOfShiftReportBoolean = true;

                            this.statusOfShiftReport = 'Main Shift is Paused';
                            if (localStorage.getItem('deviceLocked') == 'true') {
                                this.lockedByUserBoolean = true;
                                this.lockedByUser = localStorage.getItem('deviceLockedByUser');
                            } else
                                if (localStorage.getItem('mainShiftUserLock') != undefined) {
                                    this.ownedByUserBoolean = true;
                                    this.ownedByUser = localStorage.getItem('mainShiftUserLock');
                                }
                        } else if (element.shiftState == '0' && element.shiftType == '0' && element.userEmail != '') {
                            this.lockedByUserBoolean = true;
                            this.lockedByUser = (localStorage.getItem('userEmail') != undefined) ? localStorage.getItem('userEmail') : localStorage.getItem('deviceLockedByUser');

                        } else if (element.shiftState == '0' && element.shiftType == '1' && element.userEmail != '') {
                            this.ownedByUserBoolean = false;
                            localStorage.removeItem('closingPausedMainShift');
                        }
            });
        }

        if (localStorage.getItem('deviceLocked') == 'true' && localStorage.getItem('deviceLocked') != undefined) {
            this.lockedByUserBoolean = true;
            this.lockedByUser = (localStorage.getItem('userEmail') != undefined) ? localStorage.getItem('userEmail') : localStorage.getItem('deviceLockedByUser');
            console.log('main_shift_user lock', this.lockedByUser);

        }

    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    enterKey(e) {
        if (e.keyCode == 13) {
            this.Login();
            return false;
        }
    }
    Login() {
        const user = {
            username: this.username,
            password: this.password
        };
        if (user.username == undefined || user.password == undefined) {
            return $('#emptyLogin').modal('show');
        } else {
            this.electronService.ipcRenderer.send('logincall', user);
        }
        this.sessionService.startSession();

    }
}

