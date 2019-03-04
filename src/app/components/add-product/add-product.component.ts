import { Component, NgZone, OnInit, ViewChildren } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
declare var pcsc: any;
declare var $: any;
var pcs = pcsc();
var cardName: any;
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
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  merchantise = [];
  merch = [];
  merchantList: any = [];
  merchantiseList: any = [];
  MagneticList: any = [];
  productCardList: any = [];
  productTotal: any = 0;
  checkout = true;
  payPricing: any = [];
  cardJson: any = [];
  productJson: any = [];
  readCarddata: any = {};
  numberDigits: any = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  zeroDigits: any = ["0", "00"]
  saveTransactionData: any;
  encodeJsonData: any = []; // encode data json 
  currentCard: any = {};
  selectedIdx: any = 0;
  selectedProductCategoryIndex: any = 0;
  nonFare = true;
  regularRoute = false;
  isMagnetic = false;
  isMerchendise = false;
  terminalConfigJson: any = [];
  isfromAddProduct = false;

  @ViewChildren('cardsList') cardsList;
  constructor(private cdtaService: CdtaService, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, ) {
    route.params.subscribe(val => {
      this.isMagnetic = localStorage.getItem("isMagnetic") == "true" ? true : false;
      this.isMerchendise = localStorage.getItem("isNonFareProduct") == "true" ? true : false;
      let item = JSON.parse(localStorage.getItem("catalogJSON"));
      this.productJson = JSON.parse(item).Offering;
      console.log(this.productJson);
      this.readCarddata = JSON.parse(localStorage.getItem("readCardData"));
      this.cardJson.push(JSON.parse(this.readCarddata));
      this.currentCard = JSON.parse(this.readCarddata);
      this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
      console.log(this.readCarddata);
      if (this.isMerchendise) {
        this.clickOnMerch();
      }
      else
        this.frequentRide();
      // this.cardsList.toArray()[0].nativeElement.classList.add('isActive');
    });
    var readCardListener = this.electronService.ipcRenderer.on('readcardResult', (event, data) => {
      var isDuplicateCard = false;
      if (this.isfromAddProduct && data != undefined && data != "") {
        this.isfromAddProduct = false;
        this._ngZone.run(() => {
          this.cardJson.forEach(element => {
            if (element.printed_id == JSON.parse(data).printed_id) {
              isDuplicateCard = true;
            }
          });
          if (isDuplicateCard) {
            // $("#newCardValidationModal").modal('show');
          }
          else {
            this.cardJson.push(JSON.parse(data));
          }
        });
      }
      this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    });

    var transactionListener: any = this.electronService.ipcRenderer.on('saveTransactionForMagneticMerchandiseResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
          localStorage.removeItem('encodeData');
          localStorage.removeItem('productCardData');
          localStorage.removeItem("cardsData");
          localStorage.removeItem("readCardData");
          this.electronService.ipcRenderer.removeAllListeners("readCardResult");
          this.electronService.ipcRenderer.removeAllListeners("getCardPIDResult");
          this.electronService.ipcRenderer.removeAllListeners("generateSequenceNumberSyncResult");
          this.electronService.ipcRenderer.removeAllListeners("saveTransactionResult");
          this.electronService.ipcRenderer.removeAllListeners("encodeCardResult");
          this.router.navigate(['/readcard'])
        });
      }
      this.electronService.ipcRenderer.removeAllListeners("saveTransactionResult");
    });

    this.electronService.ipcRenderer.on('creditOrDebitResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('checkResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          //this.router.navigate(['/addproduct'])
          // this.carddata = new Array(JSON.parse(data));
        });
      }
    });
    this.electronService.ipcRenderer.on('existingFareCardResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('voucherResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          //  this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('payAsYouGoResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });
    this.electronService.ipcRenderer.on('compResult', (event, data) => {
      if (data != undefined && data != "") {
        //this.show = true;
        this._ngZone.run(() => {
          //this.router.navigate(['/addproduct'])
        });
      }
    });
  }

  ngOnInit() {
    // let item = JSON.parse(localStorage.getItem("catalogJSON"));
    // this.productJson = JSON.parse(item).Offering;
    // console.log(this.productJson);
    // this.readCarddata = JSON.parse(localStorage.getItem("readCardData"));
    // this.cardJson.push(JSON.parse(this.readCarddata));
    // this.currentCard = JSON.parse(this.readCarddata)
    // console.log(this.readCarddata);
    // this.frequentRide();
    // this.cardsList.toArray()[0].nativeElement.classList.add('isActive');
  }

  navigateToReadCard() {
    localStorage.removeItem("readCardData");
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem('cardsData');
    localStorage.removeItem('transactionAmount');
    localStorage.removeItem("MerchandiseData");
    localStorage.removeItem("MagneticData");
    this.router.navigate(['/readcard'])
  }

  ngOnDestroy() {
    this.electronService.ipcRenderer.removeAllListeners("readCardResult");
  }


  creditOrDebit(event) {
    this.electronService.ipcRenderer.send('creditOrDebit')
    //console.log('read call', cardName)
  }
  check(event) {
    this.electronService.ipcRenderer.send('check')
    //console.log('read call', cardName)
  }
  existingFareCard(event) {
    this.electronService.ipcRenderer.send('existingFareCard')
    //console.log('read call', cardName)
  }
  voucher(event) {
    this.electronService.ipcRenderer.send('voucher')
    //console.log('read call', cardName)
  }
  payAsYouGo(event) {
    this.electronService.ipcRenderer.send('payAsYouGo')
    //console.log('read call', cardName)
  }
  comp(event) {
    this.electronService.ipcRenderer.send('comp')
    //console.log('read call', cardName)
  }

  getSelectedProductData(merch) {
    this.merchantList.push(merch);
    this.productCardList.push(this.currentCard.printed_id)
    this.productTotal = this.productTotal + parseFloat(merch.Ticket.Price);
  }

  getSelectedMerchProductData(merch) {
    this.merchantiseList.push(merch);
    this.productTotal = this.productTotal + parseFloat(merch.UnitPrice)
  }

  getSelectedMagneticProductData(merch) {
    if (this.MagneticList.length == 1) {
      $("#magneticCardLimitModal").modal('show');
      return;
    }
    this.MagneticList.push(merch);
    this.productTotal = this.productTotal + parseFloat(merch.UnitPrice)
  }


  removeProduct(merch) {
    this.productTotal = this.productTotal - parseFloat(merch.Ticket.Price);
    var selectedIndex = this.merchantList.indexOf(merch);
    this.merchantList.splice(selectedIndex, 1);
    this.productCardList.splice(selectedIndex, 1);
  }

  removeMerchProduct(merch) {
    this.productTotal = this.productTotal - parseFloat(merch.UnitPrice);
    var selectedIndex = this.merchantiseList.indexOf(merch);
    this.merchantiseList.splice(selectedIndex, 1);
    this.productCardList.splice(selectedIndex, 1);
  }

  removeMagneticProduct(merch) {
    this.productTotal = this.productTotal - parseFloat(merch.UnitPrice);
    var selectedIndex = this.MagneticList.indexOf(merch);
    this.MagneticList.splice(selectedIndex, 1);
    this.productCardList.splice(selectedIndex, 1);
  }

  productCheckout() {
    localStorage.setItem('encodeData', JSON.stringify(this.merchantList));
    localStorage.setItem("MerchandiseData", JSON.stringify(this.merchantiseList));
    localStorage.setItem("MagneticData", JSON.stringify(this.MagneticList));
    localStorage.setItem('productCardData', JSON.stringify(this.productCardList));
    localStorage.setItem('cardsData', JSON.stringify(this.cardJson));
    localStorage.setItem('transactionAmount', JSON.stringify(this.productTotal));
    this.checkout = false;
  }

  selectCard(index: any) {
    this.selectedIdx = index;
    this.nonFare = true;
    this.regularRoute = false;
    localStorage.setItem("isMerchandise", "false");
    this.currentCard = this.cardJson[index];
    // this.cardsList.toArray()[index].nativeElement.setStyle('color','red');
    (this.selectedProductCategoryIndex == 0) ? this.frequentRide() : (this.selectedProductCategoryIndex == 1) ? this.storedValue() : this.payValue();
  }

  // stored ride values
  storedValue() {
    this.selectedProductCategoryIndex = 1;
    this.merchantise = [];
    this.cdtaService.getJSON().subscribe(data => {
      var i = 0;
      this.productJson.forEach(element => {
        var isCorrectType = false;
        if (element.Ticket != undefined && element.Ticket.WalletType != undefined) {
          element.Ticket.WalletType.forEach(walletElement => {
            if (this.isMagnetic) {
              if (walletElement.WalletTypeId == 10)
                isCorrectType = true;
            }
            else {
              if (walletElement.WalletTypeId == 3)
                isCorrectType = true;
            }
          });
        }
        if (!this.isMagnetic && null != element.Ticket && undefined != element.Ticket && isCorrectType && this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "2" && (element.Ticket.TicketType.TicketTypeId == 2 && !element.IsMerchandise)) {
          this.merchantise.push(element);
        }
        else if (this.isMagnetic && undefined != element.Ticket && undefined != element.Ticket.WalletType && isCorrectType && element.Ticket.Group == "2") {
          this.merchantise.push(element);
        }
      });
    });
  }
  frequentRide() {
    this.selectedProductCategoryIndex = 0;
    this.merchantise = [];
    this.productJson.forEach(element => {
      var isCorrectType = false;
      if (element.Ticket != undefined && element.Ticket.WalletType != undefined) {
        element.Ticket.WalletType.forEach(walletElement => {
          if (this.isMagnetic) {
            if (walletElement.WalletTypeId == 10)
              isCorrectType = true;
          }
          else {
            if (walletElement.WalletTypeId == 3)
              isCorrectType = true;
          }
        });
      }
      if (!this.isMagnetic && null != element.Ticket && undefined != element.Ticket && isCorrectType && this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "1" && (element.Ticket.TicketType.TicketTypeId == 3 && !element.IsMerchandise)) {
        this.merchantise.push(element);
      }
      else if (this.isMagnetic && undefined != element.Ticket && undefined != element.Ticket.WalletType && isCorrectType && element.Ticket.Group == "1") {
        this.merchantise.push(element);
      }
    });

  }
  payValue() {
    this.selectedProductCategoryIndex = 2;
    this.merchantise = [];
    this.productJson.forEach(element => {
      var isCorrectType = false;
      if (element.Ticket != undefined && element.Ticket.WalletType != undefined) {
        element.Ticket.WalletType.forEach(walletElement => {
          if (this.isMagnetic) {
            if (walletElement.WalletTypeId == 10)
              isCorrectType = true;
          }
          else {
            if (walletElement.WalletTypeId == 3)
              isCorrectType = true;
          }
        });
      }
      if (!this.isMagnetic && null != element.Ticket && undefined != element.Ticket && isCorrectType && this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "3" && (element.Ticket.TicketType.TicketTypeId == 1 && !element.IsMerchandise)) {
        this.merchantise.push(element);
      }
      else if (this.isMagnetic && undefined != element.Ticket && undefined != element.Ticket.WalletType && isCorrectType && element.Ticket.Group == "3") {
        this.merchantise.push(element);
      }
    });
  }

  addCard() {
    this.isfromAddProduct = true;
    this.electronService.ipcRenderer.send('readSmartcard', cardName)
  }

  // Boolean getWalletTypeID(walletList:any []) {
  //   walletList.forEach(element => {
  //     if(element.WalletTypeId == 10)
  //       return true;
  //   });

  // }

  clickOnMagnetic() {
    // console.log('clicked on Magnetic')
    // // this.nonFare = false;
    // // this.regularRoute = true;
    // this.merchantise = [];
    // this.productJson.forEach(element => { // hardcoded to 10 later need to put in constants file
    //   var isMagnetic = false;
    //   if(element.Ticket != undefined && element.Ticket.WalletType != undefined){
    //     element.Ticket.WalletType.forEach(walletElement => {
    //       if(walletElement.WalletTypeId == 10)
    //       isMagnetic = true;
    //     });
    //   }
    //   if (undefined != element.Ticket && undefined != element.Ticket.WalletType && isMagnetic) {
    //     this.merchantise.push(element);
    //   }
    //   console.log(this.merchantise)

    // });
  }

  clickOnMerch() {
    console.log('clicked on merch')
    this.nonFare = false;
    this.regularRoute = true;
    this.merchantise = [];
    localStorage.setItem("isMerchandise", "true");
    this.productJson.forEach(element => {
      if ((null == element.Ticket || undefined == element.Ticket) && (element.IsMerchandise)) {
        this.merchantise.push(element);
      }
      console.log(this.merchantise)

    });
  }

  displayDigit(digit) {
    console.log("numberDigits", digit);
    if (this.productTotal == 0) {
      this.productTotal = digit;
      // this.productTotal+=digit
    } else
      this.productTotal += digit

  }
  clearDigit(digit) {
    console.log("numberDigits", digit);
    this.productTotal = digit
  }
  saveTransaction(paymentMethodId) {
    var walletObj: any = [];
    var jsonMagneticObj: any = [];
    var jsonMerchandiseObj: any = [];
    var unitPrice: any = 0;
    var fareCode: any = "";
    var shiftType: any = 0;

    // var de
    this.productJson.forEach(catalogElement => {
      if ((null == catalogElement.Ticket) &&
        (false == catalogElement.IsMerchandise) &&
        (null != catalogElement.WalletType)) {
        if (catalogElement.WalletType.WalletTypeId == 3) {
          unitPrice = catalogElement.WalletType.UnitPrice;
        }
      }
    });
    fareCode = "full";
    // get shiftType from ShiftReport
    var shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    var userId = localStorage.getItem("userID")
    shiftReports.forEach(shiftReportElement => {
      if (shiftReportElement.userID == userId) {
        shiftType = shiftReportElement.shiftType;
      }
    })
    //Magnetic
    if (this.isMagnetic) {
      this.MagneticList.forEach(walletElement => {
        var jsonWalletObj = { "transactionID": new Date().getTime(), "quantity": 1, "productIdentifier": walletElement.ProductIdentifier, "ticketTypeId": walletElement.Ticket.TicketType.TicketTypeId, "ticketValue": walletElement.Ticket.Value, "status": "ACTIVE", "slotNumber": 3, "startDate": walletElement.DateEffective, "expirationDate": walletElement.DateExpires, "balance": walletElement.UnitPrice, "rechargesPending": 0, "IsMerchandise": walletElement.IsMerchandise, "IsBackendMerchandise": false, "IsFareCard": false, "unitPrice": walletElement.UnitPrice, "totalCost": this.productTotal, "userID": localStorage.getItem("userEmail"), "shiftID": 1, "fareCode": fareCode, "offeringId": walletElement.OfferingId, "cardPID": "Magnetic 1", "cardUID": new Date().getTime(), "walletTypeId": 3, "shiftType": shiftType, "timestamp": new Date().getTime() }
        walletObj.push(jsonWalletObj);
      });
      var JsonObj: any = { "transactionID": new Date().getTime(), "cardPID": "Magnetic 1", "cardUID": new Date().getTime(), "quantity": 1, "productIdentifier": JSON.parse(localStorage.getItem("magneticProductIndentifier")), "ticketTypeId": null, "ticketValue": 0, "slotNumber": 0, "expirationDate": 0, "balance": 0, "IsMerchandise": false, "IsBackendMerchandise": true, "IsFareCard": true, "unitPrice": unitPrice, "totalCost": unitPrice, "userID": localStorage.getItem("userEmail"), "shiftID": 1, "fareCode": fareCode, "walletContentItems": walletObj, "walletTypeId": 10, "shiftType": shiftType, "timestamp": new Date().getTime() };
      jsonMagneticObj.push(JsonObj);

      var magneticTransactionObj =
      {
        "userID": localStorage.getItem("userEmail"), "timestamp": new Date().getTime(), "transactionID": new Date().getTime(), "transactionType": "Charge", "transactionAmount": this.productTotal, "salesAmount": this.productTotal, "taxAmount": 0,
        "items": jsonMagneticObj,
        "payments": [{ "paymentMethodId": paymentMethodId, "amount": this.productTotal }], "shiftType": shiftType
      }
      console.log("transObj" + JSON.stringify(magneticTransactionObj));
      this.electronService.ipcRenderer.send('savaTransactionForMagneticMerchandise', magneticTransactionObj);
    }
    // Merchandise
    else if (this.nonFare == false && this.regularRoute == true) {
      this.merchantiseList.forEach(merchandiseElement => {
        var merchandiseObj: any = { "transactionID": new Date().getTime(), "quantity": 1, "productIdentifier": merchandiseElement.ProductIdentifier, "ticketTypeId": null, "ticketValue": 0, "slotNumber": 0, "balance": 0, "IsMerchandise": true, "IsBackendMerchandise": true, "IsFareCard": false, "unitPrice": merchandiseElement.UnitPrice, "totalCost": merchandiseElement.UnitPrice, "tax": 0, "userID": localStorage.getItem("userEmail"), "shiftID": 1, "fareCode": null, "shiftType": shiftType, "timestamp": new Date().getTime() };
        jsonMerchandiseObj.push(merchandiseObj);
      });
      var merchandiseTransactionObj =
      {
        "userID": localStorage.getItem("userEmail"), "timestamp": new Date().getTime(), "transactionID": new Date().getTime(), "transactionType": "Charge", "transactionAmount": this.productTotal, "salesAmount": this.productTotal, "taxAmount": 0,
        "items": jsonMerchandiseObj,
        "payments": [{ "paymentMethodId": paymentMethodId, "amount": this.productTotal }], "shiftType": shiftType
      }
      console.log("transObj" + JSON.stringify(merchandiseTransactionObj));
      this.electronService.ipcRenderer.send('savaTransactionForMagneticMerchandise', merchandiseTransactionObj);
    }
    else {
      if (paymentMethodId == "8") {
        localStorage.setItem("paymentMethodId", paymentMethodId)
        this.router.navigate(['/comp'])
      } else {
        localStorage.setItem("paymentMethodId", paymentMethodId)
        this.router.navigate(['/carddata'])
      }

    }

  }
}