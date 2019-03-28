import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges, NgZone } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ElectronService } from 'ngx-electron';
import { Router, ActivatedRoute } from '@angular/router';
import { SSL_OP_NO_TICKET } from 'constants';
import { encode } from 'punycode';
import { MediaType } from 'src/app/services/MediaType';
import { TransactionService } from 'src/app/services/Transaction.service';
import { debug } from 'util';
import { timestamp } from 'rxjs/operators';
// import { product_log } from '../../../assets/data/product_catalog'
declare var pcsc: any;
declare var $: any;
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
  selector: 'app-carddata',
  templateUrl: './carddata.component.html',
  styleUrls: ['./carddata.component.css']
})
export class CarddataComponent implements OnInit, OnChanges {

  @Input() public Carddata;
  // merchantise = [];
  // merchantList: any = [];
  // areExistingProducts: any = [];
  // encodeParseData: any = [];
  encodeJsonData: any = [];
  // readCarddata: any = {};
  cardJson: any = [];
  // productCardList: any = [];
  // encodedProductCardData: any = [];
  currentCard: any = [];
  currentCardProductList: any = [];
  // currentExistingProducts: any = [];
  cardIndex: any = 0;
  // carddata: any = [];
  // transactionId: any = "";
  // transactionAmount: any = 0;
  isNew: any = false;
  catalogJson: any = [];
  terminalConfigJson: any = [];
  // JsonObjCardObj: any = [];
  isFromCardComponent = false;
  isCorrectCardPlaced = false;
  isFromEncode = false;
  // executeIpcRendererOn: any = true;
  // encodeddata: any = [];
  shoppingCart: any = [];
  constructor(private cdtaService: CdtaService, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService) {
    route.params.subscribe(val => {
      this.cardIndex = 0;
      this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
      // this.transactionAmount = JSON.parse(localStorage.getItem('transactionAmount'));
      // this.merchantList = localStorage.getItem('encodeData');
      // this.productCardList = localStorage.getItem('productCardData');
      // this.encodeParseData = JSON.parse(this.merchantList);
      // this.areExistingProducts = JSON.parse(localStorage.getItem('areExistingProducts'))
      // this.encodedProductCardData = JSON.parse(this.productCardList);
      this.cardJson = JSON.parse(localStorage.getItem("cardsData"));
      let item = JSON.parse(localStorage.getItem("catalogJSON"));
      this.catalogJson = JSON.parse(item).Offering;
      this.shoppingCart = JSON.parse(localStorage.getItem('shoppingCart'));
      this.currentCard = this.cardJson[this.cardIndex];
      if (this.isSmartCardFound()) {
        this.getSmartCardWalletContents();
      }
    });

  //   incrementEncodableIndex(){
	// this.cardIndex ++;
  //   }

  //   getCountOfSmartCardsFromShoppingCard(){
	// this.shoppingCart._walletLineItem.foreach(WalletLineItem
  //   }
    // getNextEncodableProduct(){
       
    //    this.shoppingCart._walletLineItem[this.cardIndex + 1];
    //    this.currentCardProductList = this.shoppingCart._walletLineItem[this.cardIndex + 1]._walletContents;
    // }

    var updateCardDataListener: any = this.electronService.ipcRenderer.on('updateCardDataResult', (event, data) => {
      if (data != undefined && data != "" && this.isFromCardComponent) {
        this.electronService.ipcRenderer.send('readSmartcard', cardName)
      }
    });
    var readcardListener: any = this.electronService.ipcRenderer.on('readcardResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "" && this.isFromCardComponent) {
        this.isFromCardComponent = false;
        this._ngZone.run(() => {
          localStorage.setItem("readCardData", JSON.stringify(data));
          localStorage.setItem("printCardData", data)
          // this.electronService.ipcRenderer.send('generateSequenceNumber');
        });
      }
      // this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    });
    var cardPIDListener: any = this.electronService.ipcRenderer.on('getCardPIDResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "" && this.isFromEncode) {
        this.isFromEncode = false;
        this._ngZone.run(() => {
          if (data == this.currentCard.printed_id) {
            this.encodeCard();
          }
          else {
            $("#cardModal").modal('show');
            return;
          }


        });
      }
      // this.electronService.ipcRenderer.removeAllListeners("getCardPIDResult");
    });
    this.electronService.ipcRenderer.on('printReceiptResult', (event, data) => {
      if (data != undefined && data != "") {
        // localStorage.setItem("deviceConfigData", data);
        alert("print success ");
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
          this.electronService.ipcRenderer.removeAllListeners("printReceiptResult");
        });
      }
    });

    // var sequenceNumberListener: any = this.electronService.ipcRenderer.on('generateSequenceNumberSyncResult', (event, data) => {
    //   try {
    //     console.log("data", data)
    //     if (data != undefined && data != "") {
    //       this._ngZone.run(() => {
    //         this.transactionId = data;
    //         var cardsjson: any = [];
    //         var unitPrice: any = 0;
    //         var fareCode: any = "";
    //         var walletObj: any = [];
    //         var shiftType: any = 0;
    //         // var de
    //         // get unit price for ticket
    //         this.catalogJson.forEach(catalogElement => {
    //           if ((null == catalogElement.Ticket) &&
    //             (false == catalogElement.IsMerchandise) &&
    //             (null != catalogElement.WalletType)) {
    //             if (catalogElement.WalletType.WalletTypeId == 3) {
    //               unitPrice = catalogElement.UnitPrice;
    //             }
    //           }
    //         });
    //         // get farecode from terminal config
    //         this.terminalConfigJson.Farecodes.forEach(terminalConfigElement => {
    //           if (this.currentCard.user_profile == terminalConfigElement.FareCodeId) {
    //             fareCode = terminalConfigElement.Description;
    //           }
    //         });

    //         // get shiftType from ShiftReport
    //         var shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    //         var userId = localStorage.getItem("userID")
    //         shiftReports.forEach(shiftReportElement => {
    //           if (shiftReportElement.userID == userId) {
    //             shiftType = shiftReportElement.shiftType;
    //           }
    //         })
    //         var slotNumberStatusIndex: any = 0;
    //         this.cardJson.forEach(element => {
    //           this.currentCardProductList.forEach(walletElement => {
    //             var rechargesPending = 0;
    //             var balance = 0;
    //             var existingBalance = 0;
    //             var slotNumber = 0;
    //             if (this.carddata[0].products != undefined) {
    //               this.carddata[0].products.forEach(cardElement => {
    //                 if (walletElement.Ticket.Group == 1 && cardElement.product_type == 1 && (walletElement.Ticket.Designator == cardElement.designator)) {
    //                   rechargesPending = cardElement.recharges_pending;
    //                 } else if (walletElement.Ticket.Group == 2 && cardElement.product_type == 2 && (walletElement.Ticket.Designator == cardElement.designator)) {
    //                   existingBalance = cardElement.remaining_rides;
    //                 } else if (walletElement.Ticket.Group == 3 && cardElement.product_type == 3 && (walletElement.Ticket.Designator == cardElement.designator)) {
    //                   existingBalance = cardElement.remaining_value / 100;
    //                 }
    //               });
    //               if (walletElement.Ticket.Group == 1) {
    //                 balance = walletElement.Ticket.Value;
    //               } else if (walletElement.Ticket.Group == 2) {
    //                 balance = existingBalance;//+ (walletElement.quantity * walletElement.Ticket.Value);
    //               }
    //               else {
    //                 balance = existingBalance; //+ (walletElement.quantity * walletElement.Ticket.Value);
    //               }
    //             }
    //             this.encodeddata[0].forEach(element => {
    //               if (walletElement.Ticket.Group == element.product_type && (walletElement.Ticket.Designator == element.designator)) {
    //                 slotNumber = element.slotNumber;
    //                 status = element.status;
    //               }
    //             });
    //             var jsonWalletObj = {
    //               "transactionID": this.transactionId,
    //               "quantity": walletElement.quantity,
    //               "productIdentifier": walletElement.ProductIdentifier,
    //               "ticketTypeId": walletElement.Ticket.TicketType.TicketTypeId,
    //               "ticketValue": (walletElement.Ticket.Group == 3) ? walletElement.UnitPrice : walletElement.Ticket.Value,
    //               "status": status,
    //               "slotNumber": slotNumber,
    //               "startDate": 0, //(walletElement.DateEffective / (1000 * 60 * 60 * 24)),
    //               "expirationDate": 0,//(walletElement.DateExpires / (1000 * 60 * 60 * 24)),
    //               "balance": balance,
    //               "rechargesPending": rechargesPending,
    //               "IsMerchandise": walletElement.IsMerchandise,
    //               "IsBackendMerchandise": false,
    //               "IsFareCard": false,
    //               "unitPrice": walletElement.UnitPrice,
    //               "totalCost": this.transactionAmount,
    //               "userID": localStorage.getItem("userEmail"),
    //               "shiftID": 1,
    //               "fareCode": fareCode,
    //               "offeringId": walletElement.OfferingId,
    //               "cardPID": element.printed_id,
    //               "cardUID": element.uid,
    //               "walletTypeId": 3,
    //               "shiftType": shiftType,
    //               "timestamp": new Date().getTime()
    //             }
    //             walletObj.push(jsonWalletObj);
    //             slotNumberStatusIndex++;
    //           });
    //           var JsonObj: any = {
    //             "transactionID": this.transactionId,
    //             "cardPID": element.printed_id,
    //             "cardUID": element.uid,
    //             "quantity": (this.isNew) ? 1 : 0,
    //             "productIdentifier": JSON.parse(localStorage.getItem("smartCardProductIndentifier")),
    //             "ticketTypeId": null,
    //             "ticketValue": 0,
    //             "slotNumber": 0,
    //             "expirationDate": element.card_expiration_date,
    //             "balance": 0,
    //             "IsMerchandise": false,
    //             "IsBackendMerchandise": false,
    //             "IsFareCard": true,
    //             "unitPrice": (this.isNew) ? unitPrice : 0,
    //             "totalCost": (this.isNew) ? unitPrice : 0,
    //             "userID": localStorage.getItem("userEmail"),
    //             "shiftID": 1,
    //             "fareCode": fareCode,
    //             "walletContentItems": walletObj,
    //             "walletTypeId": 3,
    //             "shiftType": shiftType,
    //             "timestamp": new Date().getTime()
    //           };
    //           this.JsonObjCardObj.push(JsonObj);

    //         });
    //         if (localStorage.getItem("paymentMethodId") == "8") {
    //           var paymentObj = {
    //             "paymentMethodId": Number(localStorage.getItem("paymentMethodId")),
    //             "amount": this.transactionAmount,
    //             "comment": localStorage.getItem("compReason")
    //           }
    //         } else {
    //           paymentObj = {
    //             "paymentMethodId": Number(localStorage.getItem("paymentMethodId")),
    //             "amount": this.transactionAmount,
    //             "comment": null
    //           }
    //         }
    //         var transactionObj =
    //         {
    //           "userID": localStorage.getItem("userEmail"),
    //           "timestamp": new Date().getTime(),
    //           "transactionID": this.transactionId,
    //           "transactionType": "Charge",
    //           "transactionAmount": this.transactionAmount,
    //           "salesAmount": this.transactionAmount,
    //           "taxAmount": 0,
    //           "items": this.JsonObjCardObj,
    //           "payments": [paymentObj],
    //           "shiftType": shiftType
    //         }
    //         console.log("transObj" + JSON.stringify(transactionObj));
    //         localStorage.setItem("transObj", JSON.stringify(transactionObj))
    //         this.electronService.ipcRenderer.send('savaTransaction', transactionObj);
    //       });
    //     }
    //     else {
    //       $("#encodeErrorModal").modal('show');
    //     }
    //   }
    //   catch (e) {
    //     $("#encodeErrorModal").modal('show');
    //   }
    //   // this.electronService.ipcRenderer.removeAllListeners("generateSequenceNumberSyncResult");
    // });

    var transactionListener: any = this.electronService.ipcRenderer.on('saveTransactionResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
          $("#encodeSuccessModal").modal('show');
          var timestamp = new Date().getTime();
         // this.cdtaService.generateReceipt(timestamp)
        });
      } else {
        $("#encodeErrorModal").modal('show');
      }
      // this.electronService.ipcRenderer.removeAllListeners("saveTransactionResult");
    });

    var encodingListener: any = this.electronService.ipcRenderer.on('encodeCardResult', (event, data) => {
      if (data != undefined && data != "") {
        console.log(data);
        this._ngZone.run(() => {
          var resultObj: any = [];
          resultObj = new Array(JSON.parse(data));
          for (let index = 0; index < resultObj.length; index++) {
            this.shoppingCart._walletLineItem[this.cardIndex]._walletContents[index]._slot = resultObj[index][0].slotNumber;
            this.shoppingCart._walletLineItem[this.cardIndex]._walletContents[index]._status = resultObj[index][0].status;
          }
          // resultObj.forEach(element => {

          //   this.shoppingCart._walletLineItem[this.cardIndex]._walletContents[]
          //   // this.encodeddata.push(element);
          // });
          if (this.isSmartCardFound()) {
            this.populatCurrentCard();
            this.getSmartCardWalletContents();
          }
          else {
            this.initiateSaveTransaction()
          }
        });
      }
      else {
        $("#encodeErrorModal").modal('show');
      }
    });

  }

  initiateSaveTransaction() {
    var expirationDate: String = (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + (new Date().getFullYear() + 10);
    this.isFromCardComponent = true;
    if (this.isNew) {
      this.electronService.ipcRenderer.send("updateCardData", cardName, expirationDate);
    }
    else {
      this.electronService.ipcRenderer.send('readSmartcard', cardName)
    }
    let userID = localStorage.getItem('userID');
       
    let transactionObj = TransactionService.getInstance.saveTransaction(this.shoppingCart, this.getUserByUserID(userID), this.getPaymentsObject());
    debugger;
    localStorage.setItem("transactionObj",JSON.stringify(transactionObj))
    this.electronService.ipcRenderer.send('savaTransaction', transactionObj);
  }

  getUserByUserID(userID){
    let userData = null;
    let userJSON = JSON.parse(localStorage.getItem('shiftReport'));
    for(let user of userJSON){
      if(user.userID ==  userID){
        userData = user;
        break
      }
    }
    return userData;
  }

  getPaymentsObject() {
    var paymentObj: any
    let transactionAmount = localStorage.getItem('transactionAmount');
    if (localStorage.getItem("paymentMethodId") == "8") {
      paymentObj = {
        "paymentMethodId": Number(localStorage.getItem("paymentMethodId")),
        "amount": transactionAmount,
        "comment": localStorage.getItem("compReason")
      }
    } else {
      paymentObj = {
        "paymentMethodId": Number(localStorage.getItem("paymentMethodId")),
        "amount": transactionAmount,
        "comment": null
      }
    }
    return paymentObj;
  }

  populatCurrentCard() {
    this.cardJson.forEach(element => {
      if (element.printed_id == this.shoppingCart._walletLineItem[this.cardIndex]._cardPID) {
        this.currentCard = element;
      }
    });
  }


  isSmartCardFound() {
    let index = 0;
    let nextItemFound: Boolean = false;
    for (let iterator of this.shoppingCart._walletLineItem) {
      if (iterator._walletTypeId == MediaType.SMART_CARD_ID) {
        if (index > this.cardIndex) {
          nextItemFound = true;
          break;
        }
      }
      index++;
    }
    if (nextItemFound) {
      this.cardIndex = index;
    }
    return nextItemFound;
  }

  getSmartCardWalletContents() {
    this.currentCardProductList = this.shoppingCart._walletLineItem[this.cardIndex]._walletContents;
  }

  navigateToDashboard() {
    var timestamp = new Date().getTime();
    this.cdtaService.generateReceipt(timestamp);
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem("cardsData");
    localStorage.removeItem("catalogJSON");
    localStorage.removeItem("readCardData");
    this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    this.electronService.ipcRenderer.removeAllListeners("getCardPIDResult");
    this.electronService.ipcRenderer.removeAllListeners("generateSequenceNumberSyncResult");
    this.electronService.ipcRenderer.removeAllListeners("saveTransactionResult");
    this.electronService.ipcRenderer.removeAllListeners("encodeCardResult");
    this.electronService.ipcRenderer.removeAllListeners("updateCardDataResult");
    //this.electronService.ipcRenderer.removeAllListeners("printReceiptResult");
    this.router.navigate(['/readcard'])
  }

  printDiv() {
    // var printContents = document.getElementById(divName).innerHTML;
    // var originalContents = document.body.innerHTML;
    // document.body.innerHTML = printContents;
    // this.electronService.ipcRenderer.send("printPDF", printContents);
    window.print();
    //  document.body.innerHTML = originalContents;
  }

  ngOnInit() {

  }

  removeEventListeners() {

  }

  navigateToReadCard() {
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem("cardsData");
    localStorage.removeItem("catalogJSON");
    localStorage.removeItem("readCardData");
    this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    this.electronService.ipcRenderer.removeAllListeners("getCardPIDResult");
    this.electronService.ipcRenderer.removeAllListeners("generateSequenceNumberSyncResult");
    this.electronService.ipcRenderer.removeAllListeners("saveTransactionResult");
    this.electronService.ipcRenderer.removeAllListeners("encodeCardResult");
    this.electronService.ipcRenderer.removeAllListeners("printReceiptResult");
    this.router.navigate(['/readcard'])
  }

  checkIsCardNew() {
    this.isNew = (this.currentCard.products.length == 1 && ((this.currentCard.products[0].product_type == 3) && (this.currentCard.products[0].remaining_value == 0))) ? true : false;
  }

  populatCurrentCardEncodedData() {
    // var dataIndex: any = 0;
    this.currentCardProductList = this.shoppingCart._walletLineItem[this.cardIndex + 1]._walletContents;
    // this.currentCardProductList = this.currentCard._walletContents;
    // this.encodedProductCardData.forEach(element => {
    //   if (element == this.cardJson[this.cardIndex].printed_id) {
    //     this.currentCardProductList.push(this.encodeParseData[dataIndex]);
    //     this.currentExistingProducts.push(this.areExistingProducts[dataIndex]);
    //   }
    //   dataIndex++
    // });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
    }
  }

  ngOnDestroy() {
    this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    this.electronService.ipcRenderer.removeAllListeners("getCardPIDResult");
    this.electronService.ipcRenderer.removeAllListeners("generateSequenceNumberSyncResult");
    this.electronService.ipcRenderer.removeAllListeners("saveTransactionResult");
    this.electronService.ipcRenderer.removeAllListeners("encodeCardResult");
    this.electronService.ipcRenderer.removeAllListeners("printReceiptResult");
  }

  checkCorrectCard() {
    this.populatCurrentCard()
    console.log(cardName);
    this.isFromEncode = true;
    this.electronService.ipcRenderer.send('getCardPID', cardName);
  }

  encodeCard() {
    try {
      console.log("product list data", this.currentCardProductList);
      this.encodeJsonData = [];
      var JsonObj;
      var currentIndex = 0;
      this.currentCardProductList.forEach(element => {
        if (element._offering.Ticket.Group == 1) {
          for (let index = 0; index < element._quantity; index++) {
            var internalJsonObj = this.constructJsonForEncoding(element._offering.Ticket.Group, element);
            this.encodeJsonData.push(internalJsonObj);
          }
        }
        else if (element._offering.Ticket.Group == 2) {
          JsonObj = this.constructJsonForEncoding(element._offering.Ticket.Group, element);
        }
        else if (element._offering.Ticket.Group == 3) {
          JsonObj = this.constructJsonForEncoding(element._offering.Ticket.Group, element);

        }
        if (element._offering.Ticket.Group != 1) {
          this.encodeJsonData.push(JsonObj);
        }
        currentIndex++;
      });

      console.log(this.encodeJsonData);
      this.checkIsCardNew();
      if (this.isNew)
        this.electronService.ipcRenderer.send('encodenewCard', this.currentCard.printed_id, 1, 0, 0, this.encodeJsonData);
      else
        this.electronService.ipcRenderer.send('encodeExistingCard', this.currentCard.printed_id, this.encodeJsonData);
    }
    catch{
      $("#encodeErrorModal").modal('show');
    }
  }

  constructJsonForEncoding(product_type, element) {
    var JsonObjectForProductType: any;
    switch (product_type) {
      case 1:
        JsonObjectForProductType = {
          "product_type": element._offering.Ticket.Group,
          "designator": element._offering.Ticket.Designator,
          "ticket_id": element._offering.Ticket.TicketId,
          "designator_details": 0,
          "start_date_epoch_days": element._offering.Ticket.DateStartEpochDays,
          "exp_date_epoch_days": element._offering.Ticket.DateExpiresEpochDays,
          "is_linked_to_user_profile": false,
          "type_expiration": element._offering.Ticket.ExpirationTypeId,
          "add_time": 240,
          "recharges_pending": 0,//(this.currentExistingProducts[currentIndex]) ? rechargesPending : 0,
          "days": (element._offering.Ticket.Value),
          "isAccountBased": element._isAccountBased,
          "isCardBased": element._isCardBased
        }
        break;
      case 2:
        JsonObjectForProductType = {
          "product_type": element._offering.Ticket.Group,
          "designator": element._offering.Ticket.Designator,
          "ticket_id": element._offering.Ticket.TicketId,
          "designator_details": 0,
          "remaining_rides": (element._quantity * element._offering.Ticket.Value),
          "recharge_rides": 0,//(this.currentExistingProducts[currentIndex]) ? rechargeRides : 0,
          "threshold": 0,
          "is_linked_to_user_profile": false,
          "isAccountBased": element._isAccountBased,
          "isCardBased": element._isCardBased
        }
        break;
      case 3:
        JsonObjectForProductType = {
          "product_type": element._offering.Ticket.Group,
          "designator": element._offering.Ticket.Designator,
          "ticket_id": element._offering.Ticket.TicketId,
          "designator_details": 0,
          "is_linked_to_user_profile": false,
          "remaining_value": (element._quantity * element._offering.Ticket.Value * 100), //(this.currentExistingProducts[currentIndex]) ? remainingValue : (element.Ticket.Price * 100),
          "isAccountBased": element._isAccountBased,
          "isCardBased": element._isCardBased
        }
        break;

      default:
        break;
    }
    return JsonObjectForProductType;
  }


}


