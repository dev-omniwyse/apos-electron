import { Component, NgZone, OnInit, ViewChildren } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { concat } from 'rxjs/operators';
import { parse } from 'url';
import { element } from '@angular/core/src/render3';
import { forEach } from '@angular/router/src/utils/collection';
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
  areExistingProducts: any = [];
  isfromAddProduct = false;
  maxRechargesPendingReached = false;
  maxRechargeRidesReached = false;
  maxRemainingValueReached = false;
  maxLimitErrorMessages: String = "";
  calsifilter: boolean = false;
  merchproductToRemove: any = {};
  magneticProductToRemove: any = {};
  smartCradProductToRemove: any = {};
  magneticCardList: any = [];
  magneticIds: any = [];
  currentMagneticIndex: any = 0;
  smartCardSubTotal: any = 0;
  magneticCardSubTotal: any = 0;
  merchentiseSubTotal: any = 0;
  smartCradList: any = [];
  subTotal: any = 0;
  smartCardCost: any = 0;
  magneticCardCost: any = 0;
  quantityList: any = [];
  viewCardData: any = []
  cardProductData:any = []
  @ViewChildren('cardsList') cardsList;
  constructor(private cdtaService: CdtaService, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, ) {
    route.params.subscribe(val => {
      this.isMagnetic = localStorage.getItem("isMagnetic") == "true" ? true : false;
      this.isMerchendise = localStorage.getItem("isNonFareProduct") == "true" ? true : false;
      this.smartCardCost = localStorage.getItem("smartCardCost")
      this.magneticCardCost = localStorage.getItem("magneticCardCost")
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

      if (this.isMagnetic) {
        var magnetic = {
          "name": "Magnetic" + " " + (this.magneticCardList.length + 1),
          "id": (this.magneticCardList.length)
        }
        this.magneticCardList.push(magnetic)
      }


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
            $("#newCardValidationModal").modal('show');
          }
          else {
            this.cardJson.push(JSON.parse(data));
            this.currentCard = this.cardJson[this.cardJson.length - 1]
            this.selectedProductCategoryIndex = 0;
            this.selectCard(this.cardJson.length - 1);
          }
        });
      }
      // this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    });

    var transactionListener: any = this.electronService.ipcRenderer.on('saveTransactionForMagneticMerchandiseResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
          if (this.merchantiseList.length != 0 || this.merchantList.length != 0) {
            this.saveTransaction(localStorage.getItem("paymentMethodId"));
          }
          else if (this.MagneticList.length == 0 && this.merchantiseList.length == 0 && this.merchantList.length == 0) {
            localStorage.removeItem('encodeData');
            localStorage.removeItem('productCardData');
            localStorage.removeItem("cardsData");
            localStorage.removeItem("readCardData");
            this.electronService.ipcRenderer.removeAllListeners("readCardResult");
            this.router.navigate(['/readcard'])
          }
        });
      } else {

        $("#encodeErrorModal").modal('show');

      }
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

    if (!this.isMagnetic && !this.isMerchendise) {
      var smartCard = {
        "name": "Smart" + " " + (this.smartCradList.length + 1),
        "id": (this.smartCradList.length)
      }
      this.smartCradList.push(smartCard)
    }
  }

  ngOnInit() {
    let item = JSON.parse(localStorage.getItem("readCardData"))
    this.viewCardData = new Array(JSON.parse(item))
    this.cardProductData = JSON.parse(localStorage.getItem("cardProductData"))
    console.log("viewCardData",this.viewCardData)
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
    this.calsifilter = false
    this.router.navigate(['/readcard'])
  }

  ngOnDestroy() {
    // this.electronService.ipcRenderer.removeAllListeners("readCardResult");
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

  isMaxProductLengthReached(selectedItem: any) {
    var isExistingProducts = false;
    var isProductLimitReached = false;
    var existingQuantity = 0;
    this.currentCard.products.forEach(element => {
      if (selectedItem.Ticket.Group == element.product_type && (selectedItem.Ticket.Designator == element.designator)) {
        if ((element.product_type == 1 && element.recharges_pending <= this.terminalConfigJson.MaxPendingCount) ||
          (element.product_type == 2 && ((element.recharge_rides + selectedItem.Ticket.Value) <= 255)) ||
          (element.product_type == 3 && ((element.remaining_value + (selectedItem.Ticket.Price * 100)) / 100) <= (this.terminalConfigJson.MaxStoredValueAmount / 100))) {
          if (element.product_type == 1 && element.recharges_pending >= this.terminalConfigJson.MaxPendingCount) {
            this.maxRechargesPendingReached = true;
            this.maxLimitErrorMessages = "Max pending product limit reached.";
            return;
          }
          else if (element.product_type == 2 && ((element.recharge_rides + selectedItem.Ticket.Value) >= 255)) {
            this.maxRechargeRidesReached = true;
            this.maxLimitErrorMessages = "Max stores ride limit reached.";
            return;
          }
          else if (element.product_type == 3 && (((element.remaining_value + (selectedItem.Ticket.Price * 100)) / 100) >= (this.terminalConfigJson.MaxStoredValueAmount / 100))) {
            this.maxRemainingValueReached = true;
            this.maxLimitErrorMessages = "Max stored value limit reached.";
            return;
          }
          // cardElement.recharges_pending
          isExistingProducts = true;
          if (element.product_type == 1) {
            existingQuantity = element.recharges_pending;
          }
          else if (element.product_type == 2) {
            existingQuantity = (element.remaining_rides / selectedItem.Ticket.Value);
          }
          this.areExistingProducts.push(true);
        }
        else {
          isExistingProducts = false;
        }

      }
    });
    var productCount = 0;
    if (!isExistingProducts) {
      this.areExistingProducts.push(false);
      if ((this.currentCard.products.length == this.terminalConfigJson.NumberOfProducts)) {
        isProductLimitReached = true
      }
      for (let index = 0; index < this.merchantList.length; index++) {
        const product = this.merchantList[index];
        if (selectedItem.Ticket.Group != 3 && this.currentCard.printed_id == this.productCardList[index]) {
          productCount++;
        }
      }
      if (productCount >= this.terminalConfigJson.NumberOfProducts) {
        isProductLimitReached = true;
      }

    } else {
      var existingProductCount = 0;
      for (let index1 = 0; index1 < this.merchantList.length; index1++) {
        const existingProduct = this.merchantList[index1];
        if (this.currentCard.printed_id == this.productCardList[index1] && (existingProduct.OfferingId == selectedItem.OfferingId)) {
          existingProductCount = this.quantityList[index1];
        }
      }
      if (selectedItem.Ticket.Group == 1 && ((existingQuantity + existingProductCount + 1) > this.terminalConfigJson.MaxPendingCount)) {
        isProductLimitReached = true
      }
      else if (selectedItem.Ticket.Group == 2 && ((existingQuantity + existingProductCount + 1) > 4)) {
        isProductLimitReached = true;
      }
    }
    // check if max products count reached
    // for (let index1 = 0; index1 < this.merchantList.length; index1++) {
    //   const element = this.merchantList[index1];
    //   if (this.currentCard.printed_id == this.productCardList[index1] && element.OfferingId == this.smartCradProductToRemove.OfferingId) {
    //     itemIndex = index1;
    //   }
    // }
    // if (selectedItem.quantity == undefined) {
    //   selectedItem.quantity = 0;
    // }
    // if (!isExistingProducts) {
    //   this.areExistingProducts.push(false);
    //   if ((this.currentCard.products.length == this.terminalConfigJson.NumberOfProducts) || (selectedItem.quantity == this.terminalConfigJson.NumberOfProducts)) {
    //     isProductLimitReached = true
    //   }
    //   if (selectedItem.quantity == this.terminalConfigJson.NumberOfProducts) {
    //     isProductLimitReached = true
    //   }
    // } else {
    //   if (selectedItem.Ticket.Group == 1 && ((existingQuantity + (selectedItem.quantity + 1)) > this.terminalConfigJson.MaxPendingCount)) {
    //     isProductLimitReached = true
    //   }
    //   else if (selectedItem.Ticket.Group == 2 && ((existingQuantity + (selectedItem.quantity + 1)) > 4)) {
    //     isProductLimitReached = true;
    //   }
    // }
    return isProductLimitReached;
  }

  getSelectedProductData(merch) {
    if (this.isMaxProductLengthReached(merch)) {
      if (this.maxRechargesPendingReached || this.maxRechargeRidesReached || this.maxRemainingValueReached) {
        this.maxRechargesPendingReached = false;
        this.maxRechargeRidesReached = false;
        this.maxRemainingValueReached = false;
        $("#maxCardLimitModal").modal('show');
        return
      }
      $("#magneticCardLimitModal").modal('show');
      return;
    }

    var isItemExistsInCard: any = false;
    var itemIndex = 0;
    for (let index = 0; index < this.productCardList.length; index++) {
      const element = this.productCardList[index];
      if (this.currentCard.printed_id == element && this.merchantList[index].OfferingId == merch.OfferingId) {
        isItemExistsInCard = true;
        itemIndex = index;
      }
    }

    if (this.merchantList.length == 0) {
      this.merchantList.push(merch);
      this.productCardList.push(this.currentCard.printed_id)
      this.quantityList.push(1);
    }
    else if (isItemExistsInCard == true) {
      this.quantityList[itemIndex] = this.quantityList[itemIndex] + 1;
    }
    else if (isItemExistsInCard == false) {
      this.quantityList.push(1);
      this.merchantList.push(merch);
      this.productCardList.push(this.currentCard.printed_id)
    }

    this.displaySmartCardsSubtotal(this.merchantList, false);

    this.productTotal = this.productTotal + parseFloat(merch.Ticket.Price);
  }

  getSelectedMerchProductData(merch) {
    console.log(merch);
    if (this.merchantiseList.length == 0) {
      merch.quantity = 1;
      this.merchantiseList.push(merch);
    } else if (this.merchantiseList.includes(merch) === true) {
      merch.quantity++;
    }
    else if (this.merchantiseList.includes(merch) === false) {
      merch.quantity = 1;
      this.merchantiseList.push(merch);
    }
    this.merchentiseSubTotal = this.merchentiseSubTotal + parseFloat(merch.UnitPrice);
    this.productTotal = this.productTotal + parseFloat(merch.UnitPrice)
  }

  getSelectedMagneticProductData(merch) {
    // if (this.MagneticList.length == 1) {
    //   $("#magneticCardLimitModal").modal('show');
    //   return;
    // }
    var elementExists = false;
    this.magneticIds.forEach(element => {
      if (element == this.currentMagneticIndex) {
        $("#magneticCardLimitModal").modal('show');
        elementExists = true;
      }
    });
    if (elementExists)
      return;
    this.MagneticList.push(merch);
    this.magneticIds.push(this.currentMagneticIndex);
    this.displayMagneticsSubtotal(this.MagneticList, false);
    this.productTotal = this.productTotal + parseFloat(merch.UnitPrice)
  }


  removeProduct(merch) {
    this.smartCradProductToRemove = merch;
    $("#removeSmartCardProductModal").modal('show');
    // var totalPrice = merch.UnitPrice * merch.quantity;
    // this.productTotal = this.productTotal - parseFloat(totalPrice.toString());
    // var selectedIndex = this.merchantList.indexOf(merch);
    // merch.quantity = 0;
    // this.merchantList.splice(selectedIndex, 1);
    // this.productCardList.splice(selectedIndex, 1);
    // this.areExistingProducts.splice(selectedIndex, 1);
  }

  removeSmartCardProductConfirmation(index) {
    var itemIndex = 0;
    if (index >= 0) {
      itemIndex = index;
    } else {
      for (let index1 = 0; index1 < this.merchantList.length; index1++) {
        const element = this.merchantList[index1];
        if (this.currentCard.printed_id == this.productCardList[index1] && element.OfferingId == this.smartCradProductToRemove.OfferingId) {
          itemIndex = index1;
        }
      }
    }
    var totalPrice = this.smartCradProductToRemove.UnitPrice * this.quantityList[itemIndex];
    this.productTotal = this.productTotal - parseFloat(totalPrice.toString());
    this.smartCardSubTotal = this.smartCardSubTotal - parseFloat(totalPrice.toString());
    // var selectedIndex = this.merchantList.indexOf(this.smartCradProductToRemove);
    // this.merchantList[itemIndex].quantity = 0;
    // this.smartCradProductToRemove.quantity = 0;
    this.merchantList.splice(itemIndex, 1);
    this.productCardList.splice(itemIndex, 1);
    this.quantityList.splice(itemIndex, 1);
    this.areExistingProducts.splice(itemIndex, 1);
    this.displaySmartCardsSubtotal(this.merchantList, false);

  }

  removeMerchProductConfirmation() {
    var totalPrice = this.merchproductToRemove.UnitPrice * this.merchproductToRemove.quantity;
    this.productTotal = this.productTotal - parseFloat(totalPrice.toString());
    this.merchentiseSubTotal = this.merchentiseSubTotal - parseFloat(totalPrice.toString());
    var selectedIndex = this.merchantiseList.indexOf(this.merchproductToRemove);
    this.merchantiseList.splice(selectedIndex, 1);
  }

  removeMagneticProductConfirmation() {
    this.productTotal = this.productTotal - parseFloat(this.magneticProductToRemove.UnitPrice);
    this.magneticCardSubTotal = this.magneticCardSubTotal - parseFloat(this.magneticProductToRemove.UnitPrice);
    var selectedIndex = this.MagneticList.indexOf(this.magneticProductToRemove);
    this.MagneticList.splice(selectedIndex, 1);
    this.magneticIds.splice(selectedIndex, 1);
    this.displayMagneticsSubtotal(this.MagneticList, false);
  }

  removeMerchProduct(merch) {
    this.merchproductToRemove = merch
    $("#removeMerchProductModal").modal('show');


  }

  removeMagneticProduct(merch) {
    this.magneticProductToRemove = merch
    $("#removeMagneticProductModal").modal('show');
    // this.productTotal = this.productTotal - parseFloat(merch.UnitPrice);
    // var selectedIndex = this.MagneticList.indexOf(merch);
    // this.MagneticList.splice(selectedIndex, 1);
    // this.productCardList.splice(selectedIndex, 1);
  }

  productCheckout() {
    if(this.productTotal == 0){
      $("#productTotalWarningModal").modal('show');
      return;
    }
    var index = 0;
    this.merchantList.forEach(element => {
      element.quantity = this.quantityList[index];
    });
    localStorage.setItem('encodeData', JSON.stringify(this.merchantList));
    localStorage.setItem("MerchandiseData", JSON.stringify(this.merchantiseList));
    localStorage.setItem("MagneticData", JSON.stringify(this.MagneticList));
    localStorage.setItem('productCardData', JSON.stringify(this.productCardList));
    localStorage.setItem('cardsData', JSON.stringify(this.cardJson));
    localStorage.setItem('areExistingProducts', JSON.stringify(this.areExistingProducts));
    this.checkout = false;
  }

  selectCard(index: any) {
    this.isMagnetic = false;
    localStorage.setItem("isMagnetic", 'false');
    this.selectedIdx = index;
    this.nonFare = true;
    this.regularRoute = false;
    this.isMerchendise = false;
    localStorage.setItem("isMerchandise", "false");
    this.currentCard = this.cardJson[index];
    this.displaySmartCardsSubtotal(this.merchantList, false);

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
          // this.merchantise.push(this.newMagneticProduct);
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
    console.log(this.merchantise)
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
    console.log(this.merchantise);
  }

  addCard() {
    $("#addCardModal").modal('show');

  }

  newFareCard() {
    this.isfromAddProduct = true;
    this.electronService.ipcRenderer.send('readSmartcard', cardName);
    this.isMagnetic = false;
    this.isMerchendise = false;
    localStorage.setItem("isMagnetic", 'false');
    localStorage.setItem("isMerchendise", "false");
  }

  magneticCard() {

    var magnetic = {
      "name": "Magnetic" + " " + (this.magneticCardList.length + 1),
      "id": (this.magneticCardList.length)
    }
    this.magneticCardList.push(magnetic);
    // this.magneticIds[j] == currentMagneticIndex
    this.isMagnetic = true;
    this.isMerchendise = false;
    localStorage.setItem("isMagnetic", 'true');
    localStorage.setItem("isMerchendise", "false");
    this.selectedProductCategoryIndex = 0
    this.clickOnMagnetic(magnetic.id)
  }

  // Boolean getWalletTypeID(walletList:any []) {
  //   walletList.forEach(element => {
  //     if(element.WalletTypeId == 10)
  //       return true;
  //   });

  // }

  clickOnMagnetic(index: any) {
    this.isMagnetic = true;
    this.nonFare = true;
    this.regularRoute = false;
    this.isMerchendise = false;
    localStorage.setItem("isMerchendise", 'false');
    localStorage.setItem("isMagnetic", 'true');
    this.currentMagneticIndex = index;
    this.displayMagneticsSubtotal(this.MagneticList, false);
    (this.selectedProductCategoryIndex == 0) ? this.frequentRide() : (this.selectedProductCategoryIndex == 1) ? this.storedValue() : this.payValue();
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
    this.isMerchendise = true;
    this.isMagnetic = false;
    this.merchantise = [];
    localStorage.setItem("isMerchandise", "true");
    localStorage.setItem("isMagnetic", 'false');
    this.productJson.forEach(element => {
      if ((null == element.Ticket || undefined == element.Ticket) && (element.IsMerchandise)) {
        this.merchantise.push(element);
      }
      console.log(this.merchantise)

    });
  }

  displayDigit(digit) {
    console.log("numberDigits", digit);
    this.productTotal = this.productTotal * 100;
    this.productTotal += digit;
    this.productTotal = this.productTotal / 100;
    // this.productTotal = this.productTotal + digit;
    // this.productTotal = ""
    //  if(this.calsifilter == false){
    //      this.productTotal = ""
    //      this.calsifilter = true

    //  }
    //  this.productTotal  += digit;
    //  this.productTotal = this.productTotal;
    // if (this.productTotal == 0) {
    //   this.productTotal = digit/100;
    //   // this.productTotal+=digit
    // } else {
    //   this.productTotal += digit
    // }

  }
  displaySmartCardsSubtotal(products: any, isTotalList) {
    var index = 0;
    this.subTotal = 0;
    products.forEach(element => {
      if (isTotalList) {
        this.subTotal = this.subTotal + (this.quantityList[index] * parseFloat(element.Ticket.Price));
      }
      else {
        if (this.productCardList[index] == this.currentCard.printed_id) {
          this.subTotal = this.subTotal + (this.quantityList[index] * parseFloat(element.Ticket.Price));
        }
      }
      index++;
    });

    // return this.subTotal;
  }

  displayMagneticsSubtotal(products: any, isTotalList) {
    var index = 0;
    this.subTotal = 0;
    products.forEach(element => {
      if (isTotalList) {
        this.subTotal = this.subTotal + parseFloat(element.UnitPrice);
      }
      else {
        if (this.magneticIds[index] == this.currentMagneticIndex) {
          this.subTotal = this.subTotal + parseFloat(element.UnitPrice);
        }
      }
      index++;
    });
  }

  navigateToDashboard() {
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem("cardsData");
    localStorage.removeItem("readCardData");
    this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    this.router.navigate(['/readcard'])
  }

  clearDigit(digit) {
    console.log("numberDigits", digit);
    this.productTotal = digit
  }

  removeSmartCard() {
    $("#smartCardRemove").modal('show');
  }

  removeMagneticCard() {
    $("#magneticCardRemove").modal('show');
  }

  removeSmartCardConfirmation() {
    for (let index = 0; index < this.merchantList.length; index++) {
      const element = this.merchantList[index];
      if (this.productCardList[index] == this.currentCard.printed_id) {
        this.smartCradProductToRemove = element;
        this.removeSmartCardProductConfirmation(index);
        index--;
      }
    }
    this.displaySmartCardsSubtotal(this.merchantList, false);
    this.cardJson.splice(this.selectedIdx, 1);
    this.clickOnMerch();
  }

  removeMagneticCardConfirmation() {
    for (let index = 0; index < this.MagneticList.length; index++) {
      const element = this.MagneticList[index];
      if (this.magneticIds[index] == this.currentMagneticIndex) {
        this.magneticProductToRemove = element;
        this.removeMagneticProductConfirmation();
        index--;
      }
    }
    this.displayMagneticsSubtotal(this.MagneticList, false);
    var index = 0;
    this.magneticCardList.forEach(element => {
      if (element.id == this.currentMagneticIndex) {
        this.magneticCardList.splice(index, 1);
        this.clickOnMerch();
        return;
      }
      index++;
    });
    this.clickOnMerch();
  }


  saveTransaction(paymentMethodId) {
    try {
      localStorage.setItem("paymentMethodId", paymentMethodId)
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
      if (this.MagneticList.length > 0) {
        this.displayMagneticsSubtotal(this.MagneticList, true)
        this.MagneticList.forEach(walletElement => {
          var jsonWalletObj = {
            "transactionID": new Date().getTime(),
            "quantity": 1,
            "productIdentifier": walletElement.ProductIdentifier,
            "ticketTypeId": walletElement.Ticket.TicketType.TicketTypeId,
            "ticketValue": walletElement.Ticket.Value,
            "status": "ACTIVE",
            "slotNumber": 3,
            "startDate": walletElement.DateEffective,
            "expirationDate": walletElement.DateExpires,
            "balance": walletElement.UnitPrice,
            "rechargesPending": 0,
            "IsMerchandise": walletElement.IsMerchandise,
            "IsBackendMerchandise": false,
            "IsFareCard": false,
            "unitPrice": walletElement.UnitPrice,
            "totalCost": this.subTotal,
            "userID": localStorage.getItem("userEmail"),
            "shiftID": 1,
            "fareCode": fareCode,
            "offeringId": walletElement.OfferingId,
            "cardPID": "Magnetic 1",
            "cardUID": new Date().getTime(),
            "walletTypeId": 3,
            "shiftType": shiftType,
            "timestamp": new Date().getTime()
          }
          walletObj.push(jsonWalletObj);
        });
        var JsonObj: any = {
          "transactionID": new Date().getTime(),
          "cardPID": "Magnetic 1",
          "cardUID": new Date().getTime(),
          "quantity": 1,
          "productIdentifier": JSON.parse(localStorage.getItem("magneticProductIndentifier")),
          "ticketTypeId": null,
          "ticketValue": 0,
          "slotNumber": 0,
          "expirationDate": 0,
          "balance": 0,
          "IsMerchandise": false,
          "IsBackendMerchandise": true,
          "IsFareCard": true,
          "unitPrice": unitPrice,
          "totalCost": unitPrice,
          "userID": localStorage.getItem("userEmail"),
          "shiftID": 1,
          "fareCode": fareCode,
          "walletContentItems": walletObj,
          "walletTypeId": 10,
          "shiftType": shiftType,
          "timestamp": new Date().getTime()
        };
        jsonMagneticObj.push(JsonObj);

        var magneticTransactionObj =
        {
          "userID": localStorage.getItem("userEmail"),
          "timestamp": new Date().getTime(),
          "transactionID": new Date().getTime(),
          "transactionType": "Charge",
          "transactionAmount": this.subTotal,
          "salesAmount": this.subTotal,
          "taxAmount": 0,
          "items": jsonMagneticObj,
          "payments": [{ "paymentMethodId": paymentMethodId, "amount": this.subTotal }], "shiftType": shiftType
        }
        this.MagneticList = [];
        console.log("transObj" + JSON.stringify(magneticTransactionObj));
        this.electronService.ipcRenderer.send('savaTransactionForMagneticMerchandise', magneticTransactionObj);
      }
      // Merchandise
      if (this.merchantiseList.length > 0 && this.MagneticList.length == 0) {
        this.merchantiseList.forEach(merchandiseElement => {
          var merchandiseObj: any = {
            "transactionID": new Date().getTime(),
            "quantity": merchandiseElement.quantity,
            "productIdentifier": merchandiseElement.ProductIdentifier,
            "ticketTypeId": null,
            "ticketValue": 0,
            "slotNumber": 0,
            "balance": 0,
            "IsMerchandise": true,
            "IsBackendMerchandise": true,
            "IsFareCard": false,
            "unitPrice": merchandiseElement.UnitPrice,
            "totalCost": merchandiseElement.UnitPrice,
            "tax": 0, "userID": localStorage.getItem("userEmail"),
            "shiftID": 1,
            "fareCode": null,
            "shiftType": shiftType,
            "timestamp": new Date().getTime()
          };
          jsonMerchandiseObj.push(merchandiseObj);
        });
        var merchandiseTransactionObj =
        {
          "userID": localStorage.getItem("userEmail"),
          "timestamp": new Date().getTime(),
          "transactionID": new Date().getTime(),
          "transactionType": "Charge",
          "transactionAmount": this.merchentiseSubTotal,
          "salesAmount": this.merchentiseSubTotal,
          "taxAmount": 0,
          "items": jsonMerchandiseObj,
          "payments": [{ "paymentMethodId": paymentMethodId, "amount": this.merchentiseSubTotal }], "shiftType": shiftType
        }
        this.merchantiseList = [];
        console.log("transObj" + JSON.stringify(merchandiseTransactionObj));
        this.electronService.ipcRenderer.send('savaTransactionForMagneticMerchandise', merchandiseTransactionObj);
      }
      if (this.merchantList.length > 0 && this.MagneticList.length == 0 && this.merchantiseList.length == 0) {
        this.displaySmartCardsSubtotal(this.merchantList, true)
        localStorage.setItem('transactionAmount', JSON.stringify(this.subTotal));
        if (paymentMethodId == "8") {
          localStorage.setItem("paymentMethodId", paymentMethodId)
          this.router.navigate(['/comp'])
        } else {
          localStorage.setItem("paymentMethodId", paymentMethodId)
          this.router.navigate(['/carddata'])
        }

      }
    }
    catch (e) {
      $("#encodeErrorModal").modal('show');
    }

  }
}