import { Component, NgZone, OnInit, ViewChildren } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { concat } from 'rxjs/operators';
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

  productCheckOut: boolean = false;
  isNew: boolean = false;
  totalDue: any = [];

  isWallet: boolean = false;
  currentWalletsSummary: any = [];
  slideConfig = {
    "slidesToShow": 1, dots: true, "infinite": false,
    "autoplay": false, "prevArrow": false, "slidesToScroll": 2,
    "nextArrow": false
  };



  currentWalletLineItem: any = [];

  isProductLimitReached = false;
  numOfAttempts = 0;
  magneticId: any =0;
  currentMagneticProductId: any = 0;
  @ViewChildren('cardsList') cardsList;
  constructor(private cdtaService?: CdtaService, private globals?: Globals, private route?: ActivatedRoute, private router?: Router, private _ngZone?: NgZone, private electronService?: ElectronService, ) {
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
      }
      else
        // this.frequentRide();
        this.shoppingcart = JSON.parse(localStorage.getItem("shoppingCart"));
      this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1]);


      // if (this.isMagnetic) {
      //   var magnetic = {
      //     "name": "Magnetic" + " " + (this.magneticCardList.length + 1),
      //     "id": (this.magneticCardList.length)
      //   }
      //   this.magneticCardList.push(magnetic)
      //   // this.productTotal = this.productTotal + parseFloat(this.magneticCardCost);
      //   // this.displayMagneticsSubtotal(this.MagneticList, false);
      //   // this.isfromAddProduct = true;
      //   // this.electronService.ipcRenderer.send('readSmartcard', cardName);
      // }
        //this.frequentRide();

      if (!this.isMagnetic && !this.isMerchendise) {
        this.checkIsCardNew();
        if (this.isNew) {
          this.productTotal = this.productTotal + parseFloat(this.smartCardCost);
          // this.displaySmartCardsSubtotal(this.merchantList, false);
        }

      }


      // this.cardsList.toArray()[0].nativeElement.classList.add('isActive');
    });
    var readCardListener = this.electronService.ipcRenderer.on('readcardResult', (event, data) => {
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
            this.checkIsCardNew();
            this.cardJson.push(JSON.parse(data));
            this.currentCard = this.cardJson[this.cardJson.length - 1]
            this.selectedProductCategoryIndex = 0;
           
            this.selectCard(this.cardJson.length - 1);
            this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering);
            this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1])
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

    var doPinPadTransactionResultListener: any = this.electronService.ipcRenderer.on('doPinPadTransactionResult', (event, data) => {
      if (data != undefined && data != "") {
        this.electronService.ipcRenderer.send('getPinpadTransactionStatus')
      }
    });

    this.electronService.ipcRenderer.on('getPinpadTransactionStatusResult', (event, data) => {
      if (data != undefined && data != "") {
        if (data != 1 && this.numOfAttempts < 600) {
          var timer = setTimeout(() => {
            this.numOfAttempts++;
            this.electronService.ipcRenderer.send('getPinpadTransactionStatus')
          }, 1000);
        } else {
          clearTimeout(timer);
          $("#creditCardApplyModal").modal("hide")
          this.electronService.ipcRenderer.send('getPinpadTransactionData')
        }
      }
    });

    this.electronService.ipcRenderer.on('getPinpadTransactionDataResult', (event, data) => {
      if (data != undefined && data != "") {
        localStorage.setItem("pinPadTransactionData", data); 
        this.saveTransaction(9);
      }
    });

    this.electronService.ipcRenderer.on('cancelPinpadTransactionResult', (event, data) => {
      if (data != undefined && data != "") {
        $("#creditCardApplyModal").modal("hide")
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


  }

  ngOnInit() {
    let item = JSON.parse(localStorage.getItem("readCardData"))
    this.viewCardData = new Array(JSON.parse(item))
    this.cardProductData = JSON.parse(localStorage.getItem("cardProductData"))
    console.log("viewCardData", this.viewCardData)
    this.shoppingcart = JSON.parse(localStorage.getItem("shoppingCart"));
    console.log(this.shoppingcart);
    this.frequentRide();
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
      if (product.product_type == selectProduct.Ticket.Group && product.OfferingId == selectProduct.OfferingId) {
        existingProductCount = product.recharges_pending;
      }
    })

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      if (walletContent._offering.Ticket.Group == selectProduct.Ticket.Group && walletContent._offering.OfferingId == selectProduct.OfferingId) {
        existingProductCount = walletContent._quantity;
      }
    })

    if ((existingProductCount + 1) <= (this.terminalConfigJson.MaxPendingCount + 1))
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
      if (product.product_type == selectProduct.Ticket.Group && product.OfferingId == selectProduct.OfferingId) {
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
      if (product.product_type == selectProduct.Ticket.Group && product.OfferingId == selectProduct.OfferingId) {
        remainingValue = remainingValue + product.remaining_value;
      }
    })

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      if (walletContent._offering.Ticket.Group == selectProduct.Ticket.Group && walletContent._offering.Ticket.Designator == selectProduct.Ticket.Designator) {
        remainingValue = remainingValue + (walletContent._quantity * walletContent._offering.Ticket.Value);
      }
    })

    if ((remainingValue + selectProduct.Ticket.Value) <= 200)
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




  // getProductCountFromShoppingCart(product: any) {
  //   var isExistingProducts = false;
  //   var isProductLimitReached = false;
  //   var existingQuantity = 0;
  //   this.currentWalletLineItem.forEach(walletContent => {
  //     if ( walletContent.offeringId == selectedItem.offeringId )
  //       switch (selectedItem.product_type) {
  //         case 1:
  //           return walletContent.Offering.qty;
  //           break;
  //         case 2:
  //           return walletContent.remaining_value * walletContent.qty
  //           break;
  //         case 3:
  //           return (walletContent.remaining_value * walletContent.qty)/100
  //           break;
  //       }
  //     })
  // }


  getProductLimitMessage() {
    let message = "Limit Reached"
    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.MAGNETIC_ID:
        message = "Cannot Add more than one Product"
        break;
      case MediaType.SMART_CARD_ID:
        message = "Cannot Add more than 4 products (Existing + New)"
        break;
    }
    return message
  }

  addProductToWallet(product) {
    if (!this.isTotalproductCountForCardreached(product)) {
      this.maxLimitErrorMessages = this.getProductLimitMessage()
      $("#maxCardLimitModal").modal('show');
      return;
    }

    this.shoppingcart = FareCardService.getInstance.addFareProduct(this.shoppingcart, product, this.currentWalletLineItem);
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);

    // let response = FareCardService.getInstance.addFareProduct(this.shoppingcart, product, this.currentWalletLineItem);
    // localStorage.setItem('shoppingCart', JSON.stringify(response));

  }

  // getSelectedProductData(merch) {
  //   if (this.isMaxProductLengthReached(merch)) {
  //     if (this.maxRechargesPendingReached || this.maxRechargeRidesReached || this.maxRemainingValueReached) {
  //       this.maxRechargesPendingReached = false;
  //       this.maxRechargeRidesReached = false;
  //       this.maxRemainingValueReached = false;
  //       $("#maxCardLimitModal").modal('show');
  //       return
  //     }
  //     $("#magneticCardLimitModal").modal('show');
  //     return;
  //   }

  //   var isItemExistsInCard: any = false;
  //   var itemIndex = 0;
  //   for (let index = 0; index < this.productCardList.length; index++) {
  //     const element = this.productCardList[index];
  //     if (this.currentCard.printed_id == element && this.merchantList[index].OfferingId == merch.OfferingId) {
  //       isItemExistsInCard = true;
  //       itemIndex = index;
  //     }
  //   }

  //   if (this.merchantList.length == 0) {
  //     this.merchantList.push(merch);
  //     this.productCardList.push(this.currentCard.printed_id)
  //     this.quantityList.push(1);
  //   }
  //   else if (isItemExistsInCard == true) {
  //     this.quantityList[itemIndex] = this.quantityList[itemIndex] + 1;
  //   }
  //   else if (isItemExistsInCard == false) {
  //     this.quantityList.push(1);
  //     this.merchantList.push(merch);
  //     this.productCardList.push(this.currentCard.printed_id)
  //   }

  //   this.displaySmartCardsSubtotal(this.merchantList, false);

  //   this.productTotal = this.productTotal + parseFloat(merch.Ticket.Price);
  // }

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
    // this.displayMagneticsSubtotal(this.MagneticList, false);
    this.productTotal = this.productTotal + parseFloat(merch.UnitPrice)
  }


  removeCurrentWalletLineItem() {
    $("#currentCardRemove").modal('show');
  }

  removeCurrentWalletLineItemConfirmation() {
    // localStorage.removeItem('c')
    this.shoppingcart = ShoppingCartService.getInstance.removeItem(this.shoppingcart, this.currentWalletLineItem, null, true);
    // Utils.getInstance.removeWalletFromLocalStore(this.cardJson, );
    this.currentWalletLineItem = this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1];
    if (this.currentWalletLineItem._walletTypeId == MediaType.MERCHANDISE_ID) {
      this.isMerchendise = true
    }
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);


  }




  removeProduct(product) {
    this.productToRemove = product;
    $("#removeProductModal").modal('show');
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
    if(this.magneticIds[this.magneticId] == this.magneticCardList[this.magneticId].id) {
      var selectedIndex = this.currentMagneticProductId;
      this.MagneticList.splice(selectedIndex, 1);
      this.magneticIds.splice(selectedIndex, 1);
      this.displayMagneticsSubtotal(this.MagneticList, false);
    }
   
  }

  removeMerchProduct(merch) {
    this.merchproductToRemove = merch
    $("#removeMerchProductModal").modal('show');
  }

  removeMagneticProduct(merch,j) {
    this.magneticProductToRemove = merch;
    this.currentMagneticProductId = j;
    $("#removeMagneticProductModal").modal('show');
    // this.productTotal = this.productTotal - parseFloat(merch.UnitPrice);
    // var selectedIndex = this.MagneticList.indexOf(merch);
    // this.MagneticList.splice(selectedIndex, 1);
    // this.productCardList.splice(selectedIndex, 1);
  }

  productCheckout() {
    if (this.totalDue == 0) {
      $("#productTotalWarningModal").modal('show');
      return;
    }
    this.productCheckOut = true;

    var index = 0;
    this.merchantList.forEach(element => {
      element.quantity = this.quantityList[index];
      index++;
    });
    localStorage.setItem('encodeData', JSON.stringify(this.merchantList));
    localStorage.setItem("MerchandiseData", JSON.stringify(this.merchantiseList));
    localStorage.setItem("MagneticData", JSON.stringify(this.MagneticList));
    localStorage.setItem('productCardData', JSON.stringify(this.productCardList));
    localStorage.setItem('cardsData', JSON.stringify(this.cardJson));
    localStorage.setItem('areExistingProducts', JSON.stringify(this.areExistingProducts));
    this.checkout = false;
  }

  cancelCheckout() {
    $("#cancelCheckoutModal").modal('show');
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

  // stored ride values
  storedValue() {
    this.selectedProductCategoryIndex = 1;
    this.merchantise = [];
    let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
    let list = FilterOfferings.getInstance.filterFareOfferings(item.Offering, TICKET_GROUP.RIDE, TICKET_TYPE.RIDE, this.currentWalletLineItem);
    // this.cdtaService.getJSON().subscribe(data => {
    //   var i = 0;
    //   this.productJson.forEach(element => {
    //     var isCorrectType = false;
    //     if (element.Ticket != undefined && element.Ticket.WalletType != undefined) {
    //       element.Ticket.WalletType.forEach(walletElement => {
    //         if (this.isMagnetic) {
    //           if (walletElement.WalletTypeId == 10)
    //             isCorrectType = true;
    //         }
    //         else {
    //           if (walletElement.WalletTypeId == 3)
    //             isCorrectType = true;
    //         }
    //       });
    //     }
    //     if (!this.isMagnetic && null != element.Ticket && undefined != element.Ticket && isCorrectType && this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "2" && (element.Ticket.TicketType.TicketTypeId == 2 && !element.IsMerchandise)) {
    //       this.merchantise.push(element);
    //     }
    //     else if (this.isMagnetic && undefined != element.Ticket && undefined != element.Ticket.WalletType && isCorrectType && element.Ticket.Group == "2") {
    //       // this.merchantise.push(this.newMagneticProduct);
    //       this.merchantise.push(element);
    //     }
    //   });
    // });
    this.merchantise = list;
  }
  frequentRide() {
    this.selectedProductCategoryIndex = 0;
    this.merchantise = [];
    let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
    let list = FilterOfferings.getInstance.filterFareOfferings(item.Offering, TICKET_GROUP.PERIOD_PASS, TICKET_TYPE.PERIOD, this.currentWalletLineItem);
    // this.productJson.forEach(element => {
    //   var isCorrectType = false;
    //   if (element.Ticket != undefined && element.Ticket.WalletType != undefined) {
    //     element.Ticket.WalletType.forEach(walletElement => {
    //       if (this.isMagnetic) {
    //         if (walletElement.WalletTypeId == 10)
    //           isCorrectType = true;
    //       }
    //       else {
    //         if (walletElement.WalletTypeId == 3)
    //           isCorrectType = true;
    //       }
    //     });
    //   }
    //   if (!this.isMagnetic && null != element.Ticket && undefined != element.Ticket && isCorrectType && this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "1" && (element.Ticket.TicketType.TicketTypeId == 3 && !element.IsMerchandise)) {
    //     this.merchantise.push(element);
    //   }
    //   else if (this.isMagnetic && undefined != element.Ticket && undefined != element.Ticket.WalletType && isCorrectType && element.Ticket.Group == "1") {
    //     this.merchantise.push(element);
    //   }
    // });

    this.merchantise = list;
  }
  payValue() {
    this.selectedProductCategoryIndex = 2;
    this.merchantise = [];
    let item = JSON.parse(JSON.parse(localStorage.getItem("catalogJSON")));
    let list = FilterOfferings.getInstance.filterFareOfferings(item.Offering, TICKET_GROUP.VALUE, TICKET_TYPE.STORED_FIXED_VALUE, this.currentWalletLineItem);
    // this.productJson.forEach(element => {
    //   var isCorrectType = false;
    //   if (element.Ticket != undefined && element.Ticket.WalletType != undefined) {
    //     element.Ticket.WalletType.forEach(walletElement => {
    //       if (this.isMagnetic) {
    //         if (walletElement.WalletTypeId == 10)
    //           isCorrectType = true;
    //       }
    //       else {
    //         if (walletElement.WalletTypeId == 3)
    //           isCorrectType = true;
    //       }
    //     });
    //   }
    //   if (!this.isMagnetic && null != element.Ticket && undefined != element.Ticket && isCorrectType && this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "3" && (element.Ticket.TicketType.TicketTypeId == 1 && !element.IsMerchandise)) {
    //     this.merchantise.push(element);
    //   }
    //   else if (this.isMagnetic && undefined != element.Ticket && undefined != element.Ticket.WalletType && isCorrectType && element.Ticket.Group == "3") {
    //     this.merchantise.push(element);
    //   }
    // });
    this.merchantise = list;
  }

  addCard() {
    $("#addCardModal").modal('show');

  }

  newFareCard() {
    this.checkIsCardNew();
    this.isfromAddProduct = true;
    this.electronService.ipcRenderer.send('readSmartcard', cardName);
    this.isMagnetic = false;
    this.isMerchendise = false;
    localStorage.setItem("isMagnetic", 'false');
    localStorage.setItem("isMerchendise", "false");
    if (this.isNew) {
      this.productTotal = this.productTotal + parseFloat(this.smartCardCost);
    }
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
    this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1]);
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
  activeWallet(item) {
    this.currentWalletLineItem = item;
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
    this.merchantise = list;
  }

  displayDigit(digit) {
    this.productTotal = Math.round(this.productTotal * 100);
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

  getSubTotal(currentWalletLineItem) {
    this.subTotal = ShoppingCartService.getInstance.getSubTotalForCardUID(currentWalletLineItem);
  }

  getTotalDue(shoppingCart) {
    this.totalDue = ShoppingCartService.getInstance.getGrandTotal(shoppingCart);
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

  checkIsCardNew() {
    this.isNew = (this.currentCard.products.length == 1 && ((this.currentCard.products[0].product_type == 3) && (this.currentCard.products[0].remaining_value == 0))) ? true : false;
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
          if (catalogElement.WalletType.WalletTypeId == 10) {
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
        // this.displayMagneticsSubtotal(this.MagneticList, true);
        var magneticIndex = 0;
        var currentMagneticCardList: any = [];
        this.magneticCardList.forEach(magneticCardElement => {
          walletObj = [];
          // jsonMagneticObj = [];
          currentMagneticCardList = [];
          var loopIndex = 0;
          this.MagneticList.forEach(listElement => {
            if (this.magneticIds[loopIndex] == magneticIndex) {
              currentMagneticCardList.push(listElement);
            }
            loopIndex++;
          });
          currentMagneticCardList.forEach(walletElement => {
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
              "cardPID": magneticCardElement.name,
              "cardUID": new Date().getTime(),
              "walletTypeId": 3,
              "shiftType": shiftType,
              "timestamp": new Date().getTime()
            }
            walletObj.push(jsonWalletObj);
          });
          var JsonObj: any = {
            "transactionID": new Date().getTime(),
            "cardPID": magneticCardElement.name,
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
            "unitPrice": this.magneticCardCost,
            "totalCost": this.magneticCardCost,
            "userID": localStorage.getItem("userEmail"),
            "shiftID": 1,
            "fareCode": fareCode,
            "walletContentItems": walletObj,
            "walletTypeId": 10,
            "shiftType": shiftType,
            "timestamp": new Date().getTime()
          };
          jsonMagneticObj.push(JsonObj);
          magneticIndex++;
        });
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
        this.electronService.ipcRenderer.send('savaTransactionForMagneticMerchandise', merchandiseTransactionObj);
      }
      if (this.merchantList.length > 0 && this.MagneticList.length == 0 && this.merchantiseList.length == 0) {
        // this.displaySmartCardsSubtotal(this.merchantList, true)
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

  doPinPadTransaction() {
    this.numOfAttempts = 0;
    $("#creditCardModal").modal("hide")
    $("#creditCardApplyModal").modal("show")
    this.electronService.ipcRenderer.send('doPinPadTransaction', (this.productTotal*100));
  }

  cancelPinPadTransaction(){
    this.electronService.ipcRenderer.send('cancelPinpadTransaction');
  }

}
