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

    var transactionListener: any = this.electronService.ipcRenderer.on('saveTransactionResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
          $("#encodeSuccessModal").modal({
            backdrop: 'static',
            keyboard: false
          });
          var timestamp = new Date().getTime();
         // this.cdtaService.generateReceipt(timestamp)
        });
      } else {
        $("#encodeErrorModal").modal('show');
      }
      // this.electronService.ipcRenderer.removeAllListeners("saveTransactionResult");
    });

    var encodingListener: any = this.electronService.ipcRenderer.on('encodeCardResult', (event, data) => {
      let resultObj = new Array(JSON.parse(data));
      if (resultObj != undefined && resultObj != null && resultObj.length != 0) {
        this._ngZone.run(() => {
          for (let index = 0; index < resultObj.length; index++) {
            if(undefined != this.shoppingCart._walletLineItem[this.cardIndex]._walletContents && 0 != this.shoppingCart._walletLineItem[this.cardIndex]._walletContents.length){
              this.shoppingCart._walletLineItem[this.cardIndex]._walletContents[index]._slot = resultObj[index][0].slotNumber;
              this.shoppingCart._walletLineItem[this.cardIndex]._walletContents[index]._status = resultObj[index][0].status;
            }
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

      this.checkIsCardNew();
      if (this.isNew){
        this.electronService.ipcRenderer.send('encodenewCard', this.currentCard.printed_id, this.shoppingCart._walletLineItem[this.cardIndex]._fareCodeId, 0, 0, this.encodeJsonData);
      }else{
        this.electronService.ipcRenderer.send('encodeExistingCard', this.currentCard.printed_id, this.encodeJsonData);
      }
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
          "remaining_value": (element._quantity * element._unitPrice * 100), //(this.currentExistingProducts[currentIndex]) ? remainingValue : (element.Ticket.Price * 100),
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


