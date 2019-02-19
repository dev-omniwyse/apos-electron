import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges, NgZone } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ElectronService } from 'ngx-electron';
import { Router } from '@angular/router';
import { SSL_OP_NO_TICKET } from 'constants';
// import { product_log } from '../../../assets/data/product_catalog'
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
  cardJson: any= [];
  productCardList: any = [];
  encodedProductCardData: any = [];
  currentCard:any = [];
  currentCardMerchantList:any = [];
  cardIndex:any = 0;
  carddata:any = [];
  transactionId:any = "";
  transactionAmount:any = 0;
  isNew:any = false;
  catalogJson:any = [];
  terminalConfigJson:any = [];
  JsonObjCardObj:any = [];
  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService) {

  this.electronService.ipcRenderer.on('readcardResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
          this._ngZone.run(() => {
              localStorage.setItem("readCardData", JSON.stringify(data));
              this.carddata = new Array(JSON.parse(data));
              console.log('this.carddata', this.carddata);
              this.electronService.ipcRenderer.send('generateSequenceNumber');
          });
      }
  });

  this.electronService.ipcRenderer.on('generateSequenceNumberResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
          this._ngZone.run(() => {
            this.transactionId = data;
            var cardsjson:any = [];
            var unitPrice:any = 0;
            var fareCode:any = "";
            var walletObj:any = [];
            // var de
            this.catalogJson.forEach(catalogElement => {
              if ((null == catalogElement.Ticket) &&
              (false == catalogElement.IsMerchandise) &&
              (null != catalogElement.WalletType)) {
                if (catalogElement.WalletType.WalletTypeId == 3) {
                  unitPrice = catalogElement.WalletType.UnitPrice;
                }
              }
            });
            this.terminalConfigJson.Farecodes.forEach(terminalConfigElement => {
              if (this.currentCard.user_profile == terminalConfigElement.FareCodeId){
                  fareCode = terminalConfigElement.Description;
                }
            });
           
            this.cardJson.forEach(element => {
              this.currentCardMerchantList.array.forEach(walletElement => {
                var jsonWalletObj = {"transactionID":this.transactionId,"quantity":1,"productIdentifier":walletElement.ProductIdentifier,"ticketTypeId":walletElement.Ticket.TicketType.TicketTypeId,"ticketValue":walletElement.Ticket.Value,"status":"ACTIVE","slotNumber":3,"startDate":walletElement.DateEffective,"expirationDate":walletElement.DateExpires,"balance":walletElement.UnitPrice,"rechargesPending":0,"IsMerchandise":walletElement.IsMerchandise,"IsBackendMerchandise":false,"IsFareCard":false,"unitPrice":walletElement.unitPrice,"totalCost":this.transactionAmount,"userID":"admin@ta.com","shiftID":1,"fareCode":fareCode,"offeringId":walletElement.OfferingId,"cardPID":element.printed_id,"cardUID":element.uid,"walletTypeId":walletElement.Ticket.WalletType.WalletTypeId,"shiftType":0,"timestamp":new Date().getTime()}
                walletObj.push(jsonWalletObj);
              });
              var JsonObj:any = {"transactionID":this.transactionId,"cardPID":element.printed_id,"cardUID":element.uid,"quantity":(this.isNew)?1:0,"productIdentifier":null,"ticketTypeId":null,"ticketValue":0,"slotNumber":0,"expirationDate":element.card_expiration_date,"balance":0,"IsMerchandise":false,"IsBackendMerchandise":false,"IsFareCard":true,"unitPrice":(this.isNew)?unitPrice:0,"totalCost":(this.isNew)?unitPrice:0,"userID":"admin@ta.com","shiftID":1,"fareCode":fareCode,"walletContentItems":walletObj,"walletTypeId":3,"shiftType":0,"timestamp":new Date().getTime()};
              this.JsonObjCardObj.push(JsonObj);
              
            });
            var transactionObj = 
            {"userID":"admin@ta.com","timestamp":new Date().getTime(),"transactionID":this.transactionId,"transactionType":"Charge","transactionAmount":this.transactionAmount,"salesAmount":this.transactionAmount,"taxAmount":0,
            "items":this.JsonObjCardObj,
            "payments":[{"paymentMethodId":2,"amount":this.transactionAmount}],"shiftType":0}
            this.electronService.ipcRenderer.send('savaTransaction', transactionObj);
          });
      }
  });

  this.electronService.ipcRenderer.on('savaTransactionResult', (event, data) => {
    console.log("data", data)
    if (data != undefined && data != "") {
        this._ngZone.run(() => {
          this.router.navigate(['/readcard']) 
        });
    }
});

    this.electronService.ipcRenderer.on('encodeCardResult', (event, data) => {
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
        if(this.encodeParseData.length-1 == this.cardIndex)
          this.electronService.ipcRenderer.send('readSmartcard', cardName)
        else{
          this.cardIndex++;
          this.currentCard = this.cardJson[this.cardIndex];
          this.populatCurrentCardEncodedData();
        }
     });

     this.electronService.ipcRenderer.on('switchLoginCallResult', (event, data) => {
      if (data != undefined && data != "") {
          localStorage.setItem('terminalConfigJson',data)
          this._ngZone.run(() => {
            this.terminalConfigJson = JSON.parse(data);
          });
      }
  });
          //this.show = true;
      //  saveTransaction(merch){
      //  this.saveTransactionData.push(merch);

      // this.electronService.ipcRenderer.send('savaTransaction',  this.merchantList)
      // console.log(this.merchantList);
  
          // this._ngZone.run(() => {
            // if(this.encodeParseData.length-1 == this.cardIndex)
            //    this.router.navigate(['/readcard']) 
            // else{
            //   this.cardIndex++;
            //   this.currentCard = this.cardJson[this.cardIndex];
            //   this.populatCurrentCardEncodedData();
            // }
          // });
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
    this.electronService.ipcRenderer.send("switchlogincall");
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
    this.isNew = (this.currentCard.products.length == 1 && (this.currentCard.products[0].product_type == 3))?true:false;
    this.populatCurrentCardEncodedData();
  }

  populatCurrentCardEncodedData(){
    var dataIndex:any = 0;
    this.currentCardMerchantList = [];
    this.encodedProductCardData.forEach(element => {
      if(element == this.currentCard.printed_id){
        this.currentCardMerchantList.push(this.encodeParseData[dataIndex]);
      }
      dataIndex++
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
    }
  }

  // {"product_type":1,"
  // designator":54,
  // "ticket_id":203,
  // "designator_details":0,
  // "start_date_epoch_days":0,
  // "exp_date_epoch_days":0,
  // "is_linked_to_user_profile":false,
  // "type_expiration":1,
  // "add_time":240,
  // "recharges_pending":0,
  // "days":1,
  // "isAccountBased":false,
  // "isCardBased":true}

  encodeCard() {
    console.log("product list data" ,this.currentCardMerchantList);
    this.encodeJsonData = [];
    var JsonObj;
    this.currentCardMerchantList.forEach(element => {
    if(element.Ticket.Group == 1)
    JsonObj = {
      "product_type":element.Ticket.Group,
      "designator":element.Ticket.Designator,
      "ticket_id":element.Ticket.TicketId,
      "designator_details":0,
      "start_date_epoch_days":element.Ticket.DateStartEpochDays,
      "exp_date_epoch_days":element.Ticket.DateExpiresEpochDays,
      "is_linked_to_user_profile":false,
      "type_expiration":element.Ticket.ExpirationTypeId,
      "add_time":240,
      "recharges_pending":0,
      "days":element.Ticket.Value,
      "isAccountBased":element.IsAccountBased,
      "isCardBased":element.IsCardBased
    }
    else if(element.Ticket.Group == 2){
      JsonObj = {
        "product_type":element.Ticket.Group,
        "designator":element.Ticket.Designator,
        "ticket_id":element.Ticket.TicketId,
        "designator_details":0,
        "remaining_rides": element.Ticket.Value,
        "recharge_rides": 0,
        "threshold":0,
        "is_linked_to_user_profile":false,
        "isAccountBased":element.IsAccountBased,
        "isCardBased":element.IsCardBased
      }
    }
    else if(element.Ticket.Group == 3){
      JsonObj = {
        "product_type":element.Ticket.Group,
        "designator":element.Ticket.Designator,
        "ticket_id":element.Ticket.TicketId,
        "designator_details":0,
        "is_linked_to_user_profile":false,
        "remaining_value": element.Ticket.Price*100,
        "isAccountBased":element.IsAccountBased,
        "isCardBased":element.IsCardBased
      }
    }
    this.encodeJsonData.push(JsonObj);
      
    });
    // this.encodeJsonData = [
    //   {
    //     "product_type" : this.encodeParseData[0].Ticket.TicketType.TicketTypeId,
    //     "ticket_id": this.encodeParseData[0].Ticket.TicketId,
    //     "designator": this.encodeParseData[0].Ticket.Designator,
    //     "designator_details":0,
    //     "is_linked_to_user_profile":false,
    //     "balance":this.encodeParseData[0].Ticket.Price,
    //     "isAccountBased":false,
    //     "isCardBased":true
    //     }]
      // [{
      //   "type_expiration":0,
      //   // "add_time":0,
      //   "recharges_pending":0,
      //   "days":31,
      //   "priority_and_condition":5,
      //   "status":"ACTIVE",
      //   "is_prod_bad_listed":false,
      //   "product_type": this.encodeParseData[0].Ticket.TicketType.TicketTypeId,
      //   "ticket_id":this.encodeParseData[0].Ticket.TicketId,
      //   "designator":this.encodeParseData[0].Ticket.Designator,
      //   "designator_details":0,
      //   "start_date_epoch_days":0,
      //   "exp_date_epoch_days":0,
      //   "is_linked_to_user_profile":false,
      //   "sourceZone":0,
      //   "destinationZone":0,
      //   "mfgId":0,
      //   "equipmentType":0,
      //   "equipmentId":0,
      //   "individualLoadSeqNo":0,
      //   "tpbCode":0,
      //   "rangeLoadSeqNo":0,
      //   "fileSize":0,
      //   "accessRights":0,
      //   "fileVersion":0,
      //   "slotNumber":2,
      //   "balance":this.encodeParseData[0].Ticket.Price,
      //   "isRegistered":false,
      //   "start_date":18000000,
      //   "isAutoRechargeBackend":false,
      //   "isAutoRechargePurse1":false,
      //   "isAutoRechargePurse2":false,
      //   "isCardBased":true,
      //   "isAccountBased":false,
      //   "isTpbLock":false,
      //   "exp_date":18000000,
      //   "exp_date_str":"02/03/2019",
      //   "start_date_str":"01/01/1970"
      //   }]

  console.log(this.encodeJsonData);
    if(this.isNew)
     this.electronService.ipcRenderer.send('encodenewCard', this.currentCard.printed_id ,1,0,0, this.encodeJsonData);
    else
    this.electronService.ipcRenderer.send('encodeExistingCard', this.currentCard.printed_id , this.encodeJsonData);
  }
}
