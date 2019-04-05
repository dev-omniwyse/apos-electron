import { Component, NgZone, OnInit, ViewChildren, AfterViewInit, ElementRef } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { concat, timestamp, isEmpty } from 'rxjs/operators';
import { parse } from 'url';
import { element } from '@angular/core/src/render3';
import { forEach } from '@angular/router/src/utils/collection';
import { FareCardService } from 'src/app/services/Farecard.service';
import { Globals } from 'src/app/global';
import { ShoppingCartService } from 'src/app/services/ShoppingCart.service';
import { FilterOfferings } from 'src/app/services/FilterOfferings.service';
import { MediaType, TICKET_GROUP, TICKET_TYPE } from 'src/app/services/MediaType';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Utils } from 'src/app/services/Utils.service';
import { TransactionService } from 'src/app/services/Transaction.service';
import { PaymentType } from 'src/app/models/Payments';
import { ShoppingCart } from 'src/app/models/ShoppingCart';
import { CarddataComponent } from '../carddata/carddata.component';
import { FormGroup, FormBuilder } from '@angular/forms';
declare var pcsc: any;
declare var $: any;
var pcs = pcsc();
var cardName: any;
var isExistingCard = false;

pcs.on('reader', function (reader) {
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
  currencyForm: FormGroup = this.formBuilder.group({
    currency: ['']
  });
  customAmountForm: FormGroup = this.formBuilder.group({
    amount: ['']
  })
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
  shoppingcart: any = [];
  readCarddata: any = {};
  carddata: any = [];
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
  productToRemove: any = {};
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
  cardProductData: any = [];
  compDue: any = 0;
  productCheckOut: boolean = false;
  isNew: boolean = false;
  totalDue: any = [];
  checkoutTotal: any = 0;
  isWallet: boolean = false;
  currentWalletsSummary: any = [];
  isCustomAmount = false;
  walletItems = [];
  walletItemContents = [];
  slideConfig = {
    "slidesToShow": 2, dots: true, "infinite": false,
    "autoplay": false, "prevArrow": false, "slidesPerRow": 2,
    "nextArrow": false
  };

  payment = new PaymentType();
  userFarecode: any;
  bonusRidesCountText: string;
  nextBonusRidesText: string;
  active_card_expiration_date_str: string;
  currentWalletLineItem: any = [];

  isProductLimitReached = false;
  numOfAttempts = 0;
  magneticId: any = 0;
  currentMagneticProductId: any = 0;
  currentWalletLineItemIndex: any;

  @ViewChildren('cardsList') cardsList;
  customPayAsYouGo: any;
  totalRemaining: number = 0;
  cashBack: any = 0;
  isCashApplied: boolean = false;
  cashAppliedTotal: any = 0;
  isVoucherApplied: boolean = false;
  isCheckApplied: boolean = false;
  checkAppliedTotal: any = 0;
  voucherAppliedTotal: any = 0;
  voucherRemainingTotal: any;
  voucherRemaining: any;
  isCompApplied: boolean = false;
  applyCompShow: boolean = false;
  reason: boolean = true;
  reasonForComp = '';
  isCardApplied: boolean = false;
  cardAppliedTotal: any;

  constructor(private elementRef: ElementRef,
    private formBuilder: FormBuilder,
    private cdtaService?: CdtaService, private globals?: Globals, private route?: ActivatedRoute, private router?: Router, private _ngZone?: NgZone, private electronService?: ElectronService, ) {

    route.params.subscribe(val => {
      this.isMagnetic = localStorage.getItem("isMagnetic") == "true" ? true : false;
      this.isMerchendise = localStorage.getItem("isNonFareProduct") == "true" ? true : false;
      this.smartCardCost = localStorage.getItem("smartCardCost")
      this.magneticCardCost = localStorage.getItem("magneticCardCost")
      let item = JSON.parse(localStorage.getItem("catalogJSON"));
      this.productJson = JSON.parse(item).Offering;
      console.log(this.productJson);
      this.readCarddata = JSON.parse(localStorage.getItem("readCardData"));
      if (this.readCarddata != "" || this.readCarddata != undefined)
        this.cardJson.push(JSON.parse(this.readCarddata));
      if (this.cardJson[0] == null) {
        this.cardJson = [];
      } else {
        this.currentCard = JSON.parse(this.readCarddata);
        console.log("currentCard" + JSON.stringify(this.currentCard));
      }
      this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
      console.log(this.readCarddata);
      if (!this.isMagnetic) {
        // this.checkIsCardNew();
      }
      if (this.isMerchendise) {
        this.clickOnMerch();
        this.shoppingcart = JSON.parse(localStorage.getItem("shoppingCart"));
        this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
        this.activeWallet(this.shoppingcart._walletLineItem[0], 0);
      }
      else {
        this.shoppingcart = JSON.parse(localStorage.getItem("shoppingCart"));
        this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
        this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);

      }
    });


    // var doPinPadTransactionResultListener: any = this.electronService.ipcRenderer.on('doPinPadTransactionResult', (event, data) => {
    //   if (data != undefined && data != "") {
    //     this.electronService.ipcRenderer.send('getPinpadTransactionStatus')
    //   }
    // });






  }


  ngOnInit() {
    this.selectedProductCategoryIndex = 0

    this.cardProductData = JSON.parse(localStorage.getItem("cardProductData"))
    console.log("viewCardData", this.viewCardData)
    this.shoppingcart = JSON.parse(localStorage.getItem("shoppingCart"));
    console.log(this.shoppingcart);
    this.frequentRide();
    if (this.isMerchendise) {
      this.clickOnMerch();
    }
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
    this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    this.electronService.ipcRenderer.removeAllListeners("saveTransactionForMagneticMerchandiseResult");
    this.electronService.ipcRenderer.removeAllListeners("doPinPadTransactionResult");
    this.electronService.ipcRenderer.removeAllListeners("getPinpadTransactionStatusResult");
    this.electronService.ipcRenderer.removeAllListeners("getPinpadTransactionDataResult");
    this.router.navigate(['/readcard'])
  }

  ngOnDestroy() {
    // this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    this.electronService.ipcRenderer.removeAllListeners("saveTransactionForMagneticMerchandiseResult");
    this.electronService.ipcRenderer.removeAllListeners("doPinPadTransactionResult");
    this.electronService.ipcRenderer.removeAllListeners("getPinpadTransactionStatusResult");
    this.electronService.ipcRenderer.removeAllListeners("getPinpadTransactionDataResult");
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
  // this.terminalConfigJson.MaxStoredValueAmount
  isMaxProductLengthReached(selectedItem: any) {
    var isExistingProducts = false;
    this.isProductLimitReached = false;
    var existingQuantity = 0;
    var itemExistedInCard = false;
    this.currentCard.products.forEach(element => {
      if (selectedItem.Ticket.Group == element.product_type && (selectedItem.Ticket.Designator == element.designator)) {

        switch (element.product_type) {
          case 1:
            if (element.recharges_pending >= this.terminalConfigJson.MaxPendingCount)
              this.isProductLimitReached = true;
            break;
          case 2:
            if ((element.recharge_rides + selectedItem.Ticket.Value) >= 255)
              this.isProductLimitReached = true;
            break;
          case 3:
            if (element.product_type == 3 && (((element.remaining_value + (selectedItem.Ticket.Price * 100)) / 100) >= (this.terminalConfigJson.MaxStoredValueAmount / 100))) {
              this.isProductLimitReached = true;
              break;
            }
            if (this.isProductLimitReached)
              break;
            return this.isProductLimitReached
        }
      }
    })
  }

  isMagneticProductLimitReached() {
    let canAddProduct = false;

    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.MAGNETIC_ID:
        if (this.currentWalletLineItem._walletContents.length == 1) {
          canAddProduct = true;
        }
    }
    return canAddProduct;
  }

  isMagneticProduct() {
    let canAddProduct = false;
    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.MAGNETIC_ID:
        canAddProduct = true;
    }
    return canAddProduct;
  }


  isMerchendiseProduct() {
    let canAddProduct = false;
    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.MERCHANDISE_ID:
        canAddProduct = true;
    }
    return canAddProduct;
  }



  isTotalproductCountForCardreached(selectedItem: any) {
    var canAddProduct = false
    if (this.isMerchendiseProduct())
      return true

    if (this.isMagneticProduct()) {
      if (this.isMagneticProductLimitReached())
        return false;
      return true;
    }

    // this.currentWalletLineItem._walletContents.forEach(walletContent => {
    //   if (canAddProduct)
    //     return;
    //   if (walletContent.offering.OfferingId == selectedItem.OfferingId) {
    //     canAddProduct = true;
    //   }
    // })

    // if (canAddProduct)
    //   return canAddProduct;

    let currentProductCount = this.getProductCountFromExistingCard(selectedItem)
    if (currentProductCount > 4) {
      canAddProduct = false;
      return canAddProduct;
    }

    if (this.isFrequentProduct(selectedItem)) {
      if (this.isCounttReachedForFrequentRide(selectedItem))
        return true;
      return false;
    }

    if (this.isStoreRideProduct(selectedItem)) {
      if (this.isCounttReachedForStoreRide(selectedItem))
        return true;
      return false;
    }

    if (this.isPayAsYouGoProduct(selectedItem)) {
      if (this.isCounttReachedForPayAsYouGo(selectedItem))
        return true;
      return false;
    }




    return canAddProduct;
  }


  isFrequentProduct(selectedItem) {
    if (selectedItem.Ticket.Group == 1)
      return true;
  }

  isCounttReachedForFrequentRide(selectProduct: any) {
    var canAddFrequentRideBool: Boolean = false;

    var existingProductCount = 0;

    this.currentCard.products.forEach(product => {
      if (product.product_type == selectProduct.Ticket.Group && product.designator == selectProduct.Ticket.Designator) {
        existingProductCount = product.recharges_pending + 1;
      }
    })

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      if (walletContent._offering.Ticket.Group == selectProduct.Ticket.Group && walletContent._offering.OfferingId == selectProduct.OfferingId) {
        existingProductCount += walletContent._quantity;
      }
    })

    if ((existingProductCount) <= (this.terminalConfigJson.MaxPendingCount))
      canAddFrequentRideBool = true;
    else
      canAddFrequentRideBool = false;
    return canAddFrequentRideBool
  }

  isStoreRideProduct(selectedItem) {
    if (selectedItem.Ticket.Group == 2)
      return true;
  }

  isCounttReachedForStoreRide(selectProduct: any) {
    var canAddStoreRideBool: Boolean = false;

    var remainingRides = 0;

    this.currentCard.products.forEach(product => {
      if (product.product_type == selectProduct.Ticket.Group && product.designator == selectProduct.Ticket.Designator) {
        remainingRides = remainingRides + product.remaining_rides;
      }
    })

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      if (walletContent._offering.Ticket.Group == selectProduct.Ticket.Group && walletContent._offering.OfferingId == selectProduct.OfferingId) {
        remainingRides = remainingRides + (walletContent._quantity * walletContent._offering.Ticket.Value);
      }
    })

    if ((remainingRides + selectProduct.Ticket.Value) <= 255)
      canAddStoreRideBool = true;
    else
      canAddStoreRideBool = false;
    return canAddStoreRideBool
  }

  isPayAsYouGoProduct(selectedItem) {
    if (selectedItem.Ticket.Group == 3)
      return true;
  }

  isCounttReachedForPayAsYouGo(selectProduct: any) {
    var canAddPayAsYouGoBool: Boolean = false;

    var remainingValue = 0;

    this.currentCard.products.forEach(product => {
      if (product.product_type == selectProduct.Ticket.Group && product.designator == selectProduct.Ticket.Designator) {
        remainingValue = remainingValue + (product.remaining_value / 100);
      }
    })

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      if (walletContent._offering.Ticket.Group == selectProduct.Ticket.Group && walletContent._offering.Ticket.Designator == selectProduct.Ticket.Designator) {
        remainingValue = remainingValue + (walletContent._quantity * walletContent._offering.Ticket.Value);
      }
    })

    // if ((remainingValue + selectProduct.Ticket.Value) <= 200)
    if ((remainingValue + selectProduct.Ticket.Value) <= this.terminalConfigJson.MaxStoredValueAmount / 100)
      canAddPayAsYouGoBool = true;
    else
      canAddPayAsYouGoBool = false;
    return canAddPayAsYouGoBool
  }


  getProductCountFromExistingCard(selectProduct: any) {
    var productMap = new Map();

    this.currentCard.products.forEach(product => {
      var key = product.product_type + ":" + product.designator
      if (productMap.get(key) == undefined)
        productMap.set(key, 1)
    })

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      var key = walletContent._offering.Ticket.Group + ":" + walletContent._offering.Ticket.Designator;
      if (productMap.get(key) == undefined)
        productMap.set(key, 1);
    })

    var newKey = selectProduct.Ticket.Group + ":" + selectProduct.Ticket.Designator;
    if (productMap.get(newKey))
      return productMap.size;
    else
      return productMap.size + 1
  }


  canAddProductToWallet(product: any) {
    var existingCount = this.getProductQuantityFromExistingCardForOffering(product)
    console.log(existingCount);
    // var shoppingCardCount = this.getProductCountFromShoppingCart(product: any);
    var isProductLimitReached = false;
    //     switch (product.product_type) {
    //       case 1:
    //       if (existingCount + shoppingCardCount + product.value >= this.terminalConfigJson.MaxPendingCount)
    //         isProductLimitReached = true;
    //       break;
    //     case 2:
    //       if ((element.recharge_rides + selectedItem.Ticket.Value) >= 255)
    //         isProductLimitReached = true;
    //       break;
    //     case 3:
    //       if (existingCount + shoppingCardCount) + (selectedItem.Ticket.Price * 100)) / 100) >= (this.terminalConfigJson.MaxStoredValueAmount / 100))) {
    //         isProductLimitReached = true;
    //         break;
    //   }
    return isProductLimitReached
    // }
  }

  getProductQuantityFromExistingCardForOffering(selectedItem: any) {
    console.log(selectedItem);
    for (let element of this.currentCard.products) {
      if (selectedItem.Ticket.Group == element.product_type && (selectedItem.Ticket.Designator == element.designator)) {
        switch (element.product_type) {
          case 1:
            return element.recharges_pending;
          case 2:
            return element.recharge_rides;
          case 3:
            return element.remaining_value / 100;
          default:
            break;
        }
      }
    }
  }


  getProductLimitMessage() {
    let message = "Limit Reached"
    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.MAGNETIC_ID:
        message = "Cannot Add more than one Product"
        break;
      case MediaType.SMART_CARD_ID:
        message = "Max Product limit reached."
        break;
    }
    return message
  }

  addProductToWallet(product) {
    if (!this.isMerchendise) {
      if (!this.isTotalproductCountForCardreached(product)) {
        this.maxLimitErrorMessages = this.getProductLimitMessage()
        $("#maxCardLimitModal").modal({
          backdrop: 'static',
          keyboard: false
        });
        return;
      }
    }
    this.shoppingcart = FareCardService.getInstance.addFareProduct(this.shoppingcart, product, this.currentWalletLineItem);
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);

    // let response = FareCardService.getInstance.addFareProduct(this.shoppingcart, product, this.currentWalletLineItem);
    // localStorage.setItem('shoppingCart', JSON.stringify(response));

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
        $("#magneticCardLimitModal").modal({
          backdrop: 'static',
          keyboard: false
        });
        elementExists = true;
      }
    });
    if (elementExists)
      return;
    this.MagneticList.push(merch);
    this.magneticIds.push(this.currentMagneticIndex);
    // this.displayMagneticsSubtotal(this.MagneticList, false);
    this.productTotal = this.productTotal + parseFloat(merch.UnitPrice)
  }


  removeCurrentWalletLineItem() {
    $("#currentCardRemove").modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  removeCurrentWalletLineItemConfirmation() {
    // localStorage.removeItem('c')
    let walletToRemove = this.currentWalletLineItem;
    this.shoppingcart = ShoppingCartService.getInstance.removeItem(this.shoppingcart, this.currentWalletLineItem, null, true);
    if (walletToRemove._walletTypeId == MediaType.SMART_CARD_ID) {
      this.removeCardfromCardJSON();
    }
    // Utils.getInstance.removeWalletFromLocalStore(this.cardJson, );

    this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);

    this.currentWalletLineItemIndex = this.walletItems.length - 1;

    this.currentWalletLineItem = this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1];
    if (this.currentWalletLineItem._walletTypeId == MediaType.MERCHANDISE_ID) {
      this.clickOnMerch();
      this.isMerchendise = true;
    }
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);


  }
  removeCardfromCardJSON() {
    // this.cardJson.for
    let index = -1;
    for (let walletIndex = 0; walletIndex < this.cardJson.length; walletIndex++) {
      if (this.cardJson[walletIndex].printed_id == this.currentWalletLineItem._cardPID) {
        index = walletIndex;
        break;
      }
    }
    if (-1 != index) {
      this.cardJson.splice(index, 1);
      localStorage.setItem('cardsData', JSON.stringify(this.cardJson));
    }
  }



  removeProduct(product) {
    this.productToRemove = product;
    $("#removeProductModal").modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  removeProductConfirmation() {
    this.shoppingcart = ShoppingCartService.getInstance.removeItem(this.shoppingcart, this.currentWalletLineItem, this.productToRemove, false);
    this.currentWalletLineItem = this.currentWalletLineItem;
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);
    this.productToRemove = null;
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
    if (this.magneticIds[this.magneticId] == this.magneticCardList[this.magneticId].id) {
      var selectedIndex = this.currentMagneticProductId;
      this.MagneticList.splice(selectedIndex, 1);
      this.magneticIds.splice(selectedIndex, 1);
      this.displayMagneticsSubtotal(this.MagneticList, false);
    }

  }

  removeMerchProduct(merch) {
    this.merchproductToRemove = merch
    $("#removeMerchProductModal").modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  removeMagneticProduct(merch, j) {
    this.magneticProductToRemove = merch;
    this.currentMagneticProductId = j;
    $("#removeMagneticProductModal").modal({
      backdrop: 'static',
      keyboard: false
    });
    // this.productTotal = this.productTotal - parseFloat(merch.UnitPrice);
    // var selectedIndex = this.MagneticList.indexOf(merch);
    // this.MagneticList.splice(selectedIndex, 1);
    // this.productCardList.splice(selectedIndex, 1);
  }

  productCheckout() {
    if (Utils.getInstance.isEmptyShoppingCart(this.shoppingcart)) {
      $("#shoppingCartEmptyModal").modal({
        backdrop: 'static',
        keyboard: false
      });
      return;
    }
    if (Utils.getInstance.isAnyEmptyMagnetics(this.shoppingcart)) {
      $("#emptyMagneticModal").modal({
        backdrop: 'static',
        keyboard: false
      });
      return;
    }
    // this.terminalConfigJson.MaxTransAmount
    if (this.totalDue > 5000) {
      $("#maxTransactionModal").modal({
        backdrop: 'static',
        keyboard: false
      });
      return;
    }
    if (this.totalDue < this.terminalConfigJson.MinTransAmount) {
      $("#minTransactionModal").modal({
        backdrop: 'static',
        keyboard: false
      });
      return;
    }
    // if (this.totalDue == 0) {
    //   $("#productTotalWarningModal").modal('show');
    //   return;
    // }
    this.productCheckOut = true;

    // var index = 0;
    // this.merchantList.forEach(element => {
    //   element.quantity = this.quantityList[index];
    //   index++;
    // });
    // localStorage.setItem('encodeData', JSON.stringify(this.merchantList));
    // localStorage.setItem("MerchandiseData", JSON.stringify(this.merchantiseList));
    // localStorage.setItem("MagneticData", JSON.stringify(this.MagneticList));
    // localStorage.setItem('productCardData', JSON.stringify(this.productCardList));
    localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart))
    localStorage.setItem('cardsData', JSON.stringify(this.cardJson));
    localStorage.setItem('areExistingProducts', JSON.stringify(this.areExistingProducts));
    localStorage.setItem('transactionAmount', JSON.stringify(this.totalDue));
    this.checkout = false;
    this.checkoutTotal = this.totalDue;
    this.totalRemaining = this.totalDue;
    this.currencyForm.setValue({ "currency": this.checkoutTotal });
  }

  cancelCheckout() {
    $("#cancelCheckoutModal").modal('show');
    this.isCashApplied = false;
    this.isVoucherApplied = false;
    this.isCheckApplied = false;
    this.isCardApplied = false;
    this.shoppingcart._payments = [];
    this.getTotalDue(this.shoppingcart);

  }

  cancelCheckOutConfirmation() {
    this.productCheckOut = false;
    this.checkout = true;

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
    // this.displaySmartCardsSubtotal(this.merchantList, false);

    // this.checkIsCardNew();
    // if (this.isNew) {
    //   this.displaySmartCardsSubtotal(this.merchantList, false);
    //   // this.productTotal = this.productTotal+parseFloat(this.smartCardCost);
    // }

    (this.selectedProductCategoryIndex == 0) ? this.frequentRide() : (this.selectedProductCategoryIndex == 1) ? this.storedValue() : this.payValue();
  }

  handleReadCardResult() {
    var readCardListener = this.electronService.ipcRenderer.once('readcardResult', (event, data) => {
      var isDuplicateCard = false;
      if (this.isfromAddProduct && data != undefined && data != "") {
        this.isfromAddProduct = false;
        this._ngZone.run(() => {
          localStorage.setItem("readCardData", JSON.stringify(data));
          this.carddata = new Array(JSON.parse(data));
          let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
          ShoppingCartService.getInstance.shoppingCart = null;
          this.cardJson.forEach(element => {
            if (element.printed_id == JSON.parse(data).printed_id) {
              isDuplicateCard = true;
            }
          });
          if (isDuplicateCard) {
            $("#newCardValidationModal").modal('show');
          }
          else {
            if (isExistingCard) {
              isExistingCard = false;
              this.cardJson.push(JSON.parse(data));
              this.currentCard = this.cardJson[this.cardJson.length - 1];
              this.selectedProductCategoryIndex = 0;

              this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering, false);
              this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
              this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
            }
            else {
              let isNewCard = this.checkIsCardNew();
              if (isNewCard) {
                this.cardJson.push(JSON.parse(data));
                this.currentCard = this.cardJson[this.cardJson.length - 1];
                this.selectedProductCategoryIndex = 0;

                this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering, true);
                this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
                this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
              }
              else {
                $("#newCardValidateModal").modal('show');
              }
            }
          }
        });
      }
      // this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    });
  }

  // stored ride values
  storedValue() {
    this.selectedProductCategoryIndex = 1;
    this.merchantise = [];
    let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
    let list = FilterOfferings.getInstance.filterFareOfferings(item.Offering, TICKET_GROUP.RIDE, TICKET_TYPE.RIDE, this.currentWalletLineItem);
    this.walletItemContents = this.formatWatlletContents(list, 6);
    this.merchantise = list;
  }
  frequentRide() {
    this.selectedProductCategoryIndex = 0;
    this.merchantise = [];
    let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
    let list = FilterOfferings.getInstance.filterFareOfferings(item.Offering, TICKET_GROUP.PERIOD_PASS, TICKET_TYPE.PERIOD, this.currentWalletLineItem);
    this.walletItemContents = this.formatWatlletContents(list, 6);
    this.merchantise = list;
  }
  customAmount(item) {
    this.customPayAsYouGo = item;
    this.isCustomAmount = true;
    // this.router.navigate(['/custom-amount'])
  }
  closeCustomAmount() {
    this.isCustomAmount = false;
  }
  payValue() {
    this.selectedProductCategoryIndex = 2;
    this.merchantise = [];
    let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
    let list = FilterOfferings.getInstance.filterFareOfferings(item.Offering, TICKET_GROUP.VALUE, TICKET_TYPE.STORED_FIXED_VALUE, this.currentWalletLineItem);
    this.walletItemContents = this.formatWatlletContents(list, 6);
    this.merchantise = list;
  }

  addCard() {
    $("#addCardModal").modal('show');

  }

  newFareCard() {
    $("#addCardModal").modal('hide');
    $("#newCardModal").modal('show');
  }
  newCard() {

    this.isfromAddProduct = true;
    this.handleReadCardResult();
    this.electronService.ipcRenderer.send('readSmartcard', cardName);
    this.isMagnetic = false;
    this.isMerchendise = false;
    localStorage.setItem("isMagnetic", 'false');
    localStorage.setItem("isMerchendise", "false");

  }

  ExistingCard() {
    this.isfromAddProduct = true;
    isExistingCard = true;
    this.handleReadCardResult();
    this.electronService.ipcRenderer.send('readSmartcard', cardName);
    this.isMagnetic = false;
    this.isMerchendise = false;
    localStorage.setItem("isMagnetic", 'false');
    localStorage.setItem("isMerchendise", "false");
  }
  magneticCard() {

    // var magnetic = {
    //   "name": "Magnetic" + " " + (this.magneticCardList.length + 1),
    //   "id": (this.magneticCardList.length)
    // }
    // this.magneticCardList.push(magnetic);
    // this.magneticIds[j] == currentMagneticIndex
    this.isMagnetic = true;
    this.isMerchendise = false;
    localStorage.setItem("isMagnetic", 'true');
    localStorage.setItem("isMerchendise", "false");
    this.selectedProductCategoryIndex = 0
    // this.clickOnMagnetic(magnetic.id)
    // this.productTotal = this.productTotal + parseFloat(this.magneticCardCost);

    //new code

    let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));

    this.shoppingcart = FareCardService.getInstance.addMagneticsCard(this.shoppingcart, item.Offering);
    ShoppingCartService.getInstance.shoppingCart = null;
    this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
    this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
    this.frequentRide();
  }

  // Boolean getWalletTypeID(walletList:any []) {
  //   walletList.forEach(element => {
  //     if(element.WalletTypeId == 10)
  //       return true;
  //   });

  // }

  clickOnMagnetic(index: any) {
    this.magneticId = index;
    this.isMagnetic = true;
    this.nonFare = true;
    this.regularRoute = false;
    this.isMerchendise = false;
    localStorage.setItem("isMerchendise", 'false');
    localStorage.setItem("isMagnetic", 'true');
    this.currentMagneticIndex = index;
    (this.selectedProductCategoryIndex == 0) ? this.frequentRide() : (this.selectedProductCategoryIndex == 1) ? this.storedValue() : this.payValue();
  }
  activeWallet(item, index) {

    if (item._walletTypeId == MediaType.SMART_CARD_ID) {
      let cardIndex = Utils.getInstance.getIndexOfActiveWallet(this.cardJson, item);
      this.bonusRidesCountText = Utils.getInstance.getBonusRideCount(this.cardJson[cardIndex]);
      this.userFarecode = Utils.getInstance.getFareCodeTextForThisWallet(this.cardJson[cardIndex], this.terminalConfigJson);
      this.nextBonusRidesText = Utils.getInstance.getNextBonusRidesCount(this.cardJson[cardIndex], this.terminalConfigJson);
    }

    this.selectedProductCategoryIndex = 0;
    this.currentWalletLineItem = item;
    this.currentWalletLineItemIndex = index;
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);

    if (this.shoppingcart._walletLineItem[0]._walletTypeId == item._walletTypeId) {
      this.isMerchendise = true;
      this.clickOnMerch();

    }
    else {
      this.nonFare = true;
      this.regularRoute = false;
      this.isMerchendise = false;
      (this.selectedProductCategoryIndex == 0) ? this.frequentRide() : (this.selectedProductCategoryIndex == 1) ? this.storedValue() : this.payValue();
    }
    //frequentRider
    //storedRide
    //PayAsYouGo
    // FilterOfferings.getInstance.filterOfferings(offeringJSON, ticketGroup,  ticketTypeId, walletLineItem);
  }
  clickOnMerch() {
    this.nonFare = false;
    this.regularRoute = true;
    this.isMerchendise = true;
    this.isMagnetic = false;
    this.merchantise = [];
    localStorage.setItem("isMerchandise", "true");
    localStorage.setItem("isMagnetic", 'false');
    let list = FilterOfferings.getInstance.filterNonFareOfferings(this.productJson);
    this.walletItemContents = this.formatWatlletContents(list, 6);
    this.merchantise = list;
  }

  textAreaEmpty() {
    console.log(this.currencyForm.value.currency)
    if (this.currencyForm.value.currency == '' || this.currencyForm.value.currency == undefined) {
      this.clearDigit(0);
    }
  }

  customTextAreaEmpty() {
    if (this.customAmountForm.value.amount == '' || this.customAmountForm.value.amount == undefined) {
      this.clearDigit(0);
    }
  }

  displayDigit(digit) {
    console.log(digit);
    if (this.totalDue == this.checkoutTotal) {
      this.checkoutTotal = 0;
    }
    this.checkoutTotal = Math.round(this.checkoutTotal * 100);
    this.checkoutTotal += digit;
    this.checkoutTotal = this.checkoutTotal / 100;
    if (this.currencyForm.value.currency == '') {
      this.currencyForm.value.currency = '' + this.checkoutTotal
    }


    if (this.isCustomAmount) {
      this.productTotal = Math.round(this.productTotal * 100);
      this.productTotal += digit;
      this.productTotal = (this.productTotal / 100);
      if (this.customAmountForm.value.amount == '') {
        this.customAmountForm.value.amount = '' + this.productTotal;
      }
    }

  }
  enterCustomAmount(productTotal) {
    let offering = this.customPayAsYouGo;
    this.customPayAsYouGo = null;
    offering.UnitPrice = productTotal;
    console.log(this.customPayAsYouGo);
    this.shoppingcart = FareCardService.getInstance.addFareProduct(this.shoppingcart, offering, this.currentWalletLineItem);
    this.isCustomAmount = false;
    this.productTotal = 0;
    this.frequentRide();
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);
  }
  getSubTotal(currentWalletLineItem) {
    this.subTotal = ShoppingCartService.getInstance.getSubTotalForCardUID(currentWalletLineItem);
  }

  getTotalDue(shoppingCart) {
    this.totalDue = ShoppingCartService.getInstance.getGrandTotal(shoppingCart);
    this.checkoutTotal = this.totalDue;
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
    this.subTotal = this.subTotal + parseFloat(this.magneticCardCost);
  }

  navigateToDashboard() {
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem("cardsData");
    localStorage.removeItem("readCardData");
    this.electronService.ipcRenderer.removeAllListeners("readCardResult");
    this.electronService.ipcRenderer.removeAllListeners("saveTransactionForMagneticMerchandiseResult");
    this.electronService.ipcRenderer.removeAllListeners("doPinPadTransactionResult");
    this.electronService.ipcRenderer.removeAllListeners("getPinpadTransactionStatusResult");
    this.electronService.ipcRenderer.removeAllListeners("getPinpadTransactionDataResult");
    this.router.navigate(['/readcard'])
  }

  clearDigit(digit) {
    console.log("numberDigits", digit);
    this.checkoutTotal = digit;
    if (this.isCustomAmount) {
      this.productTotal = digit;
    }
  }

  removeSmartCard() {
    $("#smartCardRemove").modal('show');
  }

  removeMagneticCard() {
    $("#magneticCardRemove").modal('show');
  }


  checkIsCardNew() {
    let flag = Utils.getInstance.isNew(this.carddata[0]);
    return flag;
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
    this.productTotal = this.productTotal - parseFloat(this.magneticCardCost);
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

  isSmartCardFound() {
    var isSmartcardFound = false
    this.shoppingcart._walletLineItem.forEach(element => {
      if (element._walletTypeId == MediaType.SMART_CARD_ID) {
        isSmartcardFound = true;
      }
    });
    return isSmartcardFound;
  }

  getUserByUserID(userID) {
    let userData = null;
    let userJSON = JSON.parse(localStorage.getItem('shiftReport'));
    for (let user of userJSON) {
      if (user.userID == userID) {
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

  handlesaveTransactionForMagneticMerchandiseResult() {
    var transactionListener: any = this.electronService.ipcRenderer.once('saveTransactionForMagneticMerchandiseResult', (event, data) => {
      console.log("data", data)
      if (data != undefined && data != "") {
        var timestamp = new Date().getTime();
        this.cdtaService.generateReceipt(timestamp);
        this._ngZone.run(() => {

          localStorage.removeItem('encodeData');
          localStorage.removeItem('productCardData');
          localStorage.removeItem("cardsData");
          localStorage.removeItem("readCardData");
          this.electronService.ipcRenderer.removeAllListeners("readCardResult");
          this.router.navigate(['/readcard'])
        });
      } else {

        $("#encodeErrorModal").modal('show');

      }
    });
  }

  saveTransactionForMerchandiseAndMagnetic() {
    let userID = localStorage.getItem('userID');
    let transactionObj = TransactionService.getInstance.saveTransaction(this.shoppingcart, this.getUserByUserID(userID));
    localStorage.setItem("transactionObj", JSON.stringify(transactionObj));
    let deviceData = JSON.parse(localStorage.getItem('deviceInfo'));
    let deviceInfo = Utils.getInstance.increseTransactionCountInDeviceInfo(deviceData, transactionObj);
    localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    this.handlesaveTransactionForMagneticMerchandiseResult();
    this.electronService.ipcRenderer.send('savaTransactionForMagneticMerchandise', transactionObj);
  }


  saveTransaction() {
    try {
      localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
      if (this.isSmartCardFound()) {
        this.router.navigate(['/carddata']);
      } else {
        this.saveTransactionForMerchandiseAndMagnetic()
      }
    }
    catch (e) {
      $("#encodeErrorModal").modal('show');
    }

  }

  handle

  handlegetPinpadTransactionDataResult() {
    this.electronService.ipcRenderer.once('getPinpadTransactionDataResult', (event, data) => {
      console.log("creditcardTransaction ", data);
      if (data != undefined && data != "") {
        localStorage.setItem("pinPadTransactionData", data);
        this.saveTransaction();
      }
    });
  }

  handlegetPinpadTransactionStatusResult() {
    this.electronService.ipcRenderer.once('getPinpadTransactionStatusResult', (event, data) => {
      console.log("transaction Status CreditCArd", data);
      if (data != undefined && data != "") {
        if (data == false && this.numOfAttempts < 600) {
          var timer = setTimeout(() => {
            this.numOfAttempts++;
            this.handlegetPinpadTransactionStatusResult();
            this.electronService.ipcRenderer.send('getPinpadTransactionStatus')
          }, 1000);
        } else {
          clearTimeout(timer);
          $("#creditCardApplyModal").modal("hide")
          this.handlegetPinpadTransactionDataResult();
          this.electronService.ipcRenderer.send('getPinpadTransactionData')
        }
      }
    });
  }

  handleDoPinPadTransactionResult() {
    var doPinPadTransactionResultListener: any = this.electronService.ipcRenderer.once('doPinPadTransactionResult', (event, data) => {
      if (data != undefined && data != "") {
        this.handlegetPinpadTransactionStatusResult();
        this.electronService.ipcRenderer.send('getPinpadTransactionStatus')
      }
    });
  }

  doPinPadTransaction() {
    this.numOfAttempts = 0;
    $("#creditCardModal").modal("hide")
    $("#creditCardApplyModal").modal("show")
    this.handleDoPinPadTransactionResult();
    this.electronService.ipcRenderer.send('doPinPadTransaction', (this.totalDue * 100));
  }

  handleCancelPinPadTransaction() {
    this.electronService.ipcRenderer.once('cancelPinpadTransactionResult', (event, data) => {
      if (data != undefined && data != "") {
        $("#creditCardApplyModal").modal("hide")
      }
    });
  }

  cancelPinPadTransaction() {
    this.handleCancelPinPadTransaction();
    this.electronService.ipcRenderer.send('cancelPinpadTransaction');
  }

  formatWatlletItems(list, howMany) {
    var idx = 0
    let result = []

    while (idx < list.length) {
      if (idx % howMany === 0) result.push([])
      result[result.length - 1].push(list[idx++])
    }
    return result
  }

  formatWatlletContents(list, howMany) {
    var idx = 0
    let result = []

    while (idx < list.length) {
      if (idx % howMany === 0) result.push([])
      result[result.length - 1].push(list[idx++])
    }
    return result
  }

  paymentByCash() {
    if (this.checkoutTotal == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == this.checkoutTotal) {
      this.isCashApplied = false;
      this.isVoucherApplied = false;
      this.isCheckApplied = false;
      $('#myModal').modal('show');

    } else if (this.totalRemaining > this.checkoutTotal) {

      if (this.isVoucherApplied) {
        this.isVoucherApplied = true;
      } else {
        this.isVoucherApplied = false;

      }

      if (this.isCheckApplied) {
        this.isCheckApplied = true;
      } else {
        this.isCheckApplied = false;
      }

      if (this.isCompApplied) {
        this.isCompApplied = true;
      } else {
        this.isCompApplied = false;
      }

      if (this.isCardApplied) {
        this.isCardApplied = true
      } else {
        this.isCardApplied = false;
      }

      if ((this.isCheckApplied && this.isVoucherApplied) || (this.isVoucherApplied && this.isCompApplied) || (this.isCheckApplied && this.isCompApplied) || (this.isVoucherApplied && this.isCardApplied) || (this.isCheckApplied && this.isCardApplied) || (this.isCompApplied && this.isCardApplied)) {
        $('#thirdPaymentModal').modal('show');
      } else {
        this.totalRemaining = +(this.totalRemaining - this.checkoutTotal).toFixed(2);
        let indexOfPayment = this.checkIsPaymentMethodExists(2);
        if (indexOfPayment == -1) {
          let payment = new PaymentType();
          payment.$amount = this.checkoutTotal;
          payment.$paymentMethodId = 2;
          payment.$comment = null;
          this.shoppingcart._payments.push(payment);
          this.cashAppliedTotal = payment.$amount;
          this.isCashApplied = true;
          this.checkoutTotal = 0;
        } else {
          this.shoppingcart._payments[indexOfPayment].amount += this.checkoutTotal;
          this.cashAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
          this.isCashApplied = true;
          this.checkoutTotal = 0;
        }

      }
    } else if (this.totalRemaining < this.checkoutTotal) {
      // this.isCashApplied = true;
      // this.isVoucherApplied = false;
      this.cashAppliedTotal = this.checkoutTotal
      this.cashBack = this.checkoutTotal - this.totalRemaining;
      $("#myModal").modal('show');
    }
  }

  cashApplied() {
    let payment = new PaymentType();
    payment.$paymentMethodId = 2
    payment.$amount = this.checkoutTotal
    payment.$comment = null;
    if (this.checkIsPaymentMethodExists(2) == -1) {
      this.shoppingcart._payments.push(payment);
    }

    this.saveTransaction();

  }


  paymentByVoucher() {
    if (this.checkoutTotal == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == this.checkoutTotal) {
      $('#voucherModal').modal('show');
    } else if (this.totalRemaining > this.checkoutTotal) {
      if (this.isCashApplied) {
        this.isCashApplied = true;
      } else {
        this.isCashApplied = false;

      }
      if (this.isCheckApplied) {
        this.isCheckApplied = true;
      } else {
        this.isCheckApplied = false;
      }

      if (this.isCompApplied) {
        this.isCompApplied = true;
      } else {
        this.isCompApplied = false;
      }

      if (this.isCardApplied) {
        this.isCardApplied = true
      } else {
        this.isCardApplied = false;
      }

      if ((this.isCashApplied && this.isCheckApplied) || (this.isCheckApplied && this.isCompApplied) || (this.isCashApplied && this.isCompApplied) || (this.isCardApplied && this.isCompApplied) || (this.isCardApplied && this.isCashApplied) || (this.isCardApplied && this.isCheckApplied)) {
        $('#thirdPaymentModal').modal('show');
      } else {

        $('#voucherModal').modal('show');

      }

    }
    else if (this.totalRemaining.toFixed(2) < this.checkoutTotal.toFixed(2)) {
      $('#voucherErrorModal').modal('show');
    }


  }

  voucherModalApply() {
    if (this.totalDue == this.checkoutTotal) {
      this.totalRemaining = +(this.totalRemaining - this.checkoutTotal).toFixed(2);
      this.voucherRemaining = this.totalRemaining;
      let payment = new PaymentType();
      payment.$paymentMethodId = 11
      payment.$amount = this.checkoutTotal
      payment.$comment = null;
      if (this.checkIsPaymentMethodExists(11) == -1) {
        this.shoppingcart._payments.push(payment);
      }
    } else {
      this.totalRemaining = this.totalRemaining - this.checkoutTotal;
      this.voucherRemaining = this.totalRemaining;
      let indexOfPayment = this.checkIsPaymentMethodExists(11);
      if (indexOfPayment == -1) {
        let payment = new PaymentType();
        payment.$amount = this.checkoutTotal;
        payment.$paymentMethodId = 11;
        payment.$comment = null;
        this.shoppingcart._payments.push(payment);
        console.log(this.shoppingcart._payments)
        this.voucherAppliedTotal = payment.$amount;
        this.isVoucherApplied = true;
        this.checkoutTotal = 0;
      } else {
        this.shoppingcart._payments[indexOfPayment].amount += this.checkoutTotal;
        this.voucherAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
        console.log(this.shoppingcart._payments)
        this.isVoucherApplied = true;
        this.checkoutTotal = 0;
      }

    }
    if (this.voucherRemaining !== 0) {
      $('#voucherApplyModal').modal('hide');
    } else if (this.voucherRemaining == 0) {
      $('#voucherApplyModal').modal('show');
    }
    // $('#voucherApplyModal').modal('show');
  }

  vocherPayment() {
    this.saveTransaction();
  }

  notToApplyvoucher() {
    if (this.isVoucherApplied) {
      this.isVoucherApplied = true;
    } else {
      this.isVoucherApplied = false;
    }

  }

  paymentByCheck() {
    if (this.checkoutTotal == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == this.checkoutTotal) {
      $('#checkModal').modal('show');
    }

    else if (this.totalRemaining > this.checkoutTotal) {
      if (this.isCashApplied) {
        this.isCashApplied = true;
      } else {
        this.isCashApplied = false;

      }
      if (this.isVoucherApplied) {
        this.isVoucherApplied = true;
      } else {
        this.isVoucherApplied = false;
      }

      if (this.isCompApplied) {
        this.isCompApplied = true;
      } else {
        this.isCompApplied = false;
      }

      if (this.isCardApplied) {
        this.isCardApplied = true
      } else {
        this.isCardApplied = false;
      }

      if ((this.isCashApplied && this.isVoucherApplied) || (this.isVoucherApplied && this.isCompApplied) || (this.isCashApplied && this.isCompApplied) || (this.isCardApplied && this.isVoucherApplied) || (this.isCardApplied && this.isCompApplied) || (this.isCashApplied && this.isCardApplied)) {
        $('#thirdPaymentModal').modal('show');
      } else {
        this.totalRemaining = +(this.totalRemaining - this.checkoutTotal).toFixed(2);
        let indexOfPayment = this.checkIsPaymentMethodExists(3);
        if (indexOfPayment == -1) {
          let payment = new PaymentType();
          payment.$amount = this.checkoutTotal;
          payment.$paymentMethodId = 3;
          payment.$comment = null;
          this.shoppingcart._payments.push(payment);
          console.log(this.shoppingcart._payments)
          this.checkAppliedTotal = payment.$amount;
          this.isCheckApplied = true;
          this.checkoutTotal = 0;
        } else {
          this.shoppingcart._payments[indexOfPayment].amount += this.checkoutTotal;
          this.checkAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
          console.log(this.shoppingcart._payments)
          this.isCheckApplied = true;
          this.checkoutTotal = 0;
        }

      }

    }
    else if (this.totalRemaining.toFixed(2) < this.checkoutTotal.toFixed(2)) {
      $('#voucherErrorModal').modal('show');
    }
  }

  checkApplied() {
    let payment = new PaymentType();
    payment.$paymentMethodId = 3
    payment.$amount = this.checkoutTotal
    payment.$comment = null;
    if (this.checkIsPaymentMethodExists(3) == -1) {
      this.shoppingcart._payments.push(payment);
      console.log(this.shoppingcart._payments)
    }
    this.saveTransaction();
  }




  compApplied() {
    if (this.checkoutTotal == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == this.checkoutTotal) {
      $('#compModal').modal('show');
    } else if (this.totalRemaining > this.checkoutTotal) {
      if (this.isCashApplied) {
        this.isCashApplied = true;
      } else {
        this.isCashApplied = false;

      }
      if (this.isVoucherApplied) {
        this.isVoucherApplied = true;
      } else {
        this.isVoucherApplied = false;
      }
      if (this.isCheckApplied) {
        this.isCheckApplied = true;
      } else {
        this.isCheckApplied = false;
      }

      if (this.isCardApplied) {
        this.isCardApplied = true
      } else {
        this.isCardApplied = false;
      }

      if ((this.isVoucherApplied && this.isCheckApplied) || (this.isCashApplied && this.isCheckApplied) || (this.isCashApplied && this.isVoucherApplied) || (this.isCardApplied && this.isVoucherApplied) || (this.isCardApplied && this.isCheckApplied) || (this.isCashApplied && this.isCardApplied)) {
        $('#thirdPaymentModal').modal('show');
      } else {
        $('#compModal').modal('show');
      }
    } else if (this.totalRemaining.toFixed(2) < this.checkoutTotal.toFixed(2)) {
      $('#voucherErrorModal').modal('show');
    }


  }

  compApplication() {
    this.applyCompShow = true;
  }

  compensation() {
    if (this.totalRemaining == this.checkoutTotal) {
      let indexOfPayment = this.checkIsPaymentMethodExists(8);
      if (indexOfPayment == -1) {
        let payment = new PaymentType();
        payment.$amount = this.checkoutTotal;
        payment.$paymentMethodId = 8;
        payment.$comment = this.reasonForComp;
        this.shoppingcart._payments.push(payment);
      }
      this.electronService.ipcRenderer.send('compensation');
      this.saveTransaction();
    } else if (this.totalRemaining > this.checkoutTotal) {
      this.totalRemaining = +(this.totalRemaining - this.checkoutTotal).toFixed(2);
      this.compDue = this.totalRemaining;
      let indexOfPayment = this.checkIsPaymentMethodExists(8);
      if (indexOfPayment == -1) {
        let payment = new PaymentType();
        payment.$amount = this.checkoutTotal;
        payment.$paymentMethodId = 8;
        payment.$comment = this.reasonForComp;
        this.shoppingcart._payments.push(payment);
        // this.cashAppliedTotal = payment.$amount;
        this.isCompApplied = true;
        this.applyCompShow = false;
        this.checkoutTotal = 0;
      } else {
        this.shoppingcart._payments[indexOfPayment].amount += this.checkoutTotal;
        // this.cashAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
        this.isCompApplied = true;
        this.applyCompShow = false;
        this.checkoutTotal = 0;
      }

    }

  }

  cancelCompensation() {
    this.applyCompShow = false;
  }

  compensationReason(value) {
    if (this.reason == true && value == "OTHERS") {
      this.reason = false
      this.reasonForComp = "";
    }
  }

  cardApplied() {
    if (this.checkoutTotal == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == this.checkoutTotal) {
      $('#creditCardModal').modal('show');
    } else if (this.totalRemaining > this.checkoutTotal) {
      if (this.isCashApplied) {
        this.isCashApplied = true;
      } else {
        this.isCashApplied = false;

      }
      if (this.isVoucherApplied) {
        this.isVoucherApplied = true;
      } else {
        this.isVoucherApplied = false;
      }

      if (this.isCompApplied) {
        this.isCompApplied = true;
      } else {
        this.isCompApplied = false;
      }

      if (this.isCheckApplied) {
        this.isCheckApplied = true
      } else {
        this.isCheckApplied = false;
      }

      if ((this.isCashApplied && this.isCheckApplied) || (this.isCheckApplied && this.isVoucherApplied) || (this.isCompApplied && this.isVoucherApplied) || (this.isCashApplied && this.isCompApplied) || (this.isCashApplied && this.isVoucherApplied) || (this.isCheckApplied && this.isCompApplied)) {
        $('#thirdPaymentModal').modal('show');
      } else {

        $('#creditCardModal').modal('show');
        // if (this.isCardApplied) {
        //   $('#creditCardModal').modal('show');
        //   this.cardAppliedTotal = this.checkAppliedTotal + this.checkoutTotal
        // } else {
        //   $('#creditCardModal').modal('show');
        //   this.totalRemaining = this.totalRemaining - this.checkoutTotal;

        //   this.cardAppliedTotal = this.checkoutTotal;
        //   this.isCardApplied = true

        // }
      }
    } else if (this.totalRemaining.toFixed(2) < this.checkoutTotal.toFixed(2)) {
      $('#voucherErrorModal').modal('show');
    }
  }

  cardPayment() {
    if (this.totalRemaining == this.checkoutTotal) {
      let indexOfPayment = this.checkIsPaymentMethodExists(9);
      if (indexOfPayment == -1) {
        let payment = new PaymentType();
        payment.$amount = this.checkoutTotal;
        payment.$paymentMethodId = 9;
        payment.$comment = null;
        this.shoppingcart._payments.push(payment);
      }
      this.doPinPadTransaction();
    } else {
      this.totalRemaining = +(this.totalRemaining - this.checkoutTotal).toFixed(2);
      this.cardAppliedTotal = this.checkoutTotal;
      let indexOfPayment = this.checkIsPaymentMethodExists(9);
      if (indexOfPayment == -1) {
        let payment = new PaymentType();
        payment.$amount = this.checkoutTotal;
        payment.$paymentMethodId = 9;
        payment.$comment = null;
        this.shoppingcart._payments.push(payment);
        // this.cashAppliedTotal = payment.$amount;
        this.isCardApplied = true;
        this.checkoutTotal = 0;
        // this.doPinPadTransaction()
      } else {
        this.shoppingcart._payments[indexOfPayment].amount += this.checkoutTotal;
        this.cardAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
        // this.cashAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
        this.cardAppliedTotal = true;
        // this.doPinPadTransaction();
      }
    }
  }


  checkIsPaymentMethodExists(paymentMethodId) {
    let indexOfPayment = -1;
    let payments = this.shoppingcart._payments;
    for (let index = 0; index < payments.length; index++) {
      if (paymentMethodId == payments[index].paymentMethodId) {
        indexOfPayment = index;
        console.log(indexOfPayment)
        break;
      }
    }
    return indexOfPayment;
  }
}

