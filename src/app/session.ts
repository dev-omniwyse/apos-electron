import { Injectable, NgZone } from '@angular/core';
import { Observable, of, throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { ElectronService } from 'ngx-electron';
import { Utils } from './services/Utils.service';
import { Router } from '@angular/router';

var isAuthenticated = false;
export class sessionService {
    constructor(private http: HttpClient, private electronService: ElectronService, private router: Router, private _ngZone: NgZone) {

        this.electronService.ipcRenderer.on('sessionTimedoutResult', (event, data) => {

            if (data != undefined && data != "") {
                this._ngZone.run(() => {
                    isAuthenticated = data
                    if (isAuthenticated) {
                        this.electronService.ipcRenderer.send("getTimeout")
                    }
                });
            }
             return isAuthenticated;
        });

        this.electronService.ipcRenderer.on('getTimeOutResult', (event, data) => {
            var validSession = false
            if (data != undefined && data != "") {
                this._ngZone.run(() => {
                    console.log("getTimeOutResult", data)
                    if (data == true) {

                    } else {
                        validSession = true
                    }
                });
            }
            return validSession;
        });
    }

    getAuthenticated() {
        this.electronService.ipcRenderer.send("authentication");
    }
    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.


    }

    timeOutUser() {
        localStorage.setItem("userTimedOut", "true")
        this.router.navigate(["/login"]);
    }
}

