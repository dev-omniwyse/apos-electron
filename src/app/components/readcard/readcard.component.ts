
import { Component, OnInit, NgZone } from '@angular/core';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { FareCardService } from 'src/app/services/Farecard.service';
import { ShoppingCartService } from 'src/app/services/ShoppingCart.service';
import { Utils } from 'src/app/services/Utils.service';
import { SessionServiceApos } from 'src/app/session';

declare var $: any;
declare var pcsc: any;
// tslint:disable-next-line:prefer-const
declare var pcsc: any;
// tslint:disable-next-line:prefer-const
let pcs = pcsc();
let cardName: any = '';
let isExistingCard = false;
let categoryIndex = 0;
pcs.on('reader', function (reader) {

    console.log('reader', reader);
    console.log('New reader detected', reader.name);

    reader.on('error', function (err) {
        console.log('Error(', this.name, '):', err.message);
    });

    reader.on('status', function (status) {
        console.log('Status(', this.name, '):', status);
        /* check what has changed */
        // tslint:disable-next-line:no-bitwise
        const changes = this.state ^ status.state;
        if (changes) {
            // tslint:disable-next-line:no-bitwise
            if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                console.log('card removed'); /* card removed */
                reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Disconnected');
                    }
                });
                // tslint:disable-next-line:no-bitwise
            } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                cardName = reader.name;
                console.log('sample', cardName);
                console.log('card inserted'); /* card inserted */
                reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, function (err, protocol) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Protocol(', reader.name, '):', protocol);
                        reader.transmit(new Buffer([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol,
                            // tslint:disable-next-line:no-shadowed-variable
                            function (err: any, data: { toString: (arg0: string) => void; }) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Data received', data);
                                    console.log('Data base64', data.toString('base64'));
                                    // reader.close();
                                    // pcs.close();
                                }
                            });
                    }
                });
            }
        }
    });


    reader.on('end', function () {
        console.log('Reader', this.name, 'removed');
    });
});

pcs.on('error', function (err) {
    console.log('PCSC error', err.message);
});


@Component({
    selector: 'app-readcard',
    templateUrl: './readcard.component.html',
    styleUrls: ['./readcard.component.css']
})
export class ReadcardComponent implements OnInit {

    // Global Declarations will go here
    terminalConfigJson: any = [];

    statusOfShiftReport: String = '';
    disableCards: Boolean = false;
    public errorMessage: String = 'Cannot find encoder:';
    public logger;

    public carddata: any = [];
    public carddataProducts = [];
    public catalogData = [];
    public readCardData = [];
    public show: Boolean = false;
    public offeringSList: any = [];
    public isShowCardOptions: Boolean = true;
    public isFromReadCard = false;
    public fareTotal: any = 0;
    public cardType: any = '';
    public salesData: any;
    public salesPaymentData: any;
    public isMainShiftOpen: Boolean = false;
    public isReliefShiftOpen: Boolean = false;
    backendPaymentReport = [];
    backendSalesReport = [];
    paymentReport: any;
    shoppingcart: any;
    active_wallet_status: string;
    bonusRidesCountText: string;
    nextBonusRidesText: string;
    cardContents = [];
    maxSyncLimitReached = false;
    maxSyncLimitReachedText = '';
    ticketMap = new Map();
    subscription: any;
    expectedCash: any = 0;
    reliefExpectedCash:any = 0;


