import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges, NgZone } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ElectronService } from 'ngx-electron';
import { Router, ActivatedRoute } from '@angular/router';
import { SSL_OP_NO_TICKET } from 'constants';
import { encode } from 'punycode';
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
  merchantise = [];
  merchantList: any = [];
  encodeParseData: any = [];
  encodeJsonData: any = [];
  readCarddata: any = {};
  cardJson: any = [];
  productCardList: any = [];
  encodedProductCardData: any = [];
  currentCard: any = [];
  currentCardMerchantList: any = [];
  cardIndex: any = 0;
  carddata: any = [];
  transactionId: any = "";
  transactionAmount: any = 0;
  isNew: any = false;
  catalogJson: any = [];
  terminalConfigJson: any = [];
  JsonObjCardObj: any = [];
  isFromCardComponent = false;
  isCorrectCardPlaced = false;
  isFromEncode = false;
  executeIpcRendererOn: any = true;
  constructor(private cdtaService: CdtaService, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService) {
    route.params.subscribe(val => {
      this.cardIndex = 0;
      this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
      this.transactionAmount = JSON.parse(localStorage.getItem('transactionAmount'));
      this.merchantList = localStorage.getItem('encodeData');
      this.productCardList = localStorage.getItem('productCardData');
      this.encodeParseData = JSON.parse(this.merchantList);
      this.encodedProductCardData = JSON.parse(this.productCardList);
      this.cardJson = JSON.parse(localStorage.getItem("cardsData"));
      let item = JSON.parse(localStorage.getItem("catalogJSON"));
      this.catalogJson = JSON.parse(item).Offering;
      // this.readCarddata = JSON.parse(localStorage.getItem("cardsData"));
      // this.cardJson = JSON.parse(this.readCarddata);
      this.currentCard = this.cardJson[this.cardIndex];
      this.populatCurrentCardEncodedData();
      // if(localStorage.getItem('cardDataRouterCount') == null){
      //   this.executeIpcRendererOn = true;
      //   localStorage.setItem('cardDataRouterCount', this.executeIpcRendererOn);
      // }else{
      //   this.executeIpcRendererOn = false;
      //   localStorage.setItem('cardDataRouterCount', this.executeIpcRendererOn);
      // }
      // this.checkIsCardNew();
      // put the code from `ngOnInit` here
    });

    var updateCardDataListener: any = this.electronService.ipcRenderer.on('updateCardDataResult', (event, data) => {
      if (data != undefined && data != "" && this.isFromCardComponent) {
        this.electronService.ipcRenderer.send('readSmartcard', cardName)
      }

    });
    var readcardListener: any = this.electronService.ipcRenderer.on('readcardResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "" && this.isFromCardComponent && this.executeIpcRendererOn) {
        this.isFromCardComponent = false;
        this._ngZone.run(() => {
          localStorage.setItem("readCardData", JSON.stringify(data));
          this.carddata = new Array(JSON.parse(data));
          console.log('this.carddata', this.carddata);
          this.electronService.ipcRenderer.send('generateSequenceNumber');
        });
      }
      // this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    });
    var cardPIDListener: any = this.electronService.ipcRenderer.on('getCardPIDResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "" && this.isFromEncode) {
        this.isFromEncode = false;
        this._ngZone.run(() => {
          if (data == this.cardJson[this.cardIndex].printed_id) {
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
    
    var sequenceNumberListener: any = this.electronService.ipcRenderer.on('generateSequenceNumberSyncResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
          this.transactionId = data;
          var cardsjson: any = [];
          var unitPrice: any = 0;
          var fareCode: any = "";
          var walletObj: any = [];
          var shiftType: any = 0;
          // var de
          // get unit price for ticket
          this.catalogJson.forEach(catalogElement => {
            if ((null == catalogElement.Ticket) &&
              (false == catalogElement.IsMerchandise) &&
              (null != catalogElement.WalletType)) {
              if (catalogElement.WalletType.WalletTypeId == 3) {
                unitPrice = catalogElement.UnitPrice;
              }
            }
          });
          // get farecode from terminal config
          this.terminalConfigJson.Farecodes.forEach(terminalConfigElement => {
            if (this.currentCard.user_profile == terminalConfigElement.FareCodeId) {
              fareCode = terminalConfigElement.Description;
            }
          });

          // get shiftType from ShiftReport
          var shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
          var userId = localStorage.getItem("userID")
          shiftReports.forEach(shiftReportElement => {
            if (shiftReportElement.userID == userId) {
              shiftType = shiftReportElement.shiftType;
            }
          })

          this.cardJson.forEach(element => {
            this.currentCardMerchantList.forEach(walletElement => {
              var jsonWalletObj = { "transactionID": this.transactionId, "quantity": 1, "productIdentifier": walletElement.ProductIdentifier, "ticketTypeId": walletElement.Ticket.TicketType.TicketTypeId, "ticketValue": walletElement.Ticket.Value, "status": "ACTIVE", "slotNumber": 3, "startDate": walletElement.DateEffective, "expirationDate": walletElement.DateExpires, "balance": walletElement.UnitPrice, "rechargesPending": 0, "IsMerchandise": walletElement.IsMerchandise, "IsBackendMerchandise": false, "IsFareCard": false, "unitPrice": walletElement.UnitPrice, "totalCost": this.transactionAmount, "userID": localStorage.getItem("userEmail"), "shiftID": 1, "fareCode": fareCode, "offeringId": walletElement.OfferingId, "cardPID": element.printed_id, "cardUID": element.uid, "walletTypeId": 3, "shiftType": shiftType, "timestamp": new Date().getTime() }
              walletObj.push(jsonWalletObj);
            });
            var JsonObj: any = { "transactionID": this.transactionId, "cardPID": element.printed_id, "cardUID": element.uid, "quantity": (this.isNew) ? 1 : 0, "productIdentifier": JSON.parse(localStorage.getItem("smartCardProductIndentifier")), "ticketTypeId": null, "ticketValue": 0, "slotNumber": 0, "expirationDate": element.card_expiration_date, "balance": 0, "IsMerchandise": false, "IsBackendMerchandise": false, "IsFareCard": true, "unitPrice": (this.isNew) ? unitPrice : 0, "totalCost": (this.isNew) ? unitPrice : 0, "userID": localStorage.getItem("userEmail"), "shiftID": 1, "fareCode": fareCode, "walletContentItems": walletObj, "walletTypeId": 3, "shiftType": shiftType, "timestamp": new Date().getTime() };
            this.JsonObjCardObj.push(JsonObj);

          });
          if (localStorage.getItem("paymentMethodId") == "8") {
            var paymentObj = { "paymentMethodId": Number(localStorage.getItem("paymentMethodId")), "amount": this.transactionAmount, "comment": localStorage.getItem("compReason") }
          }else{
             paymentObj = { "paymentMethodId": Number(localStorage.getItem("paymentMethodId")), "amount": this.transactionAmount, "comment": null }
          }
          var transactionObj =
          {
            "userID": localStorage.getItem("userEmail"), "timestamp": new Date().getTime(), "transactionID": this.transactionId, "transactionType": "Charge", "transactionAmount": this.transactionAmount, "salesAmount": this.transactionAmount, "taxAmount": 0,
            "items": this.JsonObjCardObj,
            "payments": [paymentObj], "shiftType": shiftType
          }
          console.log("transObj" + JSON.stringify(transactionObj));
          this.electronService.ipcRenderer.send('savaTransaction', transactionObj);
        });
      }
      // this.electronService.ipcRenderer.removeAllListeners("generateSequenceNumberSyncResult");
    });

    var transactionListener: any = this.electronService.ipcRenderer.on('saveTransactionResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
          alert("Encoding Successfull");
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
          this.router.navigate(['/readcard'])
        });
      }
      // this.electronService.ipcRenderer.removeAllListeners("saveTransactionResult");
    });

    var encodingListener: any = this.electronService.ipcRenderer.on('encodeCardResult', (event, data) => {
      if (data != undefined && data != "") {
        var expirationDate: String = (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + (new Date().getFullYear() + 10);
        console.log(data);
        this._ngZone.run(() => {
          if ((this.cardJson.length - 1) == this.cardIndex) {
            this.isFromCardComponent = true;
            this.electronService.ipcRenderer.send("updateCardData", cardName, expirationDate);
          }
          else {
            this.cardIndex++;
            this.currentCard = this.cardJson[this.cardIndex];
            this.populatCurrentCardEncodedData();
          }
        });
      }
      else {
        //  $("#encodeModal").modal('show');
      }
    });

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
    this.router.navigate(['/readcard'])
  }

  checkIsCardNew() {
    this.isNew = (this.currentCard.products.length == 1 && (this.currentCard.products[0].product_type == 3)) ? true : false;
  }

  populatCurrentCardEncodedData() {
    var dataIndex: any = 0;
    this.currentCardMerchantList = [];
    this.encodedProductCardData.forEach(element => {
      if (element == this.cardJson[this.cardIndex].printed_id) {
        this.currentCardMerchantList.push(this.encodeParseData[dataIndex]);
      }
      dataIndex++
    });
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
  }

  checkCorrectCard() {
    this.currentCard = this.cardJson[this.cardIndex];
    console.log(cardName);
    this.isFromEncode = true;
    this.electronService.ipcRenderer.send('getCardPID', cardName);
  }

  encodeCard() {
    console.log("product list data", this.currentCardMerchantList);
    this.encodeJsonData = [];
    var JsonObj;
    this.currentCardMerchantList.forEach(element => {
      if (element.Ticket.Group == 1)
        JsonObj = {
          "product_type": element.Ticket.Group,
          "designator": element.Ticket.Designator,
          "ticket_id": element.Ticket.TicketId,
          "designator_details": 0,
          "start_date_epoch_days": element.Ticket.DateStartEpochDays,
          "exp_date_epoch_days": element.Ticket.DateExpiresEpochDays,
          "is_linked_to_user_profile": false,
          "type_expiration": element.Ticket.ExpirationTypeId,
          "add_time": 240,
          "recharges_pending": 0,
          "days": element.Ticket.Value,
          "isAccountBased": element.IsAccountBased,
          "isCardBased": element.IsCardBased
        }
      else if (element.Ticket.Group == 2) {
        JsonObj = {
          "product_type": element.Ticket.Group,
          "designator": element.Ticket.Designator,
          "ticket_id": element.Ticket.TicketId,
          "designator_details": 0,
          "remaining_rides": element.Ticket.Value,
          "recharge_rides": 0,
          "threshold": 0,
          "is_linked_to_user_profile": false,
          "isAccountBased": element.IsAccountBased,
          "isCardBased": element.IsCardBased
        }
      }
      else if (element.Ticket.Group == 3) {
        JsonObj = {
          "product_type": element.Ticket.Group,
          "designator": element.Ticket.Designator,
          "ticket_id": element.Ticket.TicketId,
          "designator_details": 0,
          "is_linked_to_user_profile": false,
          "remaining_value": element.Ticket.Price * 100,
          "isAccountBased": element.IsAccountBased,
          "isCardBased": element.IsCardBased
        }
      }
      this.encodeJsonData.push(JsonObj);

    });

    console.log(this.encodeJsonData);
    this.checkIsCardNew();
    if (this.isNew)
      this.electronService.ipcRenderer.send('encodenewCard', this.currentCard.printed_id, 1, 0, 0, this.encodeJsonData);
    else
      this.electronService.ipcRenderer.send('encodeExistingCard', this.currentCard.printed_id, this.encodeJsonData);
  }
}
