import { Injectable, NgZone, Inject } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ElectronService } from 'ngx-electron';
import { Router } from '@angular/router';
import {Idle, DEFAULT_INTERRUPTSOURCES, EventTargetInterruptSource} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';

let isAuthenticated = false;
@Injectable({
    providedIn: 'root'
  })
export class SessionServiceApos {
    idleState = 'Not started.';
    timedOut = false;
    lastPing?: Date = null;
    constructor(private idle: Idle, private keepalive: Keepalive,
        private cdtaService?: CdtaService, private electronService?: ElectronService, private router?: Router,
        private _ngZone?: NgZone) {
            // idle.setIdle(5);
            // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
            // idle.setTimeout(5);
            idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
            idle.onIdleEnd.subscribe(() => {
              this.idleState = 'No longer idle.';
            });
            idle.onTimeout.subscribe(() => {
              this.idleState = 'Timed out!';
              this.timedOut = true;
              cdtaService.announcegoToLogIn(true);
            });
            idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
            idle.onTimeoutWarning.subscribe((countdown) => this.idleState = 'You will time out in ' + countdown + ' seconds!');
            // sets the ping interval to 15 seconds
            keepalive.interval(15);
            keepalive.onPing.subscribe(() => this.lastPing = new Date());
            // this.reset();


        this.electronService.ipcRenderer.on('sessionTimedoutResult', (event, data) => {
            console.log('session', data);
            if (data != undefined && data != '') {
                this._ngZone.run(() => {
                    isAuthenticated = data;
                    if (isAuthenticated) {
                        // alert('Yes 1');
                        this.electronService.ipcRenderer.send('getTimeout');
                    } else {
                        // alert('No 1');
                        this.cdtaService.announcegoToCheckOut(false);
                    }
                });
            }
            //  return isAuthenticated;
        });

        this.electronService.ipcRenderer.on('getTimeOutResult', (event, data) => {
            let validSession = false;
            if (data != undefined && data != '') {
                this._ngZone.run(() => {
                    console.log('getTimeOutResult', data);
                    if (data == true) {
                        // alert('No 2');
                        this.cdtaService.announcegoToCheckOut(false);
                    } else {
                        // alert('Yes 2');
                        this.cdtaService.announcegoToCheckOut(true);
                        validSession = true;
                    }
                });
            }
            return validSession;
        });
    }

    getAuthenticated() {
        this.electronService.ipcRenderer.send('authentication');
    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.

    }

    timeOutUser() {
        localStorage.setItem('userTimedOut', 'true');
    }
    startSession() {
        this.idle.setIdle(30);
        this.idle.setTimeout(30);
        this.idle.watch();
        this.idleState = 'Started.';
        this.timedOut = false;
      }
    sessionStop() {
        this.idle.stop();
    }
}