    constructor(private cdtaservice: CdtaService,
        private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private sessionService?: SessionServiceApos,
        private electronService?: ElectronService) {
        this.subscription = this.cdtaservice.goToCheckout$.subscribe(
            proceedToCheckOut => {
                if (proceedToCheckOut == true) {
                    switch (categoryIndex) {
                        case 2:
                            this.readCard();
                            break;
                        case 3:
                            this.nonFareProduct();
                            break;
                        default:
                            break;
                    }
                } else {
                    this.SessionModal();
                }
            });
        route.params.subscribe(val => {
        });
        if (this.electronService.isElectronApp) {
            this.logger = this.electronService.remote.require('electron-log');
        }
        localStorage.removeItem('readCardData');
        localStorage.removeItem('shoppingCart');
        localStorage.removeItem('cardsData');
        const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));

        this.maxSyncLimitReached = Utils.getInstance.checkSyncLimitsHit(JSON.parse(localStorage.getItem('terminalConfigJson')), deviceInfo);
        this.maxSyncLimitReachedText =
            'This terminal is currently over its transaction limit. The terminal must sync with CDS before sales can continue.';

        this.electronService.ipcRenderer.on('salesDataResult', (event, data, userID, shiftType,shiftState) => {
            console.log('print sales data', data);
            if (data != undefined && data.length != 0) {
                this._ngZone.run(() => {
                    this.salesData = JSON.parse(data);
                    // tslint:disable-next-line:no-shadowed-variable
                    const salesReport: any = this.salesData;
                    for (let report = 0; report < salesReport.length; report++) {
                        salesReport[report].userID = userID;
                        salesReport[report].shiftType = shiftType;
                        this.backendSalesReport.push(salesReport[report]);
                    }
                    localStorage.setItem('backendSalesReport', JSON.stringify(this.backendSalesReport));
                });

            }
            if (data == '[]') {
                // tslint:disable-next-line:prefer-const
                let salesReport: any = {
                    'userID': userID,
                    'shiftType': shiftType
                };
                this.backendSalesReport.push(salesReport);
                localStorage.setItem('backendSalesReport', JSON.stringify(this.backendSalesReport));

            }
        });

        this.electronService.ipcRenderer.on('paymentsDataResult', (event, data, userID, shiftType,shiftState) => {
            console.log('print payments  data', data, userID);
            if (data != undefined && data.length != 0) {
                this._ngZone.run(() => {
                    this.salesPaymentData = JSON.parse(data);

                    // tslint:disable-next-line:no-shadowed-variable
                    const paymentReport: any = this.salesPaymentData;
                    for (let report = 0; report < paymentReport.length; report++) {
                        paymentReport[report].userID = userID;
                        paymentReport[report].shiftType = shiftType;
                        this.backendPaymentReport.push(paymentReport[report]);
                        if (paymentReport[report].paymentMethod == 'CASH') {
                            if (shiftType == '0' && shiftState == '0') {
                                this.expectedCash = Number(this.expectedCash) + paymentReport[report].paymentAmount;
                                this.expectedCash = this.expectedCash.toFixed(2);
                                localStorage.setItem('mainShiftExpectedCash', this.expectedCash);
                            }
                            if (shiftType == '1' && shiftState == '0') {
                                this.reliefExpectedCash = Number(this.reliefExpectedCash) + paymentReport[report].paymentAmount;
                                this.reliefExpectedCash = this.reliefExpectedCash.toFixed(2);
                                localStorage.setItem('reliefShiftExpectedCash', this.reliefExpectedCash);
                            }
                        }
                    }
                    console.log(' this.backendPaymentReport', this.backendPaymentReport);
                    localStorage.setItem('printPaymentData', JSON.stringify(this.backendPaymentReport));

                    // tslint:disable-next-line:prefer-const
                    let displayingPayments = this.cdtaservice.iterateAndFindUniquePaymentTypeString(this.backendPaymentReport);
                    this.paymentReport = this.cdtaservice.generatePrintReceiptForPayments(displayingPayments, false);
                    localStorage.setItem('paymentReceipt', JSON.stringify(this.paymentReport));

                });
            }

            if (data == '[]') {

                const paymentReport: any = {
                    'userID': userID,
                    'shiftType': shiftType
                };

                this.backendPaymentReport.push(paymentReport);
                localStorage.setItem('printPaymentData', JSON.stringify(this.backendPaymentReport));
            }
        });

        this.electronService.ipcRenderer.on('encoderError', (event, data) => {
            this.errorMessage = data;
            this.showErrorMessages();
        });

        this.electronService.ipcRenderer.on('readcardError', (event, data) => {
            this.errorMessage = data;
            this.showErrorMessages();
        });

    }
    SessionModal() {
        $('#userTimedOut').modal('show');
    }
    /**
     *
     *
     * @memberof ReadcardComponent
     */
    showCardContents() {

        this.readCardData = [];
        this._ngZone.run(() => {
            const item = JSON.parse(localStorage.getItem('catalogJSON'));
            this.catalogData = JSON.parse(item).Offering;
            this.getBonusRidesCount();
            this.getNextBonusRides();
            this.active_wallet_status = Utils.getInstance.getStatusOfWallet(this.carddata[0]);
            this.cardContents = Utils.getInstance.getWalletProducts(this.carddata[0], this.ticketMap);
            if (!isExistingCard) {
                this.router.navigate(['/addproduct']);
            }
        });
    }

    /**
     *
     *
     * @memberof ReadcardComponent
     */
    showErrorMessages() {
        $('#errorModal').modal('show');
    }

    /**
     *
     *
     * @memberof ReadcardComponent
     */
    getBonusRidesCount() {
        this.bonusRidesCountText = Utils.getInstance.getBonusRideCount(this.carddata[0]);
    }

    /**
     *
     *
     * @memberof ReadcardComponent
     */
    getNextBonusRides() {
        this.nextBonusRidesText = Utils.getInstance.getNextBonusRidesCount(this.carddata[0], this.terminalConfigJson);
    }

    readCardSession(index) {
        categoryIndex = index;
        this.sessionService.getAuthenticated();
    }
    /**
     *
     *
     * @param {*} event
     * @memberof ReadcardComponent
     */
    readCard() {
        localStorage.removeItem('shoppingCart');
        isExistingCard = true;
        this.isFromReadCard = true;
        localStorage.setItem('isNonFareProduct', 'false');
        localStorage.setItem('isMagnetic', 'false');
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        this.electronService.ipcRenderer.once('readcardResult', (_event, data) => {
            console.log('data', data);
            if (this.isFromReadCard && data != undefined && data != '') {
                this.show = true;
                this.isShowCardOptions = false;
                this.isFromReadCard = false;
                this._ngZone.run(() => {

                    localStorage.setItem("readCardData", JSON.stringify(data));
                    localStorage.setItem("printCardData", data)
                    this.carddata = new Array(JSON.parse(data));
                    this.terminalConfigJson.Farecodes.forEach(element => {
                        if (this.carddata[0].user_profile == element.FareCodeId) {
                            this.cardType = element.Description;
                        }
                    });
                    localStorage.setItem('userProfile', JSON.stringify(this.cardType));
                    console.log('this.carddata', this.carddata);
                    this.showCardContents();
                    // tslint:disable-next-line:prefer-const
                    let item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
                    this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering, false);
                    localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
                });
            }
        });
        this.electronService.ipcRenderer.once('autoLoadResult', (_event, data) => {
            console.log(data);
            if (data != undefined && data != '') {
                this.electronService.ipcRenderer.send('readSmartcard', cardName);
            }
        });

        this.electronService.ipcRenderer.send('processAutoLoad', cardName)
        console.log('read call', cardName)
    }


    /**
     *
     *
     * @memberof ReadcardComponent
     */
    printSummaryOfCard() {
        this.cdtaservice.printCardSummary();
    }


    /**
     *
     *
     * @param {*} event
     * @memberof ReadcardComponent
     */
    newFareCard(event) {
        localStorage.removeItem('shoppingCart');
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();

        localStorage.setItem('isMagnetic', 'false');
        localStorage.setItem('isNonFareProduct', 'false');


        this.electronService.ipcRenderer.once('newfarecardResult', (_event, data) => {
            if (data != undefined && data != '') {


                this._ngZone.run(() => {
                    localStorage.setItem('readCardData', JSON.stringify(data));
                    this.carddata = new Array(JSON.parse(data));
                    console.log('this.carddata', this.carddata);
                    this.terminalConfigJson.Farecodes.forEach(element => {
                        if (this.carddata[0].user_profile == element.FareCodeId) {
                            this.cardType = element.Description;
                        }
                    });
                    if (Utils.getInstance.isNew(this.carddata[0])) {
                        localStorage.setItem('userProfile', JSON.stringify(this.cardType));
                        const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));

                        this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart,
                            this.carddata[0], item.Offering, true);
                        ShoppingCartService.getInstance.shoppingCart = null;
                        localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
                        this.router.navigate(['/addproduct']);
                    } else {

                        this.carddata.length = [];
                        $('#newCardValidateModal').modal('show');
                    }
                });
            }
        });
        this.electronService.ipcRenderer.send('newfarecard', cardName);
    }


    /**
     *
     *
     * @memberof ReadcardComponent
     */
    nonFareProduct() {
        localStorage.removeItem('shoppingCart');
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        this.shoppingcart = FareCardService.getInstance.addNonFareWallet(this.shoppingcart);
        localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
        localStorage.setItem('isMagnetic', 'false');
        localStorage.setItem('isNonFareProduct', 'true');
        this.router.navigate(['/addproduct']);
    }

    /**
     *
     *
     * @param {*} event
     * @memberof ReadcardComponent
     */
    magneticCard(event) {
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        localStorage.setItem('isMagnetic', 'true');
        localStorage.setItem('isNonFareProduct', 'false');
        this.getProductCatalogJSON();
        const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
        this.shoppingcart = FareCardService.getInstance.addMagneticsCard(this.shoppingcart, item.Offering);
        ShoppingCartService.getInstance.shoppingCart = null;
        localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
        this.router.navigate(['/addproduct']);


    }

    /**
     *
     *
     * @param {*} event
     * @memberof ReadcardComponent
     */
    writeCard(event) {
        this.electronService.ipcRenderer.send('writeSmartcard', cardName);
        console.log('write call', cardName);
    }


    /**
     *
     *
     * @memberof ReadcardComponent
     */
    getProductCatalogJSON() {
        this.logger.info('this is a message from angular');
        this.electronService.ipcRenderer.once('getProductCatalogResult', (event, data) => {
            localStorage.setItem('catalogJSON', JSON.stringify(data));
            const item = JSON.parse(localStorage.getItem('catalogJSON'));
            this.catalogData = JSON.parse(item).Offering;
            this.setOffering();
        });
        this.electronService.ipcRenderer.send('productCatalogJson', cardName);
    }

    /**
     *
     *
     * @memberof ReadcardComponent
     */
    adminDeviceConfig() {
        this.electronService.ipcRenderer.once('adminDeviceConfigResult', (event, data) => {
            if (data != undefined && data != '') {
                localStorage.setItem('deviceConfigData', data);
                this._ngZone.run(() => {
                });
            }
        });
        this.electronService.ipcRenderer.send('adminDeviceConfig');


    }


    /**
     *
     *
     * @memberof ReadcardComponent
     */
    getAllUsersSalesAndPayments() {
        // tslint:disable-next-line:prefer-const
        let shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
        shiftStore.forEach(record => {
           // if (record.shiftType != 'unknown') {
                this.electronService.ipcRenderer.send('salesData', Number(record.shiftType), record.initialOpeningTime, record.timeClosed, Number(record.userID), Number(record.shiftState))
                this.electronService.ipcRenderer.send('paymentsData', Number(record.userID), Number(record.shiftType), record.initialOpeningTime, record.timeClosed, null, null, null,Number(record.shiftState))
           // }
        });

    }

    /**
     *
     *
     * @memberof ReadcardComponent
     */
    setOffering() {
        this.offeringSList = [];
        localStorage.removeItem('ticketMap');

        this.catalogData.forEach(element => {
            // if ((element.Ticket != undefined && element.Ticket != "") || element.IsMerchandise) {
            // tslint:disable-next-line:prefer-const
            let jsonObj: any = {
                'OfferingId': element.OfferingId,
                'ProductIdentifier': element.ProductIdentifier,
                'Description': element.Description,
                'UnitPrice': element.UnitPrice,
                'IsTaxable': element.IsTaxable,
                'IsMerchandise': element.IsMerchandise,
                'IsAccountBased': element.IsAccountBased,
                'IsCardBased': element.IsCardBased
            };

            this.ticketMap = Utils.getInstance.pushTicketToMap(element, this.ticketMap);
            this.offeringSList.push(jsonObj);
        });
        localStorage.setItem('ticketMap', JSON.stringify(Array.from(this.ticketMap.entries())));

        this.electronService.ipcRenderer.once('saveOfferingResult', (event, data) => {
            if (data != undefined && data != '') {
                console.log('Offerings Success');
            }
        });
        this.electronService.ipcRenderer.send('saveOffering', '{"data": ' + JSON.stringify(this.offeringSList) + '}');
    }


    /**
     *
     *
     * @memberof ReadcardComponent
     */
    Back() {
        localStorage.removeItem('readCardData');
        localStorage.removeItem('printCardData');
        this.isShowCardOptions = true;
    }


    /**
     *
     *
     * @memberof ReadcardComponent
     */
    hideModalPop() {
        const shiftReports = JSON.parse(localStorage.getItem('shiftReport'));
        shiftReports.forEach(element => {
            if ((element.shiftType == '0' && element.shiftState == '0') || (element.shiftType == '1' && element.shiftState == '0') || (element.shiftType == 'unknown' && element.shiftState == '0')) {
                localStorage.setItem('hideModalPopup', 'true');
            } else {
                if (localStorage.getItem('shiftReopenedByMainUser') == 'true') {

                    localStorage.setItem('hideModalPopup', 'true');
                } else {
                    localStorage.setItem('hideModalPopup', 'false');
                }
            }
        });

    }

    /**
     *
     *
     * @memberof ReadcardComponent
     */
    ngOnInit() {
        this.electronService.ipcRenderer.once('terminalConfigResult', (event, data) => {
            if (data != undefined && data != '') {
                localStorage.setItem('terminalConfigJson', data);
                this.cdtaservice.setterminalNumber(JSON.parse(data).SerialNumber);
                this._ngZone.run(() => {
                    this.terminalConfigJson = JSON.parse(data);
                });
            }
        });
        this.electronService.ipcRenderer.send('terminalConfigcall');
        ShoppingCartService.getInstance.shoppingCart = null;
        this.getProductCatalogJSON();
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        if (localStorage.getItem('shiftReport') != undefined) {
            const shiftReports = JSON.parse(localStorage.getItem('shiftReport'));
            const userId = localStorage.getItem('userID');
            shiftReports.forEach(element => {
                // let elementUserId = String(element.userID).trim();
                // if (elementUserId == userId) {
                    if (element.shiftState == '0' && element.shiftType == '0') {
                        this.isMainShiftOpen = true;
                      }
                      if (element.shiftState == '0' && element.shiftType == '1') {
                        this.isReliefShiftOpen = true;
                      }
                     
                if (element.shiftState == '3' && element.shiftType == '0' && localStorage.getItem('mainShiftClose')) {
                    this.statusOfShiftReport = 'Main Shift is Closed';
                } else
                    if (element.shiftState == '3' && element.shiftType == '0') {
                        this.statusOfShiftReport = 'Main Shift is Closed';

                    } else if (element.shiftState == '4' && element.shiftType == '0') {
                        this.statusOfShiftReport = 'Main Shift is Paused';
                    } else if (element.shiftState == '0' && element.shiftType == '1') {
                        this.statusOfShiftReport = '';
                    }

                if (element.shiftState == '3' && element.shiftType == '0' && element.userID == localStorage.getItem('userID')) {
                    this.statusOfShiftReport = 'Main Shift is Closed';
                    this.disableCards = true;
                } else if (element.shiftState == '3' && element.shiftType == '1' &&
                    element.userID == localStorage.getItem('userID')) {
                    this.disableCards = true;
                } else if (element.shiftState == '4' && element.shiftType == '0' &&
                    element.userID == localStorage.getItem('userID')) {
                    this.disableCards = true;
                    // tslint:disable-next-line:max-line-length
                } else if (localStorage.getItem('disableUntilReOpenShift') == 'true' && (element.shiftState == '4' || element.shiftState == '3')) {
                    this.disableCards = true;
                } else
                if (element.shiftState == '0' && element.userID != userId && this.isMainShiftOpen) {
                    this.statusOfShiftReport = 'Shift Owned By Other User';
                    this.disableCards = true;
                  } else if (element.shiftState == '0' && element.userID != userId && this.isReliefShiftOpen) {
                    this.statusOfShiftReport = 'Shift Owned By Other User';
                    this.disableCards = true;
                  }
                else {
                    this.disableCards = false;
                }
                // }

                if (element.shiftState == '0' && element.shiftType == '0') {
                    this.expectedCash = element.openingDrawer;
                    localStorage.setItem('mainShiftExpectedCash', this.expectedCash);
                }
                if (element.shiftState == '0' && element.shiftType == '1') {
                    this.reliefExpectedCash = element.openingDrawer;
                    localStorage.setItem('reliefShiftExpectedCash', this.reliefExpectedCash);
                }
            });
        }
    }

}
