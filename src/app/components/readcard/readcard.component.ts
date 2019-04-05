
import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs';
import { FareCardService } from 'src/app/services/Farecard.service';
import { ShoppingCartService } from 'src/app/services/ShoppingCart.service';
import { Globals } from 'src/app/global';
import { AddProductComponent } from '../add-product/add-product.component';
import { Utils } from 'src/app/services/Utils.service';
declare var $: any;
declare var WebCamera: any;
declare var dialog: any;
declare var fs: any;
declare var electron: any;
declare var pcsc: any;
var pcs = pcsc();
var cardName: any = "";
var isExistingCard = false;
pcs.on('reader', function (reader) {
    console.log('reader', reader);
    console.log('New reader detected', reader.name);

    reader.on('error', function (err) {
        console.log('Error(', this.name, '):', err.message);
    });

    reader.on('status', function (status) {
        console.log('Status(', this.name, '):', status);
        /* check what has changed */
        const changes = this.state ^ status.state;
        if (changes) {
            if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                console.log("card removed");/* card removed */
                reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Disconnected');
                    }
                });
            } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                cardName = reader.name
                console.log("sample", cardName)
                console.log("card inserted");/* card inserted */
                reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, function (err, protocol) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Protocol(', reader.name, '):', protocol);
                        reader.transmit(new Buffer([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol, function (err, data) {
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
    title = 'Add Cdta';
    url = '';
    event = "20+20";
    value: any;
    statusOfShiftReport: string = ''
    disableCards: Boolean = false;
    public errorMessage: String = "Cannot find encoder:";
    public logger;
    public singleImage: any
    public carddata: any = [];
    public carddataProducts = [];
    public catalogData = [];
    public readCardData = [];
    public show: Boolean = false;
    public x: any = 0;
    public offeringSList: any = [];
    public isShowCardOptions: Boolean = true;
    public isFromReadCard = false;
    public fareTotal: any = 0
    public nonFareTotal: any = 0
    public fareAndNonFareTotal: any = 0
    public cardType: any = "";
    adminSales = []
    salesPayments = []
    public salesData: any
    public salesPaymentData: any
    backendPaymentReport = []
    backendSalesReport = []
    paymentReport: any
    shoppingcart: any;
    bonusRidesCountText : string;
    nextBonusRidesText: string;

    constructor(private cdtaservice: CdtaService, private globals: Globals, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {
        route.params.subscribe(val => {
        });
        if (this.electronService.isElectronApp) {
            this.logger = this.electronService.remote.require("electron-log");
        }
        localStorage.removeItem("readCardData");
        localStorage.removeItem("shoppingCart");
        localStorage.removeItem("cardsData");

       
        this.electronService.ipcRenderer.on('salesDataResult', (event, data, userID, shiftType) => {
            console.log("print sales data", data)
            if (data != undefined && data.length != 0) {
                this._ngZone.run(() => {
                    this.salesData = JSON.parse(data);
                    var salesReport: any = this.salesData
                    for (var report = 0; report < salesReport.length; report++) {
                        salesReport[report].userID = userID
                        salesReport[report].shiftType = shiftType
                        this.backendSalesReport.push(salesReport[report]);
                    }
                    localStorage.setItem("backendSalesReport", JSON.stringify(this.backendSalesReport))
                });

            }
        });

        this.electronService.ipcRenderer.on('paymentsDataResult', (event, data, userID, shiftType) => {
            console.log("print payments  data", data, userID)
            if (data != undefined && data.length != 0) {
                this._ngZone.run(() => {
                    this.salesPaymentData = JSON.parse(data);
                    var paymentReport: any = this.salesPaymentData;
                    for (var report = 0; report < paymentReport.length; report++) {
                        paymentReport[report].userID = userID
                        paymentReport[report].shiftType = shiftType
                        this.backendPaymentReport.push(paymentReport[report]);
                    }
                    console.log(" this.backendPaymentReport", this.backendPaymentReport)
                    localStorage.setItem("printPaymentData", JSON.stringify(this.backendPaymentReport))

                    var displayingPayments = this.cdtaservice.iterateAndFindUniquePaymentTypeString(this.backendPaymentReport);
                    this.paymentReport = this.cdtaservice.generatePrintReceiptForPayments(displayingPayments, false);
                    localStorage.setItem("paymentReceipt", JSON.stringify(this.paymentReport))

                });
            }
        });

       

        //readcardError


        this.electronService.ipcRenderer.on('encoderError', (event, data) => {
            this.errorMessage = data;
            this.showErrorMessages();
        });


        this.electronService.ipcRenderer.on('readcardError', (event, data) => {
            this.errorMessage = data;
            this.showErrorMessages();
        });

    }

    showCardContents() {
        // this.electronService.ipcRenderer.on('catalogJsonResult', (event, data) => {
        // if (data != undefined && data != "") {
        this.readCardData = [];
        // this.show = true;
        this._ngZone.run(() => {                 
            let item = JSON.parse(localStorage.getItem("catalogJSON"));
            this.catalogData = JSON.parse(item).Offering;
            var isMagnetic: Boolean = (localStorage.getItem("isMagnetic") == "true") ? true : false;
            this.getBonusRidesCount();
            this.getNextBonusRides();
            if ((!isMagnetic) && (this.carddata[0] == undefined || this.carddata[0] == ''))
                return;
            var keepGoing = true;
            if (isMagnetic == false) {
                this.carddata[0].products.forEach(cardElement => {

                    this.catalogData.forEach(catalogElement => {
                        if (catalogElement.Ticket && keepGoing) {
                            if (catalogElement.Ticket.Group == cardElement.product_type && (catalogElement.Ticket.Designator == cardElement.designator)) {
                                var remainingValue = "";
                                var productName = "";
                                var status = "Active";//cardElement.status;
                                if (cardElement.product_type == 1)
                                    productName = "Frequent Ride"
                                else if (cardElement.product_type == 2)
                                    productName = "Stored Ride"
                                else if (cardElement.product_type == 3)
                                    productName = "Pay As You Go"
                                if (cardElement.product_type == 1) {
                                    remainingValue = ( cardElement.days + 1 )+ " Days";
                                    var pendingText = (cardElement.recharges_pending > 0) ? " (" + cardElement.recharges_pending + " Pending)" : "";
                                    status = status + pendingText;
                                }
                                else if (cardElement.product_type == 2)
                                    remainingValue = cardElement.remaining_rides + " Rides";
                                else
                                    remainingValue = "$ " + cardElement.remaining_value / 100;
                                var jsonObject = {

                                    "product": productName,
                                    "description": catalogElement.Ticket.Description,
                                    "status": status,
                                    "remainingValue": remainingValue
                                }
                                keepGoing = false;
                                this.readCardData.push(jsonObject);

                            }
                        }
                        if (catalogElement.Description === "Magnetics") {
                            localStorage.setItem("magneticCardCost", catalogElement.UnitPrice);
                            localStorage.setItem("magneticProductIndentifier", JSON.stringify(catalogElement.ProductIdentifier));
                        }
                        if (catalogElement.Description === "Smart Card") {
                            localStorage.setItem("smartCardCost", catalogElement.UnitPrice);
                            localStorage.setItem("smartCardProductIndentifier", JSON.stringify(catalogElement.ProductIdentifier));
                        }
                    });
                    if (keepGoing == true) {
                        var jObject = {

                            "product": "Pay As You Go",
                            "description": "Frequent Rider",
                            "status": cardElement.status,
                            "balance": cardElement.balance
                        }
                        this.readCardData.push(jObject);
                    }

                    keepGoing = true;

                });
            }
            console.log("pushedData --", this.readCardData)
            localStorage.setItem("cardProductData", JSON.stringify(this.readCardData))
            if (!isExistingCard) {
                this.router.navigate(['/addproduct']);
                // var timer = setTimeout(() => {
                //     this.router.navigate(['/addproduct']);
                //     clearTimeout(timer);
                // }, 1000);
            }
        }); 
    }
    showErrorMessages() {
        $("#errorModal").modal('show');
    }
    /* JAVA SERVICE CALL */

    getBonusRidesCount(){
        this.bonusRidesCountText = Utils.getInstance.getBonusRideCount(this.carddata[0]);
    }
    
    getNextBonusRides(){
        this.nextBonusRidesText = Utils.getInstance.getNextBonusRidesCount(this.carddata[0], this.terminalConfigJson);
    }
    readCard(event) {
        localStorage.removeItem('shoppingCart');
        isExistingCard = true;
        this.isFromReadCard = true;
        localStorage.setItem("isNonFareProduct", "false");
        localStorage.setItem("isMagnetic", "false");
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        this.electronService.ipcRenderer.once('readcardResult', (event, data) => {
            console.log("data", data)
            if (this.isFromReadCard && data != undefined && data != "") {
                this.show = true;
                this.isShowCardOptions = false;
                this.isFromReadCard = false
                this._ngZone.run(() => {
                    localStorage.setItem("readCardData", JSON.stringify(data));
                    localStorage.setItem("printCardData", data)
                    // let item = JSON.parse(localStorage.getItem("readCardData"));
                    // this.carddata = JSON.parse(item);
                    this.carddata = new Array(JSON.parse(data));
                    //  this.carddataProducts = this.carddata.products;
                    this.terminalConfigJson.Farecodes.forEach(element => {
                        if (this.carddata[0].user_profile == element.FareCodeId) {
                            this.cardType = element.Description;
                        }
                    });
                    localStorage.setItem('userProfile', JSON.stringify(this.cardType));
                    console.log('this.carddata', this.carddata);
                    this.showCardContents();
                    let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
                    this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering, false);
                    localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
                    // ShoppingCartService.getInstance.shoppingCart = null;
                });
            }
            // this.electronService.ipcRenderer.removeAllListeners("readcardResult");
        });
        this.electronService.ipcRenderer.once('autoLoadResult', (event, data) => {
            console.log(data);
            if (data != undefined && data != "") {
                this.electronService.ipcRenderer.send('readSmartcard', cardName)
            }
        });
        this.electronService.ipcRenderer.send('processAutoLoad', cardName)
        // this.electronService.ipcRenderer.send('readSmartcard', cardName)
        console.log('read call', cardName)

    }

    newFareCard(event) {
        localStorage.removeItem('shoppingCart');
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();

        localStorage.setItem("isMagnetic", "false");
        localStorage.setItem("isNonFareProduct", "false");

        this.electronService.ipcRenderer.once('newfarecardResult', (event, data) => {
            if (data != undefined && data != "") {
                //this.show = true;
                this._ngZone.run(() => {
                    localStorage.setItem("readCardData", JSON.stringify(data));
                    this.carddata = new Array(JSON.parse(data));
                    console.log('this.carddata', this.carddata);
                    this.terminalConfigJson.Farecodes.forEach(element => {
                        if (this.carddata[0].user_profile == element.FareCodeId) {
                            this.cardType = element.Description;
                        }
                    });
                    if (Utils.getInstance.isNew(this.carddata[0])) {
                        localStorage.setItem('userProfile', JSON.stringify(this.cardType));
                        // this.getProductCatalogJSON();
                        let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
                        this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering, true);
                        ShoppingCartService.getInstance.shoppingCart = null;
                        localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
                        this.router.navigate(['/addproduct']);
                        // var timer = setTimeout(() => {
                        //     this.router.navigate(['/addproduct']);
                        //     clearTimeout(timer);
                        // }, 200);
                    }
                    else {
                        this.carddata.length = [];
                        $("#newCardValidateModal").modal('show');
                    }
                });
            }
        });
        this.electronService.ipcRenderer.send('newfarecard', cardName);
    }

    nonFareProduct() {
        localStorage.removeItem('shoppingCart');
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        this.shoppingcart = FareCardService.getInstance.addNonFareWallet(this.shoppingcart);
        localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
        localStorage.setItem("isMagnetic", "false");
        localStorage.setItem("isNonFareProduct", "true");
        this.router.navigate(['/addproduct']);
        // this.getProductCatalogJSON();

        // var timer = setTimeout(() => {
        //     this.router.navigate(['/addproduct']);
        //     clearTimeout(timer);
        // }, 1000);
        // this.router.navigate(['/addproduct']);
    }

    magneticCard(event) {
        ShoppingCartService.getInstance.shoppingCart = null;
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        localStorage.setItem("isMagnetic", "true");
        localStorage.setItem("isNonFareProduct", "false");
        this.getProductCatalogJSON();
        let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
        this.shoppingcart = FareCardService.getInstance.addMagneticsCard(this.shoppingcart, item.Offering);
        ShoppingCartService.getInstance.shoppingCart = null;
        localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
        this.router.navigate(['/addproduct']);
        // var timer = setTimeout(() => {
        //     this.router.navigate(['/addproduct']);
        //     clearTimeout(timer);
        // }, 1000);
        // this.router.navigate(['/addproduct'])
        // this.electronService.ipcRenderer.send('magneticcard', cardName)
        console.log('read call', cardName)
    }

    writeCard(event) {
        this.electronService.ipcRenderer.send('writeSmartcard', cardName)
        console.log('write call', cardName)
    }
    // getCatalogJSON() {
    //     this.logger.info('this is a message from angular');
    //     this.electronService.ipcRenderer.send('productCatalogJson', cardName);
    // }

    getProductCatalogJSON() {
        this.logger.info('this is a message from angular');
        this.electronService.ipcRenderer.once('getProductCatalogResult', (event, data) => {
            localStorage.setItem('catalogJSON', JSON.stringify(data));
            let item = JSON.parse(localStorage.getItem("catalogJSON"));
            this.catalogData = JSON.parse(item).Offering;
            this.setOffering();
        });
        this.electronService.ipcRenderer.send('productCatalogJson', cardName)
    }

    adminDeviceConfig() {
        this.electronService.ipcRenderer.once('adminDeviceConfigResult', (event, data) => {
            if (data != undefined && data != "") {
                localStorage.setItem("deviceConfigData", data);
                this._ngZone.run(() => {
                    // this.router.navigate(['/addproduct'])
                });
            }
        });
        this.electronService.ipcRenderer.send('adminDeviceConfig')
        //console.log('read call', cardName)
    }

    getAllUsersSalesAndPayments() {
        var shiftStore = JSON.parse(localStorage.getItem("shiftReport"))
        shiftStore.forEach(record => {
           
           
            this.electronService.ipcRenderer.send('salesData', Number(record.shiftType), record.initialOpeningTime, record.timeClosed, Number(record.userID))
            this.electronService.ipcRenderer.send('paymentsData', Number(record.userID), Number(record.shiftType), record.initialOpeningTime, record.timeClosed, null, null, null)
        });

    }
    setOffering() {
        this.offeringSList = [];
        this.catalogData.forEach(element => {
            // if ((element.Ticket != undefined && element.Ticket != "") || element.IsMerchandise) {
            var jsonObj: any = {
                "OfferingId": element.OfferingId,
                "ProductIdentifier": element.ProductIdentifier,
                "Description": element.Description,
                "UnitPrice": element.UnitPrice,
                "IsTaxable": element.IsTaxable,
                "IsMerchandise": element.IsMerchandise,
                "IsAccountBased": element.IsAccountBased,
                "IsCardBased": element.IsCardBased
            }
            // var jsonObj:any = { "OfferingId": element.OfferingId, "ProductIdentifier":element.ProductIdentifier ,"Description": element.Ticket.TicketType.Description };
            this.offeringSList.push(jsonObj);
            // }
        });
        console.log(JSON.stringify(this.offeringSList));
        // var tempJson:string = '[{"TicketId": 3, "Description": test1},{"TicketId": 4, "Description": test1}]'
        this.electronService.ipcRenderer.once('saveOfferingResult', (event, data) => {
            if (data != undefined && data != "") {
                console.log('Offerings Success');
            }
        });
        this.electronService.ipcRenderer.send('saveOffering', '{"data": ' + JSON.stringify(this.offeringSList) + '}');
    }

    printDiv() {
        // var printContents = document.getElementById(divName).innerHTML;
        // var originalContents = document.body.innerHTML;
        // document.body.innerHTML = printContents;
        // this.electronService.ipcRenderer.send("printPDF", printContents);
        window.print();
        //  document.body.innerHTML = originalContents;
    }

    Back() {
        localStorage.removeItem('readCardData');
        localStorage.removeItem('printCardData');
        this.isShowCardOptions = true;
        // this.carddata.length = 0;
    }

    hideModalPop() {
        let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
        let userId = localStorage.getItem("userID")

        shiftReports.forEach(element => {
            if ((element.shiftType == "0" && element.shiftState == "0") || (element.shiftType == "1" && element.shiftState == "0")) {
                localStorage.setItem("hideModalPopup", "true")
            } else {
                if (localStorage.getItem("shiftReopenedByMainUser") == "true") {

                    localStorage.setItem("hideModalPopup", "true")
                } else {
                    localStorage.setItem("hideModalPopup", "false")
                }
                //  localStorage.setItem("hideModalPopup", "false")
            }
        })

    }


    ngOnInit() {
        this.electronService.ipcRenderer.once('terminalConfigResult', (event, data) => {
            if (data != undefined && data != "") {
                localStorage.setItem('terminalConfigJson', data)
                this.cdtaservice.setterminalNumber(JSON.parse(data).SerialNumber);
                this._ngZone.run(() => {
                    this.terminalConfigJson = JSON.parse(data);
                });
            }
        });
        this.electronService.ipcRenderer.send("terminalConfigcall");
        ShoppingCartService.getInstance.shoppingCart = null;
        //load catalogJSON
        this.getProductCatalogJSON();
        this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        if (localStorage.getItem("shiftReport") != undefined) {
            let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
            let userId = localStorage.getItem("userID")
            shiftReports.forEach(element => {
                if (element.shiftState == "3" && element.shiftType == "0" && localStorage.getItem("mainShiftClose")) {
                    this.statusOfShiftReport = "Main Shift is Closed"
                } else
                    if (element.shiftState == "3" && element.shiftType == "0") {
                        this.statusOfShiftReport = "Main Shift is Closed"

                    } else if (element.shiftState == "4" && element.shiftType == "0") {
                        this.statusOfShiftReport = "Main Shift is Paused"
                    }else if (element.shiftState == "0" && element.shiftType == "1"){
                        this.statusOfShiftReport = ''
                    }

                if (element.shiftState == "3" && element.shiftType == "0" && element.userID == localStorage.getItem("userID")) {
                    this.statusOfShiftReport = "Main Shift is Closed"
                    this.disableCards = true
                } else if (element.shiftState == "3" && element.shiftType == "1" && element.userID == localStorage.getItem("userID")) {
                    this.disableCards = true
                } else if (element.shiftState == "4" && element.shiftType == "0" && element.userID == localStorage.getItem("userID")) {
                    this.disableCards = true
                } else if (localStorage.getItem("disableUntilReOpenShift") == "true" && (element.shiftState == "4" || element.shiftState == "3")) {
                    this.disableCards = true
                } else {
                    this.disableCards = false
                }
            })
        }
    }

    checkIfcardIsEmpty() {
        // (this.currentCard.products.length == 1 && (this.currentCard.products[0].product_type == 3))?true:false;
    }

}