
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { FareCardService } from 'src/app/services/Farecard.service';
import { ShoppingCartService } from 'src/app/services/ShoppingCart.service';
import { Utils } from 'src/app/services/Utils.service';
import { SessionServiceApos } from 'src/app/session';
import { SysytemConfig } from 'src/app/config';
import { MediaType } from 'src/app/services/MediaType';
import { CardService } from 'src/app/services/Card.service';


declare var $: any;
let isExistingCard = false;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

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
    isSmartCard = false;
    expectedCash: any = 0;
    buttonIndex = 0;
    reliefExpectedCash: any = 0;
    public buttonArray = ['Card', 'Account'];
    showForm = false;
    userdata: any;
    userPermissions: any;
    isPerformSales: Boolean = true;
    accountCardData: any;
    accountPrintedId: any = '';
    registerForm: FormGroup;
    submitted = false;
    isNetAvailable: any;

    constructor(private cdtaservice: CdtaService, private formBuilder: FormBuilder,
        private route: ActivatedRoute, private config: SysytemConfig, private router: Router,
        private _ngZone: NgZone, private sessionService?: SessionServiceApos,
        private electronService?: ElectronService) {

            this.buttonIndex = localStorage.getItem('isAccountBased') == undefined ? 0 :
             localStorage.getItem('isAccountBased') == 'false' ? 0 : 1;


        // this.subscription = this.cdtaservice.goToCheckout$.subscribe(
        //     proceedToCheckOut => {
        //         if (proceedToCheckOut == true) {
        //             switch (categoryIndex) {
        //                 case 2:
        //                     this.readCard();
        //                     break;
        //                 case 3:
        //                     this.nonFareProduct();
        //                     break;
        //                 default:
        //                     break;
        //             }
        //         } else {
        //             this.SessionModal();
        //         }
        //     });
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

        this.electronService.ipcRenderer.on('salesDataResult', (event, data, userID, shiftType, shiftState) => {
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

        this.electronService.ipcRenderer.on('paymentsDataResult', (event, data, userID, shiftType, shiftState) => {
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



        this.electronService.ipcRenderer.on('readAccountBaseCardResult', (event, data) => {
            if (data == null) {
                $('#errorModal').modal('show');
            } else {
                this.accountCardData = JSON.parse(data);
                this.accountPrintedId = this.accountCardData.printed_id;
                console.log('readAccountbase', data);
            }
        });
        this.electronService.ipcRenderer.on('getAccountDetailsResult', (event, data) => {
            console.log('account details', data);
            if (data == 'No Internet') {
                $('#serviceNotAvailableModal').modal('show');
            }else if(data != ''){
                var accountDetails = JSON.parse(data);
                if(accountDetails.profileType == 'Account-Based'){
                    localStorage.setItem('accountDetails', data);
                    this.router.navigate(['/account_details']);
                    this.isShowCardOptions = false;
                }else{
                    $('#notAccountBasedModal').modal('show');
                }
            }else{
                $('#invalidMailOrWalletModal').modal('show');
            }
           
        });

    }

    changeButton(i) {
        this.buttonIndex = i;
        if (this.buttonIndex == 1) {
            localStorage.setItem('isAccountBased', 'true');
            localStorage.setItem('isMagnetic', 'false');
            localStorage.setItem('isNonFareProduct', 'false');
            localStorage.setItem('addCardForAccount', 'false');
        } else {
            localStorage.setItem('isAccountBased', 'false');
        }
    }
    createAccountForm() {
        this.showForm = true;
    }
    cancelCreateAccount() {
        this.showForm = false;
    }
    readAccountBaseCard() {
        this.electronService.ipcRenderer.send('readAccountBaseCard', CardService.getInstance.getCardName());
    }
    resetWalletId() {
        this.accountPrintedId = '';
    }
    resetFirstName(){
        this.registerForm.controls['firstName'].setValue('');
    }
    resetLastName(){
        this.registerForm.controls['lastName'].setValue('');
    }
    resetEmail(){
        this.registerForm.controls['email'].setValue('');
    }
    SessionModal() {
        $('#userTimedOut').modal('show');
    }
    getAccountDetails() {
        const type = this.accountPrintedId.indexOf('@') == -1 ? 'walletid' : 'emailid';
        if (this.accountPrintedId == '') {
            $('#walletIdVerifyModal').modal('show');
        } else {
            this.electronService.ipcRenderer.send('getAccountDetails', type, this.accountPrintedId);

        }
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
        this.nextBonusRidesText = Utils.getInstance.getNextBonusRidesCount(this.carddata[0],
             this.terminalConfigJson, this.config.cardTypeDetected);
    }

    // readCardSession(index) {
    //     categoryIndex = index;
    //     this.sessionService.getAuthenticated();
    // }
    existingCardClick() {
        isExistingCard = true;
        this.checkCardType();
    }

    newCardClick() {
        isExistingCard = false;
        this.checkCardType();
    }

    checkCardType() {
        this.handleGetCardPIDResult();
        this.electronService.ipcRenderer.send('getCardPID', CardService.getInstance.getCardName());

    }
    handleGetCardPIDResult() {
        this.electronService.ipcRenderer.once('getCardPIDResult', (_event, data) => {
            console.log('cardPID Result', data);
            if (data == '') {
                this.callCardPIDUltraLightC();
            } else {
                this.config.cardTypeDetected = MediaType.SMART_CARD_ID;
                this.isSmartCard = true;
                if (isExistingCard) {
                    this.readSmartCard();
                } else {
                    this.newFareCard();
                }
            }
        });
    }
    handleGetCardPIDUltralightC() {
        this.electronService.ipcRenderer.once('getCardPIDUltraLightCResult', (_event, data) => {
            this.config.cardTypeDetected = MediaType.LUCC;
            console.log('UltraLight data', data);
            this.isSmartCard = false;
            this.readLUCCCard();
        });
    }

    handleIsNetAvailable() {
        this.electronService.ipcRenderer.once('isInternetAvailableResult', (event, data) => {
            if (data == "true") {
                var createUser = this.registerForm.value;
                var regName = /^[a-zA-Z \\-\\]{1,30}$/;
                var regEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                if (createUser.firstName == '' || createUser.lastName == '' || createUser.email == '') {
                    return $('#accountCreationErrorModal').modal('show');
                }
                else if (!regName.test(createUser.firstName) || !regName.test(createUser.lastName)) {
                    return $('#invalidNamesModal').modal('show');
                } else if (regEmail.test(createUser.email) == false) {
                    return $('#invalidMailModal').modal('show');
                }
                else {
                    this.handleCreateAccountUser();
                    this.electronService.ipcRenderer.send('createAccount', createUser.firstName, createUser.lastName, createUser.email);
                }
            } else {
                $('#serviceNotAvailableModal').modal('show');
            }
        });
    }

    handleCreateAccountUser() {
        this.electronService.ipcRenderer.once('createAccountResult', (event, data, email) => {
            console.log('create user data', data);
            if (data.trim() == 'success') {
                console.log('this.registerForm.value.email', this.registerForm.value.email)
                this.accountPrintedId = this.registerForm.value.email;
                this.getAccountDetails();
            } else if ('Email Already Exist' == data.trim()) {
                $('#emailCheckModal').modal('show');
            } else {
                $('#failCreateAccountModal').modal('show');
            }
        });
    }

    callCardPIDUltraLightC() {
        this.handleGetCardPIDUltralightC();
        this.electronService.ipcRenderer.send('getCardPIDUltralightC', CardService.getInstance.getCardName());

    }

    updateSettingsForSmartAndLUCC() {
        localStorage.removeItem('shoppingCart');
        this.isFromReadCard = true;
        localStorage.setItem('isNonFareProduct', 'false');
        localStorage.setItem('isMagnetic', 'false');
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
    }

    readSmartCard() {
        this.updateSettingsForSmartAndLUCC();
        this.handleSmartCardResult();
        this.electronService.ipcRenderer.once('autoLoadResult', (_event, data) => {
            console.log(data);
            if (data != undefined && data != '') {
                this.electronService.ipcRenderer.send('readSmartcard', CardService.getInstance.getCardName());
            }
        });

        this.electronService.ipcRenderer.send('processAutoLoad', CardService.getInstance.getCardName());
        console.log('read call', CardService.getInstance.getCardName());
    }
    handleSmartCardResult() {
        this.electronService.ipcRenderer.once('readcardResult', (_event, data) => {
            console.log('data', data);
            if (data != undefined && data != '') {
                this.setCardOptionsForLUCCAndSmartCard();
                this._ngZone.run(() => {

                    localStorage.setItem('readCardData', JSON.stringify(data));
                    localStorage.setItem('printCardData', data);
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
                    this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart,
                        this.carddata[0], item.Offering, !isExistingCard);
                    localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
                });
            }
        });
    }
    setCardOptionsForLUCCAndSmartCard() {
        this.show = true;
        this.isShowCardOptions = false;
        this.isFromReadCard = false;
    }
    readLUCCCard() {
        this.updateSettingsForSmartAndLUCC();
        this.callReadLUCCCard();
    }
    callReadLUCCCard() {
        this.handleLUCCCardResult();
        this.electronService.ipcRenderer.send('readCardUltralightC');
    }
    handleLUCCCardResult() {
        const fareCodeID = 1;
        this.electronService.ipcRenderer.once('readCardUltralightCResult', (_event, data) => {
            console.log('readCardUltralightCResult', data);
            if (data != undefined && data != '') {
                this.setCardOptionsForLUCCAndSmartCard();
                this._ngZone.run(() => {
                    localStorage.setItem('printCardData', data);
                    this.carddata = new Array(JSON.parse(data));
                    this.terminalConfigJson.Farecodes.forEach(element => {
                        if (this.carddata[0].user_profile == undefined && fareCodeID == element.FareCodeId) {
                            this.cardType = element.Description;
                        } else if (this.carddata[0].user_profile != undefined && this.carddata[0].user_profile == element.FareCodeId) {
                            this.cardType = element.Description;
                        }
                    });
                    this.populateCardDataProductForLUCC();
                    if (!isExistingCard && this.carddata[0].products[0].product_type != 0 && this.carddata[0].products[0].designator != 0) {
                        this.carddata.length = [];
                        $('#newCardValidateModal').modal('show');
                        this.isShowCardOptions = true;

                        return;
                    }
                    localStorage.setItem('readCardData', JSON.stringify(JSON.stringify(this.carddata[0])));
                    localStorage.setItem('userProfile', JSON.stringify(this.cardType));
                    console.log('this.carddata', this.carddata);
                    this.showCardContents();
                    // tslint:disable-next-line:prefer-const
                    let item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
                    // tslint:disable-next-line:max-line-length
                    this.shoppingcart = FareCardService.getInstance.addUltraLightCard(this.shoppingcart, this.carddata[0], item.Offering, !isExistingCard);
                    localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
                });
            }
        });
    }

    populateCardDataProductForLUCC() {
        this.carddata[0].products = [];
        this.carddata[0].products.push(this.carddata[0].product);
        this.carddata[0].products[0].designator = this.carddata[0].card_designator;
        this.carddata[0].products[0].product_type = this.carddata[0].card_type;
        this.carddata[0].products[0].cardType = this.carddata[0].card_type;
        this.carddata[0].products[0].exp_date = this.carddata[0].card_exp;
        this.carddata[0].card_expiration_date_str = this.carddata[0].card_exp_str;
        this.carddata[0].products[0].start_date = this.carddata[0].start_date;
        this.carddata[0].products[0].is_card_badlisted = this.carddata[0].is_card_badlisted;
        this.carddata[0].products[0].is_card_registered = this.carddata[0].is_card_registered;
        this.carddata[0].products[0].is_card_negative = this.carddata[0].is_card_negative;
        this.carddata[0].products[0].is_auto_recharge = this.carddata[0].is_auto_recharge;
    }
    /**
     *
     *
     * @param {*} event
     * @memberof ReadcardComponent
     */
    readCard() {
        // localStorage.removeItem('shoppingCart');
        // isExistingCard = true;
        // this.isFromReadCard = true;
        // localStorage.setItem('isNonFareProduct', 'false');
        // localStorage.setItem('isMagnetic', 'false');
        // ShoppingCartService.getInstance.shoppingCart = null;
        // this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        // this.electronService.ipcRenderer.once('readcardResult', (_event, data) => {
        //     console.log('data', data);
        //     if (this.isFromReadCard && data != undefined && data != '') {
        //         this.show = true;
        //         this.isShowCardOptions = false;
        //         this.isFromReadCard = false;
        //         this._ngZone.run(() => {

        //             localStorage.setItem("readCardData", JSON.stringify(data));
        //             localStorage.setItem("printCardData", data)
        //             this.carddata = new Array(JSON.parse(data));
        //             this.terminalConfigJson.Farecodes.forEach(element => {
        //                 if (this.carddata[0].user_profile == element.FareCodeId) {
        //                     this.cardType = element.Description;
        //                 }
        //             });
        //             localStorage.setItem('userProfile', JSON.stringify(this.cardType));
        //             console.log('this.carddata', this.carddata);
        //             this.showCardContents();
        //             // tslint:disable-next-line:prefer-const
        //             let item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
        //             this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering, false);
        //             localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
        //         });
        //     }
        // });
        // this.electronService.ipcRenderer.once('autoLoadResult', (_event, data) => {
        //     console.log(data);
        //     if (data != undefined && data != '') {
        //         this.electronService.ipcRenderer.send('readSmartcard', cardName);
        //     }
        // });

        // this.electronService.ipcRenderer.send('processAutoLoad', cardName);
        // console.log('read call', cardName);
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
    newFareCard() {
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
        this.electronService.ipcRenderer.send('newfarecard', CardService.getInstance.getCardName());
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
        this.electronService.ipcRenderer.send('writeSmartcard', CardService.getInstance.getCardName());
        console.log('write call', CardService.getInstance.getCardName());
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
        this.electronService.ipcRenderer.send('productCatalogJson', CardService.getInstance.getCardName());
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
            this.electronService.ipcRenderer.send('paymentsData', Number(record.userID), Number(record.shiftType), record.initialOpeningTime, record.timeClosed, null, null, null, Number(record.shiftState))
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


    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;
        this.handleIsNetAvailable();
        this.electronService.ipcRenderer.send('isInternetAvailable');
    }

    /**
     *
     *
     * @memberof ReadcardComponent
     */
    ngOnInit() {


        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
        });

        this.electronService.ipcRenderer.once('terminalConfigResult', (event, data) => {
            if (data != undefined && data != '') {
                localStorage.setItem('terminalConfigJson', data);
                const userInfo = JSON.parse(localStorage.getItem('userData'))
                const userName = userInfo.firstName + ' ' + userInfo.lastName;
                const userObj = {
                  'terminalName':JSON.parse(data).SerialNumber,
                  'userName' : userName
                }
                this.cdtaservice.setterminalNumber(userObj);
                this._ngZone.run(() => {
                    this.terminalConfigJson = JSON.parse(data);
                });
            }
        });
        this.electronService.ipcRenderer.send('terminalConfigcall');
        ShoppingCartService.getInstance.shoppingCart = null;
        this.getProductCatalogJSON();
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        // checking permissions of present logged in user to perform sales
        this.userdata = JSON.parse(localStorage.getItem('userData'));
        this.cdtaservice.getUserPermissionsJson().subscribe(data => {
            if (data != undefined) {
                this.userPermissions = data;
                if (this.userdata.permissions.indexOf(this.userPermissions.PERMISSIONS.PERM_APOS_PERFORM_SALES) == -1) {
                    this.isPerformSales = false;
                } else {
                    this.isPerformSales = true;
                }
            } else {
                console.log('permissions failure')
            }
        });

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
