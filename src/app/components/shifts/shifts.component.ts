import { Component, NgZone, OnInit } from '@angular/core';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

declare var $: any;

@Component({
    selector: 'app-shifts',
    templateUrl: './shifts.component.html',
    styleUrls: ['./shifts.component.css']
})
export class ShiftsComponent implements OnInit {
    currencyForm: FormGroup = this.formBuilder.group({
        currency: ['']
    });
    numberDigits: any = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    zeroDigits: any = ['0', '00'];
    productTotal: any = '0';
    openShift: Boolean = true;
    hideModalPopup: Boolean = false;
    setShiftStatus: any;
    setShiftText: any;
    expectedCash: any = 0;
    public selectedValue: any = 0;

    constructor(private formBuilder: FormBuilder, private cdtaService: CdtaService,
        private router: Router, private _ngZone: NgZone, private electronService: ElectronService) {
        this.currencyForm.setValue({ 'currency': this.productTotal });
    }

    /**
     *This Method is Used to Enter Opening/Closing Amount Of Shift
     *  --> Screen will Show Calculator
     * @memberof ShiftsComponent
     */
    cashDrawer() {
        const shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
        shiftStore.forEach(element => {
            if (element.userID == localStorage.getItem('userID') && element.shiftState == '3') {
                element.initialOpeningTime = new Date().getTime();
                element.shiftState = '0';
                element.openingDrawer = + this.productTotal;
                element.timeOpened = new Date().getTime();
                localStorage.setItem('disableUntilReOpenShift', 'false');
            }
            localStorage.setItem('shiftReport', JSON.stringify(shiftStore));
        });
        this.router.navigate(['/admin']);
        this.hideModalPopup = false;
        localStorage.setItem('hideModalPopup', this.hideModalPopup.toString());
        this.electronService.ipcRenderer.removeAllListeners('salesDataResult');
        this.electronService.ipcRenderer.removeAllListeners('paymentsDataResult');

    }
    /**
     *This Method will Call at closing of Shifts
     * Updating Shift Report of Users
     * @memberof ShiftsComponent
     */
    mainAndReliefShiftClose() {
        const shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
        const shiftreportUser = localStorage.getItem('userID');
        const mainShiftClose = 'true';

        shiftStore.filter(element => {
            if (localStorage.getItem('closingPausedMainShift') == 'true') {
                if (element.shiftState == '4') {
                    element.shiftState = '3';
                    element.userThatClosedShift = localStorage.getItem('userEmail');
                    element.timeClosed = new Date().getTime();
                    element.closingDrawer = + this.productTotal;
                    localStorage.setItem('mainShiftClose', mainShiftClose);
                }

                if (element.userID == shiftreportUser && element.shiftType == '1') {
                    element.shiftState = '3';
                    element.timeClosed = new Date().getTime();
                    element.userThatClosedShift = localStorage.getItem('userEmail');
                }
            } else {
                if (element.userID == shiftreportUser && element.shiftType == '0') {
                    element.shiftState = '3';
                    element.timeClosed = new Date().getTime();
                    element.closingDrawer = + this.productTotal;
                    element.userThatClosedShift = localStorage.getItem('userEmail');
                    localStorage.setItem('mainShiftClose', mainShiftClose);
                } else
                    if (element.userID == shiftreportUser && element.shiftType == '1') {
                        element.shiftState = '3';
                        element.timeClosed = new Date().getTime();
                        element.closingDrawer = + this.productTotal;
                    }
            }
        });
        localStorage.setItem('shiftReport', JSON.stringify(shiftStore));
        /**
         * here we are looping the updated shoftreport for printing open and close cash drawer
         */
        shiftStore.forEach(element => {
            if (localStorage.getItem('closingPausedMainShift') == 'true') {
                if (element.userID == shiftreportUser) {
                    this.cdtaService.printAllOrSpecificShiftData(null);
                } else {
                    // nothing to do
                }
            } else {
                if (element.userID == shiftreportUser && element.shiftType == '0') {
                    this.cdtaService.printAllOrSpecificShiftData(null);
                } else if (element.userID == shiftreportUser && element.shiftType == '1' &&
                localStorage.getItem('closingPausedMainShift') != 'true') {
                    this.cdtaService.printAllOrSpecificShiftData(new Array(element));
                }
            }
        });

        localStorage.setItem('disableUntilReOpenShift', 'true');
        this.router.navigate(['/admin']);
        this.electronService.ipcRenderer.removeAllListeners('salesDataResult');
        this.electronService.ipcRenderer.removeAllListeners('paymentsDataResult');
    }

