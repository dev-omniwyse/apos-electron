
import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs';
declare var $: any;
declare var WebCamera: any;
declare var dialog: any;
declare var fs: any;
declare var electron: any;
declare var pcsc: any;
var pcs = pcsc();
var cardName: any = 0;
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
    statusOfShiftReport: string = ""
    disableCards: Boolean = false
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
    constructor(private cdtaservice: CdtaService, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {
        route.params.subscribe(val => {
            // alert(this.x++);
            // var x:any = localStorage.getItem('loginCount')
            //     if(x == null)
            //         x = 1;
            //     else{
            //         x++
            //     }
            //     localStorage.setItem('loginCount', x)
        });
        if (this.electronService.isElectronApp) {
            this.logger = this.electronService.remote.require("electron-log");
        }



        this.electronService.ipcRenderer.on('readcardResult', (event, data) => {
            console.log("data", data)
            if (data != undefined && data != "") {
                this.show = true;
                this._ngZone.run(() => {
                    localStorage.setItem("readCardData", JSON.stringify(data));
                    // let item = JSON.parse(localStorage.getItem("readCardData"));
                    // this.carddata = JSON.parse(item);
                    this.carddata = new Array(JSON.parse(data));
                    //  this.carddataProducts = this.carddata.products;
                    console.log('this.carddata', this.carddata);
                    this.getProductCatalogJSON();
                });
            }
            // this.electronService.ipcRenderer.removeAllListeners("readcardResult");
        });

        this.electronService.ipcRenderer.on('saveOfferingResult', (event, data) => {
            if (data != undefined && data != "") {
                console.log('Offerings Success');
            }
        });

        this.electronService.ipcRenderer.on('adminDeviceConfigResult', (event, data) => {
            if (data != undefined && data != "") {
              localStorage.setItem("deviceConfigData", data);
              this._ngZone.run(() => {
                // this.router.navigate(['/addproduct'])
              });
            }
          });

        this.electronService.ipcRenderer.on('terminalConfigResult', (event, data) => {
            if (data != undefined && data != "") {
                localStorage.setItem('terminalConfigJson', data)
                this.cdtaservice.setterminalNumber(JSON.parse(data).SerialNumber);
                this._ngZone.run(() => {
                    this.terminalConfigJson = JSON.parse(data);
                });
            }
        });

        this.electronService.ipcRenderer.on('newfarecardResult', (event, data) => {
            if (data != undefined && data != "") {
                //this.show = true;
                this._ngZone.run(() => {
                    localStorage.setItem("readCardData", JSON.stringify(data));
                    this.carddata = new Array(JSON.parse(data));
                    console.log('this.carddata', this.carddata);
                    if (this.carddata[0].products.length == 1 && (this.carddata[0].products[0].product_type == 3)) {
                        this.getProductCatalogJSON();
                        this.router.navigate(['/addproduct']);
                    } else {
                        this.carddata.length = [];
                        $("#newCardValidateModal").modal('show');
                    }
                });
            }
        });

        this.electronService.ipcRenderer.on('magneticcardResult', (event, data) => {
            if (data != undefined && data != "") {
                //this.show = true;
                this._ngZone.run(() => {
                    this.getProductCatalogJSON();
                    this.router.navigate(['/addproduct'])
                });
            }
        });

        this.electronService.ipcRenderer.on('catalogJsonResult', (event, data) => {
            var isMagnetic: Boolean = (localStorage.getItem("isMagnetic") == "true") ? true : false;
            if ((!isMagnetic) && (this.carddata[0] == undefined || this.carddata[0] == ''))
                return;
            if (data != undefined && data != "") {
                this.readCardData = [];
                // this.show = true;
                this._ngZone.run(() => {
                    // this.catalogData = new Array(JSON.parse(data));
                    // console.log('this.carddata', this.catalogData);
                    localStorage.setItem('catalogJSON', JSON.stringify(data));
                    let item = JSON.parse(localStorage.getItem("catalogJSON"));
                    this.catalogData = JSON.parse(item).Offering;
                    var keepGoing = true;
                    if (isMagnetic == false) {
                        this.carddata[0].products.forEach(cardElement => {

                            this.catalogData.forEach(catalogElement => {
                                if (catalogElement.Ticket && keepGoing) {
                                    if (catalogElement.Ticket.Group == cardElement.product_type && (catalogElement.Ticket.Designator == cardElement.designator)) {
                                        var remainingValue = "";
                                        var productName = "";
                                        if (cardElement.product_type == 1)
                                            productName = "Frequent Ride"
                                        else if (cardElement.product_type == 2)
                                            productName = "Stored Ride"
                                        else if (cardElement.product_type == 3)
                                            productName = "Pay As You Go"
                                        if (cardElement.product_type == 1)
                                            remainingValue = cardElement.days + " Days";
                                        else if (cardElement.product_type == 2)
                                            remainingValue = cardElement.remaining_rides + " Rides";
                                        else
                                            remainingValue = "$ " + cardElement.remaining_value / 100;
                                        var jsonObject = {

                                            "product": productName,
                                            "description": catalogElement.Ticket.Description,
                                            "status": cardElement.status,
                                            "remainingValue": remainingValue
                                        }
                                        keepGoing = false;
                                        this.readCardData.push(jsonObject);

                                    }
                                }
                                if (catalogElement.Description == "Magnetics") {
                                    localStorage.setItem("magneticProductIndentifier", JSON.stringify(catalogElement.ProductIdentifier));
                                }
                                if (catalogElement.Description == "Smart Card") {
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
                    if (!isExistingCard)
                        this.router.navigate(['/addproduct'])
                });
            }
            this.setOffering();
        });

    }

    /* JAVA SERVICE CALL */

    readCard(event) {
        this.isShowCardOptions = false;
        isExistingCard = true;
        localStorage.setItem("isMagnetic", "false");
        this.electronService.ipcRenderer.send('readSmartcard', cardName)
        console.log('read call', cardName)
    }

    newFareCard(event) {
        this.isShowCardOptions = false;
        localStorage.setItem("isMagnetic", "false");
        this.electronService.ipcRenderer.send('newfarecard', cardName)
        //console.log('read call', cardName)
    }

    magneticCard(event) {
        localStorage.setItem("isMagnetic", "true");
        this.electronService.ipcRenderer.send('magneticcard', cardName)
        console.log('read call', cardName)
    }

    writeCard(event) {
        this.electronService.ipcRenderer.send('writeSmartcard', cardName)
        console.log('write call', cardName)
    }

    getProductCatalogJSON() {
        this.logger.info('this is a message from angular');
        this.electronService.ipcRenderer.send('catalogJson', cardName)
    }

    adminDeviceConfig() {
        this.electronService.ipcRenderer.send('adminDeviceConfig')
        //console.log('read call', cardName)
      }
    setOffering() {
        this.offeringSList = [];
        this.catalogData.forEach(element => {
            if (element.Ticket != undefined && element.Ticket != "") {
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
            }
        });
        console.log(JSON.stringify(this.offeringSList));
        // var tempJson:string = '[{"TicketId": 3, "Description": test1},{"TicketId": 4, "Description": test1}]'
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
            localStorage.setItem("hideModalPopup", "false")
          }
        })
    
      }

    ngOnInit() {
        this.electronService.ipcRenderer.send("terminalConfigcall");

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
                    }

                if (element.shiftState == "3" && element.shiftType == "0") {
                    this.statusOfShiftReport = "Main Shift is Closed"
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