    /**
     *This Method is to Validating the Shifts
     *Based on Shifts we will show the closing/opening popups
     * @memberof ShiftsComponent
     */
    validShifts() {

        const reliefShif = JSON.parse(localStorage.getItem('shiftReport'));
        const userId = localStorage.getItem('userID');
        reliefShif.forEach(element => {
            if (element.shiftState == '3' && element.userID == userId &&
            element.shiftType == '1' && localStorage.getItem('closingPausedMainShift')) {
                $('#closeShiftModal').modal('show');
            } else
                if (element.shiftState == '3' && element.userID == userId && (element.shiftType == '0' || element.shiftType == '1')) {
                    $('#openShiftModal').modal('show');
                } else if (element.shiftState == '0' && element.userID == userId &&
                (element.shiftType == '0' || element.shiftType == '1')) {
                    $('#closeShiftModal').modal('show');
                } else if (element.shiftState == '4' && element.userID == userId && element.shiftType == '0') {

                }
        });
    }

    /**
     *This Method to make calsi data empty in input
     *
     * @memberof ShiftsComponent
     */
    textAreaEmpty() {
        if (this.currencyForm.value.currency == '' || this.currencyForm.value.currency == undefined) {
            this.currencyForm.value.currency = '' + this.productTotal;
            this.clearDigit(0);
        }
    }

    onBackSpace() {
        if (this.currencyForm.value.currency != null || this.currencyForm.value.currency != '') {
            this.productTotal = '' + this.currencyForm.value.currency.slice(1);
        }
    }

    displayDigit(digit) {
        this.productTotal = Math.round(+(this.productTotal) * 100).toString();
        this.productTotal += digit;
        this.productTotal = (+(this.productTotal) / 100).toString();
        if (this.currencyForm.value.currency == '') {
            this.currencyForm.value.currency = '' + this.productTotal;
        }
    }
    clearDigit(digit) {
        console.log('numberDigits', digit);
        this.productTotal = digit;
    }

    /**
     *This Method is to Show and Hide the popups and will maintain closing paused main shift
     *
     * @memberof ShiftsComponent
     */
    hidePopUp() {
        this.hideModalPopup = true;
        localStorage.setItem('hideModalPopup', this.hideModalPopup.toString());
        if (localStorage.getItem('closingPausedMainShift') == 'true') {
            localStorage.removeItem('closingPausedMainShift');
        }
        const shiftReports = JSON.parse(localStorage.getItem('shiftReport'));
        shiftReports.forEach(element => {
            if ((element.shiftType == '0' && element.shiftState == '0') || (element.shiftType == '1' && element.shiftState == '0')) {
                localStorage.setItem('hideModalPopup', 'true');
            } else if (element.shiftState == 3 && element.userID == localStorage.getItem('userID')) {
                localStorage.setItem('hideModalPopup', 'false');
            }
        });
    }

    /**
     *This Method Handling the result of Cash Drawer
     *
     * @memberof ShiftsComponent
     */
    handleOpenCashDrawerResult() {
        this.electronService.ipcRenderer.once('openCashDrawerResult', (event, data) => {
            if (data != undefined && data != '') {
                if (data) {
                    console.log('cash drawer opened Sucessfully');
                } else {
                    console.log('cash drawer open Failed');
                }
            }
        });
    }
    ngOnInit() {
        // This piece of code handling the shift expected cash and shift status
        const shiftReports = JSON.parse(localStorage.getItem('shiftReport'));
        const userId = localStorage.getItem('userID');
        this.handleOpenCashDrawerResult();
        this.electronService.ipcRenderer.send('openCashDrawer');
        shiftReports.forEach(element => {
            if (localStorage.getItem('closingPausedMainShift') == 'true') {
                this.setShiftStatus = 'CLOSE SHIFT';
                this.expectedCash = localStorage.getItem('mainUserExpectedCash');
                this.setShiftText = 'Enter the total closing amount in the till and Tap \'Enter\' ';
            } else
                if ((element.shiftType == '0' && element.shiftState == '3') && element.userID == userId) {
                    this.setShiftStatus = 'OPEN SHIFT';
                    this.expectedCash = 1;
                    this.setShiftText = 'Enter the total opening amount in the till and Tap \'Enter\' ';
                } else if ((element.shiftType == '0' && element.shiftState == '0') && element.userID == userId) {
                    this.setShiftStatus = 'CLOSE SHIFT';
                    this.expectedCash = localStorage.getItem('expectedCash');
                    this.setShiftText = 'Enter the total closing amount in the till and Tap \'Enter\' ';
                } else if ((element.shiftType == '1' && element.shiftState == '3') && element.userID == userId) {
                    this.setShiftStatus = 'RELIEF SHIFT';
                    this.expectedCash = 1;
                    this.setShiftText = 'Enter the total opening amount in the till and Tap \'Enter\' ';
                } else if ((element.shiftType == '1' && element.shiftState == '0') && element.userID == userId) {
                    this.setShiftStatus = 'CLOSE RELIEF SHIFT';
                    this.expectedCash = localStorage.getItem('expectedCash');
                    this.setShiftText = 'Enter the total closing amount in the till and Tap \'Enter\' ';
                }
        });
    }
}
