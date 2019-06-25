import { Component, NgZone, OnInit, ViewChildren, OnDestroy } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { FareCardService } from 'src/app/services/Farecard.service';
import { ShoppingCartService } from 'src/app/services/ShoppingCart.service';
import { FilterOfferings } from 'src/app/services/FilterOfferings.service';
import { MediaType, TICKET_GROUP, TICKET_TYPE, Constants } from 'src/app/services/MediaType';
import { Utils } from 'src/app/services/Utils.service';
import { TransactionService } from 'src/app/services/Transaction.service';
import { PaymentType } from 'src/app/models/Payments';
import * as Hammer from 'hammerjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SysytemConfig } from 'src/app/config';
import { CardService } from 'src/app/services/Card.service';
import {AddProductValidations} from 'src/app/validations/AddProductValidations';


declare var $: any;

let isExistingCard = false;
const hammertime = new Hammer(document.body);
hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit, OnDestroy {
  currencyForm: FormGroup = this.formBuilder.group({
    currency: ['']
  });
  customAmountForm: FormGroup = this.formBuilder.group({
    amount: ['']
  });

  merchantise = [];
  merch = [];
  merchantiseList: any = [];
  MagneticList: any = [];
  productTotal: any = '0';
  checkout = true;
  cardJson: any = [];
  productJson: any = [];
  shoppingcart: any = [];
  readCarddata: any = {};
  carddata: any = [];
  numberDigits: any = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  zeroDigits: any = ['0', '00'];
  currentCard: any = {};
  selectedProductCategoryIndex: any = 0;
  nonFare = true;
  regularRoute = false;
  isMagnetic = false;
  isMerchendise = false;
  terminalConfigJson: any = [];
  areExistingProducts: any = [];
  isfromAddProduct = false;
  maxLimitErrorMessages: String = '';
  calsifilter: Boolean = false;
  merchproductToRemove: any = {};
  magneticProductToRemove: any = {};
  productToRemove: any = {};
  magneticCardList: any = [];
  magneticIds: any = [];
  currentMagneticIndex: any = 0;
  magneticCardSubTotal: any = 0;
  merchentiseSubTotal: any = 0;
  subTotal: any = 0;
  smartCardCost: any = 0;
  magneticCardCost: any = 0;
  compDue: any = 0;
  payAsYouGoBalInCard: any = 0;
  productCheckOut: Boolean = false;
  isNew: Boolean = false;
  totalDue: any = [];
  checkoutTotal: string;
  isCustomAmount = false;
  walletItems = [];
  walletItemContents = [];
  isCardPaymentCancelled: Boolean = false;
  currentWalletLineProduct: any = 0;
  currentWalletMerchProduct: any = 0;
  userdata: any;
  isPerformSales: Boolean = true;
  userPermissions: any;
  slideConfig = {
    'slidesToShow': 2, dots: true, 'infinite': false,
    'autoplay': false, 'prevArrow': false, 'slidesPerRow': 2,
    'nextArrow': false
  };

  payment = new PaymentType();
  userFarecode: any;
  bonusRidesCountText: string;
  nextBonusRidesText: string;
  active_card_expiration_date_str: string;
  active_printed_id: number;
  active_wallet_status: string;
  currentWalletLineItem: any = [];
  card_id: any;
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
  isExistingFareCardApplied: boolean = false;
  ExistingFareCardAppliedTotal: any = 0;
  isPayAsYouGoApplied: boolean = false;
  payAsYouGoAppliedTotal: any = 0;
  cashAppliedTotal: any = 0;
  isVoucherApplied: Boolean = false;
  isCheckApplied: Boolean = false;
  checkAppliedTotal: any = 0;
  voucherAppliedTotal: any = 0;
  voucherRemaining: any;
  existingCardRemaining: any;
  payAsYouGoRemaining: any;
  isCompApplied: boolean = false;
  applyCompShow: boolean = false;
  reason: boolean = true;
  reasonForComp = '';
  isCardApplied: Boolean = false;
  cardAppliedTotal: any;
  cardContents = [];
  tab_num = 0;
  selected = 0;
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  badlistedProductModalText = '';
  message: string;
  title: string;
  cancelCheckoutcash: Boolean;
  maxSyncLimitReached = false;
  isCashBack: Boolean;
  taxTotal = 0;
  accountBase: Boolean;
  isSmartCard = false;
  onlyPayAsYouGoApplied: boolean = false;
  checkAccountCardsLength: any;
  constructor(
    private formBuilder: FormBuilder, private config?: SysytemConfig, private cdtaService?: CdtaService,
    private route?: ActivatedRoute, private router?: Router, private _ngZone?: NgZone, private electronService?: ElectronService, ) {

    route.params.subscribe(val => {
      this.isMagnetic = localStorage.getItem('isMagnetic') == 'true' ? true : false;
      this.isMerchendise = localStorage.getItem('isNonFareProduct') == 'true' ? true : false;
      this.accountBase = localStorage.getItem('isAccountBased') == 'false' ? false : true;
      this.smartCardCost = localStorage.getItem('smartCardCost');
      this.magneticCardCost = localStorage.getItem('magneticCardCost');
      this.checkAccountCardsLength = JSON.parse(localStorage.getItem('accountDetails'));

      const item = JSON.parse(localStorage.getItem('catalogJSON'));
      this.productJson = JSON.parse(item).Offering;
      this.readCarddata = JSON.parse(localStorage.getItem('readCardData'));
      if (this.readCarddata != '' || this.readCarddata != undefined) {
        this.cardJson.push(JSON.parse(this.readCarddata));
      }
      if (this.cardJson[0] == null) {
        this.cardJson = [];
      } else {
        this.currentCard = JSON.parse(this.readCarddata);
      }
      this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
      const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
      this.maxSyncLimitReached = Utils.getInstance.checkSyncLimitsHit(this.terminalConfigJson, deviceInfo);
      if (!this.isMagnetic) {
      }
      if (this.isMerchendise) {
        this.clickOnMerch();
        this.shoppingcart = JSON.parse(localStorage.getItem('shoppingCart'));
        this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
        this.activeWallet(this.shoppingcart._walletLineItem[0], 0);
      } else {
        this.shoppingcart = JSON.parse(localStorage.getItem('shoppingCart'));
        this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
        // if ((this.isFromAccountBasedCard()) || !this.accountBase) {
        this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
        // }
      }
    });
  }

  /**
   * Intializing the component
   * loading frequent ride products
   * @memberof AddProductComponent
   */
  ngOnInit() {
    // checking permissions of present logged in user to perform sales
    this.accountBase = localStorage.getItem('isAccountBased') == 'false' ? false : true;
    this.userdata = JSON.parse(localStorage.getItem('userData'));
    this.cdtaService.getUserPermissionsJson().subscribe(data => {
      if (data != undefined) {
        this.userPermissions = data;
        if (this.userdata.permissions.indexOf(this.userPermissions.PERMISSIONS.PERM_APOS_PERFORM_SALES) == -1) {
          this.isPerformSales = false;
        } else {
          this.isPerformSales = true;
        }
      } else {
        console.log('permissions failure')
      }
    });
    this.shoppingcart = JSON.parse(localStorage.getItem('shoppingCart'));
    if((this.checkAccountCardsLength == null) || (this.checkAccountCardsLength.cards.length != 0)) {
      this.selectedProductCategoryIndex = 0;
      this.frequentRide();
    }
    if (this.isMerchendise) {
      this.clickOnMerch();
    }
  }

  /**
   * before navigating to readcard this method will remove data from localstorage and
     removing result handler listeners.
   *
   * @memberof AddProductComponent
   */
  navigateToReadCard() {
    localStorage.removeItem('readCardData');
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem('cardsData');
    localStorage.removeItem('transactionAmount');
    localStorage.removeItem('MerchandiseData');
    localStorage.removeItem('MagneticData');
    this.calsifilter = false;
    this.electronService.ipcRenderer.removeAllListeners('readCardResult');
    this.electronService.ipcRenderer.removeAllListeners('saveTransactionForMagneticMerchandiseResult');
    this.electronService.ipcRenderer.removeAllListeners('doPinPadTransactionResult');
    this.electronService.ipcRenderer.removeAllListeners('getPinpadTransactionStatusResult');
    this.electronService.ipcRenderer.removeAllListeners('getPinpadTransactionDataResult');
    const isAccountBased = localStorage.getItem('isAccountBased');
    if (isAccountBased == 'true') {
      this.router.navigate(['/account_details']);
    } else {
      this.router.navigate(['/home']);
    }
  }
  /**
   * Cleanup all listeners using this method
   *
   * @memberof AddProductComponent
   */
  ngOnDestroy() {
    this.electronService.ipcRenderer.removeAllListeners('readCardResult');
    this.electronService.ipcRenderer.removeAllListeners('saveTransactionForMagneticMerchandiseResult');
    this.electronService.ipcRenderer.removeAllListeners('doPinPadTransactionResult');
    this.electronService.ipcRenderer.removeAllListeners('getPinpadTransactionStatusResult');
    this.electronService.ipcRenderer.removeAllListeners('getPinpadTransactionDataResult');
  }


  /**
   * checking the maximum product legnth for magnetic products
   *
   * @returns
   * @memberof AddProductComponent
   */
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

  /**
   * Checking the product is magnetic product or not before adding into the wallet
   *
   * @returns
   * @memberof AddProductComponent
   */
  isMagneticProduct() {
    let canAddProduct = false;
    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.MAGNETIC_ID:
        canAddProduct = true;
    }
    return canAddProduct;
  }
  isUltraLightProduct() {
    let canAddProduct = false;
    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.LUCC:
        canAddProduct = true;
    }
    return canAddProduct;
  }
  /**
   * Checking the product is merchendise product or not before adding into the wallet
   *
   * @returns
   * @memberof AddProductComponent
   */
  isMerchendiseProduct() {
    let canAddProduct = false;
    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.MERCHANDISE_ID:
        canAddProduct = true;
    }
    return canAddProduct;
  }



  /**
   * check the total product count reached for card.
   * check if product is merchendise product it returns true.
   * check if product is magnetic product it returns true.
   * check the product count for existing card and return the count.
   * @param {*} selectedItem
   * @returns
   * @memberof AddProductComponent
   */
  isTotalproductCountForCardreached(selectedItem: any) {
    let canAddProduct = false;
    if (this.isMerchendiseProduct()) {
      return true;
    }

    if (this.isMagneticProduct()) {
      if (this.isMagneticProductLimitReached()) {
        return false;
      }
      return true;
    }
    if (this.isUltraLightProduct()) {
      if (!this.isUltraLightProductLimitReached(selectedItem)) {
        return false;
      }
      return true;
    }

    const currentProductCount = this.getProductCountFromExistingCard(selectedItem);
    if (currentProductCount > this.terminalConfigJson.NumberOfProducts) {
      canAddProduct = false;
      return canAddProduct;
    }
    let onlyPayAsYouGoAllowed = false;
    if (this.terminalConfigJson.NumberOfProducts - 1 == currentProductCount) {
      if (!this.isThereAnyActivePayAsYouGoProduct()) {
        onlyPayAsYouGoAllowed = true;
      }
    }

    if (!onlyPayAsYouGoAllowed && this.isFrequentProduct(selectedItem)) {
      if (this.isCounttReachedForFrequentRide(selectedItem)) {
        return true;
      }
      return false;
    }

    if (!onlyPayAsYouGoAllowed && this.isStoreRideProduct(selectedItem)) {
      if (this.isCounttReachedForStoreRide(selectedItem)) {
        return true;
      }
      return false;
    }

    if (this.isPayAsYouGoProduct(selectedItem)) {
      if (this.isCounttReachedForPayAsYouGo(selectedItem)) {
        return true;
      }
      return false;
    }

    return canAddProduct;
  }
  isUltraLightProductLimitReached(selectedItem) {
    let canAddProduct = false;
    let productType = 0;
    let designator = 0;
    let luccProductIndex = 0;
    let cardObj = this.cardJson[this.currentWalletLineItemIndex];
    if ((cardObj.product.product_type == 0 && cardObj.product.designator == 0 &&
      this.currentWalletLineItem._walletContents.length > 0)) {
      productType = this.currentWalletLineItem._walletContents[luccProductIndex]._offering.Ticket.Group;
      designator = this.currentWalletLineItem._walletContents[luccProductIndex]._offering.Ticket.Designator;
    } else {
      productType = cardObj.product.product_type;
      designator = cardObj.product.designator;
    }
    if ((productType == selectedItem.Ticket.Group &&
      designator == selectedItem.Ticket.Designator) ||
      (productType == 0 && designator == 0)) {
      canAddProduct = true;
      if (this.isStoreRideProduct(selectedItem)) {
        if (this.isCounttReachedForStoreRide(selectedItem)) {
          return true;
        }
        return false;
      }
      if (this.isFrequentProduct(selectedItem)) {
        if (this.isCounttReachedForFrequentRide(selectedItem)) {
          return true;
        }
        return false;
      }


      if (this.isPayAsYouGoProduct(selectedItem)) {
        if (this.isCounttReachedForPayAsYouGo(selectedItem)) {
          return true;
        }
        return false;
      }
    }
    return canAddProduct;
  }
  /**
   * check is there any active payAsYouGo product in card
   *
   * @returns
   * @memberof AddProductComponent
   */
  isThereAnyActivePayAsYouGoProduct() {
    let isExist = false;
    for (const product of this.currentCard.products) {
      if (product.product_type == TICKET_GROUP.VALUE && this.isValidProduct(product)) {
        isExist = true;
        break;
      }
    }
    return isExist;
  }
  /**
   * checking is it frequent ride product or not
   *
   * @param {*} selectedItem
   * @returns
   * @memberof AddProductComponent
   */
  isFrequentProduct(selectedItem) {
    if (selectedItem.Ticket.Group == 1) {
      return true;
    }
  }

  /**
   *this function check if frequen ride product count reached for the card or not
   *
   * @param {*} selectProduct
   * @returns
   * @memberof AddProductComponent
   */
  isCounttReachedForFrequentRide(selectProduct: any) {
    let canAddFrequentRideBool: Boolean = false;

    let existingProductCount = 0;

    this.currentCard.products.forEach(product => {
      if (product.product_type == selectProduct.Ticket.Group && product.designator == selectProduct.Ticket.Designator) {
        existingProductCount = product.recharges_pending + 1;
      }
    });

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      if (walletContent._offering.Ticket.Group == selectProduct.Ticket.Group &&
        walletContent._offering.OfferingId == selectProduct.OfferingId) {
        existingProductCount += walletContent._quantity;
      }
    });

    if ((existingProductCount) <= (this.terminalConfigJson.MaxPendingCount)) {
      canAddFrequentRideBool = true;
    } else {
      canAddFrequentRideBool = false;
    }
    return canAddFrequentRideBool;
  }

  /**
   * checking is it stored ride product or not
   *
   * @param {*} selectedItem
   * @returns
   * @memberof AddProductComponent
   */
  isStoreRideProduct(selectedItem) {
    if (selectedItem.Ticket.Group == 2) {
      return true;
    }
  }

  /**
   * this function check if stored ride product count reached for the card
   *
   * @param {*} selectProduct
   * @returns
   * @memberof AddProductComponent
   */
  isCounttReachedForStoreRide(selectProduct: any) {
    let canAddStoreRideBool: Boolean = false;

    let remainingRides = 0;

    this.currentCard.products.forEach(product => {
      if (product.product_type == selectProduct.Ticket.Group && product.designator == selectProduct.Ticket.Designator) {
        remainingRides = remainingRides + product.remaining_rides;
      }
    });

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      if (walletContent._offering.Ticket.Group == selectProduct.Ticket.Group &&
        walletContent._offering.OfferingId == selectProduct.OfferingId) {
        remainingRides = remainingRides + (walletContent._quantity * walletContent._offering.Ticket.Value);
      }
    });

    if ((remainingRides + selectProduct.Ticket.Value) <= 255) {
      canAddStoreRideBool = true;
    } else {
      canAddStoreRideBool = false;
    }
    return canAddStoreRideBool;
  }

  /**
   * checking is it payAsYouGo product or not
   *
   * @param {*} selectedItem
   * @returns
   * @memberof AddProductComponent
   */
  isPayAsYouGoProduct(selectedItem) {
    if (selectedItem.Ticket.Group == 3) {
      return true;
    }
  }

  /**
   *this function check if payAsYouGo product count reached for the card
   *
   * @param {*} selectProduct
   * @returns
   * @memberof AddProductComponent
   */
  isCounttReachedForPayAsYouGo(selectProduct: any) {
    let canAddPayAsYouGoBool: Boolean = false;

    let remainingValue = 0;

    this.currentCard.products.forEach(product => {
      if (product.product_type == selectProduct.Ticket.Group && product.designator == selectProduct.Ticket.Designator) {
        remainingValue = remainingValue + (product.remaining_value / 100);
      }
    });

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      if (walletContent._offering.Ticket. Group == selectProduct.Ticket.Group &&
        walletContent._offering.Ticket.Designator == selectProduct.Ticket.Designator) {
        remainingValue = remainingValue + (walletContent._quantity * walletContent._offering.Ticket.Value);
      }
    });

    if ((remainingValue + selectProduct.Ticket.Value) <= this.terminalConfigJson.MaxStoredValueAmount / 100) {
      canAddPayAsYouGoBool = true;
    } else {
      canAddPayAsYouGoBool = false;
    }
    return canAddPayAsYouGoBool;
  }

  /**
   * check the given product is valid product or not
   *
   * @param {*} product
   * @returns
   * @memberof AddProductComponent
   */
  isValidProduct(product) {
    let flag = true;
    if (product.product_type != TICKET_GROUP.VALUE &&
      Utils.getInstance.isProductExpiredDesfire(product.exp_date_epoch_days, product.add_time) && product.recharges_pending == 0) {
      flag = false;
    } else if (product.product_type == TICKET_GROUP.RIDE && product.remaining_rides == 0) {
      flag = false;
    }

    return flag;
  }

  /**
   * check the product count for existing card and return the count
   *
   * @param {*} selectProduct
   * @returns
   * @memberof AddProductComponent
   */
  getProductCountFromExistingCard(selectProduct: any) {
    const productMap = new Map();

    this.currentCard.products.forEach(product => {
      const key = product.product_type + ':' + product.designator;
      if (productMap.get(key) == undefined && this.isValidProduct(product)) {
        productMap.set(key, 1);
      }
    });

    this.currentWalletLineItem._walletContents.forEach(walletContent => {
      const key = walletContent._offering.Ticket.Group + ':' + walletContent._offering.Ticket.Designator;
      if (productMap.get(key) == undefined) {
        productMap.set(key, 1);
      }
    });

    const newKey = selectProduct.Ticket.Group + ':' + selectProduct.Ticket.Designator;
    if (productMap.get(newKey)) {
      return productMap.size;
    } else {
      return productMap.size + 1;
    }
  }

  /**
   * Displaying limit messages for magnetic and smart card
   *
   * @returns
   * @memberof AddProductComponent
   */
  getProductLimitMessage() {
    let message = 'Limit Reached';
    switch (this.currentWalletLineItem._walletTypeId) {
      case MediaType.MAGNETIC_ID:
        message = 'Cannot add more than one product.';
        break;
      case MediaType.SMART_CARD_ID:
        message = 'Max product limit reached.';
        break;
      case MediaType.LUCC:
        message = 'Card product limit reached';
    }
    return message;
  }

  /**
   * this function returns the boolean if the selected product is badlisted or not
   *
   * @param {*} selectedItem
   * @returns
   * @memberof AddProductComponent
   */
  checkIsBadListedProductOnWallet(selectedItem) {
    let flag = false;
    for (const product of this.currentCard.products) {

      if (selectedItem.Ticket.Group == product.product_type && (selectedItem.Ticket.Designator == product.designator)) {
        if (product.is_prod_bad_listed == true) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }
  /**
   * Adding products to wallet.
   * Checking is there any BadListed product on wallet.
   * Checking the product total count is reached or not.
   * calling getSubTotal() method for total count.
   * @param {*} product
   * @returns
   * @memberof AddProductComponent
   */
  addProductToWallet(product) {
    if ((this.currentWalletLineItem._walletTypeId == MediaType.SMART_CARD_ID ||
      this.currentWalletLineItem._walletTypeId == MediaType.LUCC) &&
      AddProductValidations.getInstance.checkIsBadListedProductOnWallet(product, this.currentCard)) {
      this.badlistedProductModalText = 'Product is deactivated or suspended on this card.';
      $('#badlistedProductModal').modal({
        backdrop: 'static',
        keyboard: false
      });
      return false;
    }
    if (!this.isMerchendise && !this.accountBase) {
      if (!this.isTotalproductCountForCardreached(product)) {
        this.maxLimitErrorMessages = this.getProductLimitMessage();
        $('#maxCardLimitModal').modal({
          backdrop: 'static',
          keyboard: false
        });
        return false;
      }
    }
    this.shoppingcart = FareCardService.getInstance.addFareProduct(this.shoppingcart, product, this.currentWalletLineItem, null);
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);
    this.getNonFareTotalTax(this.currentWalletLineItem);

  }

  /**
   * Remove current walletline item modal.
   *
   * @memberof AddProductComponent
   */
  removeCurrentWalletLineItem() {
    $('#currentCardRemove').modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  /**
   * Removing items from current walletline item.
   *
   * @memberof AddProductComponent
   */
  removeCurrentWalletLineItemConfirmation() {
    const walletToRemove = this.currentWalletLineItem;
    this.shoppingcart = ShoppingCartService.getInstance.removeItem(this.shoppingcart, this.currentWalletLineItem, null, true);
    if (walletToRemove._walletTypeId == MediaType.SMART_CARD_ID || walletToRemove._walletTypeId == MediaType.LUCC) {
      this.removeCardfromCardJSON();
    }
    this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);

    this.currentWalletLineItemIndex = this.walletItems.length - 1;

    this.currentWalletLineItem = this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1];
    if (this.currentWalletLineItem._walletTypeId == MediaType.MERCHANDISE_ID) {
      this.clickOnMerch();
      this.isMerchendise = true;
    }
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);
    this.getNonFareTotalTax(this.currentWalletLineItem);
    this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
  }
  /**
   * remove card from CardJSON
   *
   * @memberof AddProductComponent
   */
  removeCardfromCardJSON() {
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



  /**
   * This method is for showing modal for remove product
   *
   * @param {*} product
   * @memberof AddProductComponent
   */
  removeProduct(product) {
    this.productToRemove = product;
    $('#removeProductModal').modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  /**
   * Removing product from shoppingCart
   *
   * @memberof AddProductComponent
   */
  removeProductConfirmation() {
    this.shoppingcart = ShoppingCartService.getInstance.removeItem(this.shoppingcart,
      this.currentWalletLineItem, this.productToRemove, false);
    this.currentWalletLineItem = this.currentWalletLineItem;
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);
    this.getNonFareTotalTax(this.currentWalletLineItem);
    this.productToRemove = null;
  }

  /**
   * Removing merchendise product from merchendiselist
   *
   * @memberof AddProductComponent
   */
  removeMerchProductConfirmation() {
    const totalPrice = this.merchproductToRemove.UnitPrice * this.merchproductToRemove.quantity;
    this.productTotal = this.productTotal - parseFloat(totalPrice.toString());
    this.merchentiseSubTotal = this.merchentiseSubTotal - parseFloat(totalPrice.toString());
    const selectedIndex = this.merchantiseList.indexOf(this.merchproductToRemove);
    this.merchantiseList.splice(selectedIndex, 1);
  }

  /**
   * Removing magnetic product from magneticList.
   *
   * @memberof AddProductComponent
   */
  removeMagneticProductConfirmation() {
    this.productTotal = this.productTotal - parseFloat(this.magneticProductToRemove.UnitPrice);
    this.magneticCardSubTotal = this.magneticCardSubTotal - parseFloat(this.magneticProductToRemove.UnitPrice);
    if (this.magneticIds[this.magneticId] == this.magneticCardList[this.magneticId].id) {
      const selectedIndex = this.currentMagneticProductId;
      this.MagneticList.splice(selectedIndex, 1);
      this.magneticIds.splice(selectedIndex, 1);
      this.displayMagneticsSubtotal(this.MagneticList, false);
    }

  }

  /**
   * remove merch product pop-up
   *
   * @param {*} merch
   * @memberof AddProductComponent
   */
  removeMerchProduct(merch) {
    this.merchproductToRemove = merch;
    $('#removeMerchProductModal').modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  /**
   * remove magnetic product pop-up
   *
   * @param {*} merch
   * @param {*} j
   * @memberof AddProductComponent
   */
  removeMagneticProduct(merch, j) {
    this.magneticProductToRemove = merch;
    this.currentMagneticProductId = j;
    $('#removeMagneticProductModal').modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  // productCheckoutBySession() {
  //   if (Utils.getInstance.isEmptyShoppingCart(this.shoppingcart)) {
  //     $('#shoppingCartEmptyModal').modal({
  //       backdrop: 'static',
  //       keyboard: false
  //     });
  //     return;
  //   }
  //   if (Utils.getInstance.isAnyEmptyMagnetics(this.shoppingcart)) {
  //     $('#emptyMagneticModal').modal({
  //       backdrop: 'static',
  //       keyboard: false
  //     });
  //     return;
  //   }
  //   if (this.totalDue > this.terminalConfigJson.MaxTransAmount) {
  //     $('#maxTransactionModal').modal({
  //       backdrop: 'static',
  //       keyboard: false
  //     });
  //     return;
  //   }
  //   if (this.totalDue < this.terminalConfigJson.MinTransAmount) {
  //     $('#minTransactionModal').modal({
  //       backdrop: 'static',
  //       keyboard: false
  //     });
  //     return;
  //   }
  //   this.productCheckOut = true;
  //   localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
  //   localStorage.setItem('cardsData', JSON.stringify(this.cardJson));
  //   localStorage.setItem('areExistingProducts', JSON.stringify(this.areExistingProducts));
  //   localStorage.setItem('transactionAmount', JSON.stringify(this.totalDue));
  //   this.checkout = false;
  //   this.checkoutTotal = this.totalDue.toString();
  //   this.totalRemaining = this.totalDue;
  //   this.currencyForm.setValue({ 'currency': this.checkoutTotal });
  //   this.customAmountForm.setValue({ 'amount': this.productTotal });
  // }

  /**
   * This method will call- when you click on checkout button.
   *
   * @returns
   * @memberof AddProductComponent
   */
  productCheckout() {
    // this.sessionService.getAuthenticated();
    if (Utils.getInstance.isEmptyShoppingCart(this.shoppingcart)) {
      $('#shoppingCartEmptyModal').modal({
        backdrop: 'static',
        keyboard: false
      });
      return;
    }
    if (Utils.getInstance.isAnyEmptyMagnetics(this.shoppingcart)) {
      $('#emptyMagneticModal').modal({
        backdrop: 'static',
        keyboard: false
      });
      return;
    }
    if (this.totalDue > this.terminalConfigJson.MaxTransAmount) {
      $('#maxTransactionModal').modal({
        backdrop: 'static',
        keyboard: false
      });
      return;
    }
    if (this.totalDue < this.terminalConfigJson.MinTransAmount) {
      $('#minTransactionModal').modal({
        backdrop: 'static',
        keyboard: false
      });
      return;
    }
    this.productCheckOut = true;
    localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
    localStorage.setItem('cardsData', JSON.stringify(this.cardJson));
    localStorage.setItem('areExistingProducts', JSON.stringify(this.areExistingProducts));
    localStorage.setItem('transactionAmount', JSON.stringify(this.totalDue));
    this.checkout = false;
    this.checkoutTotal = this.totalDue.toString();
    this.totalRemaining = this.totalDue;
    this.currencyForm.setValue({ 'currency': this.checkoutTotal });
    this.customAmountForm.setValue({ 'amount': this.productTotal });
  }


  cancelCheckout() {
    $('#cancelCheckoutModal').modal('show');
  }
  returnPayAsYouGo() {
    this.handleReadCardForReturnPayAsYouGo();
    this.electronService.ipcRenderer.send('readCardForReturnPayAsYouGo', CardService.getInstance.getCardName());
  }
  // productCheckOutSessionModal() {
  //   $('#userTimedOut').modal('show');
  // }
  doVoidTransaction() {
    this.doPinpadVoidTransaction(this.cardAppliedTotal);
  }


  doPinpadVoidTransaction(amount) {
    this.handleDoPinpadVoidTransactionResult();
    this.electronService.ipcRenderer.send('doPinpadVoidTransaction', amount);
  }

  handleDoPinpadVoidTransactionResult() {
    const doPinpadVoidTransactionListener: any = this.electronService.ipcRenderer.once('doPinpadVoidTransactionResult', (event, data) => {
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          this.handleGetPinpadTransactionStatusEncodeResult();
          this.electronService.ipcRenderer.send('getPinpadTransactionStatusEncode');
        });
      }
    });
  }

  handleGetPinpadTransactionStatusEncodeResult() {
    this.electronService.ipcRenderer.once('getPinpadTransactionStatusEncodeResult', (event, data) => {
      if (data != undefined && data != '') {
        if (data == false && this.numOfAttempts < 120) {
          var timer = setTimeout(() => {
            this.numOfAttempts++;
            this.handleGetPinpadTransactionStatusEncodeResult();
            this.electronService.ipcRenderer.send('getPinpadTransactionStatusEncode');
          }, 1000);
        } else {
          clearTimeout(timer);
          this.handleGetPinpadTransactionDataEncodeResult();
          this.electronService.ipcRenderer.send('getPinpadTransactionDataEncode');
        }
      }
    });
  }

  handleGetPinpadTransactionDataEncodeResult() {
    this.electronService.ipcRenderer.once('getPinpadTransactionDataEncodeResult', (event, data) => {
      if (data != undefined && data != '') {
        localStorage.setItem('pinPadTransactionData', data);
      }
    });
  }

  /**
   * when you click on cancel checkout -payment methods that have been applied will be canceled.
   *
   * @memberof AddProductComponent
   */
  cancelCheckOutConfirmation() {
    if (this.isCashApplied) {
      this.cancelCheckoutcash = true;
    } else {
      this.cancelCheckoutcash = false;
    }
    if (this.isPayAsYouGoApplied == true) {
      $('#returnPayAsYouGoModal').modal('show');
    } else {
      this.cancelCheckoutListOfPayments();
    }
  }

  cancelCheckoutListOfPayments() {
    var onlyPayAsYouGo = false;
    if (this.shoppingcart._payments.length != 0) {
      this.cashBack = this.cashAppliedTotal;
      for (let i = 0; i < this.shoppingcart._payments.length; i++) {
        if (this.shoppingcart._payments[i].paymentMethodId == 12) {
          onlyPayAsYouGo = true
        }
      }
      this.getRefundCancelCheckoutTitle();
      $('#cancelCheckoutModal').modal('hide');
      if (this.shoppingcart._payments.length == 1 && onlyPayAsYouGo == true) {
        this.refundConfirmation();
      } else {
        $('#amountApplyCancelModal').modal({
          backdrop: 'static',
          keyboard: false
        });
      }
    } else {
      $('#cancelCheckoutModal').modal('hide');
      this.productCheckOut = false;
      this.checkout = true;
      this.isCashApplied = false;
      this.isVoucherApplied = false;
      this.isCheckApplied = false;
      this.isCardApplied = false;
      this.isExistingFareCardApplied = false;
      this.isPayAsYouGoApplied = false;
      this.shoppingcart._payments = [];
      this.getTotalDue(this.shoppingcart);
    }
    if (this.isCardApplied) {
      $('#cancelCheckoutModal').modal('hide');
      this.doVoidTransaction();
    }
  }
  /**
   * refund confirmation
   *
   * @memberof AddProductComponent
   */
  refundConfirmation() {
    this.productCheckOut = false;
    this.checkout = true;
    this.isCashApplied = false;
    this.isVoucherApplied = false;
    this.isCheckApplied = false;
    this.isCardApplied = false;
    this.isExistingFareCardApplied = false;
    this.isPayAsYouGoApplied = false;
    this.payAsYouGoAppliedTotal = 0;
    this.shoppingcart._payments = [];
    this.getTotalDue(this.shoppingcart);

  }

  // selectCard(index: any) {
  //   this.isMagnetic = false;
  //   localStorage.setItem('isMagnetic', 'false');
  //   this.selectedIdx = index;
  //   this.nonFare = true;
  //   this.regularRoute = false;
  //   this.isMerchendise = false;
  //   localStorage.setItem('isMerchandise', 'false');
  //   this.currentCard = this.cardJson[index];
  //   (this.selectedProductCategoryIndex == 0) ? this.frequentRide() :
  //     (this.selectedProductCategoryIndex == 1) ? this.storedValue() : this.payValue();
  // }

  /**
   * handle readCard result
   *
   * @memberof AddProductComponent
   */
  handleReadCardResult() {
    const readCardListener = this.electronService.ipcRenderer.once('readcardResult', (event, data) => {
      let isDuplicateCard = false;

      if (this.isfromAddProduct && data != undefined && data != '') {
        this.isfromAddProduct = false;
        localStorage.setItem('readCardData', JSON.stringify(data));
        this.carddata = new Array(JSON.parse(data));
        const status = Utils.getInstance.getStatusOfWallet(this.carddata[0]);
        if (Constants.INACTIVE == status) {
          $('#inactiveValidation').modal('show');
          return;
        }
        this._ngZone.run(() => {

          const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
          ShoppingCartService.getInstance.shoppingCart = null;
          this.cardJson.forEach(element => {
            if (element.printed_id == JSON.parse(data).printed_id && !this.isPayAsYouGoApplied) {
              isDuplicateCard = true;
            }
          });
          if (isDuplicateCard) {
            $('#newCardValidationModal').modal('show');
            return;
          } else {
            if (isExistingCard) {
              isExistingCard = false;
              this.cardJson.push(JSON.parse(data));
              this.currentCard = this.cardJson[this.cardJson.length - 1];
              this.selectedProductCategoryIndex = 0;

              this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering, false);
              this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
              this.activeWallet(this.shoppingcart._walletLineItem
              [this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
            } else {
              const isNewCard = this.checkIsCardNew();
              if (isNewCard) {
                this.cardJson.push(JSON.parse(data));
                this.currentCard = this.cardJson[this.cardJson.length - 1];
                this.selectedProductCategoryIndex = 0;

                this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart, this.carddata[0], item.Offering, true);
                this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
                this.activeWallet(this.shoppingcart._walletLineItem
                [this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
              } else {
                $('#newCardValidateModal').modal('show');
              }
            }
          }
        });

      }
    });
  }

  handleReadCardForPayAsYouGo() {
    this.electronService.ipcRenderer.once('readcard_for_payasyougo_Result', (event, data) => {
      if (data != undefined && data != '') {
        var readCardInfo = new Array(JSON.parse(data));
        this.payAsYouGoBalInCard = Utils.getInstance.isPayAsYouGoBalanceAvailable(readCardInfo);
        if (this.payAsYouGoBalInCard == 0) {
          var presentPayAsYouGoBalInCard = 0;
        } else {
          var presentPayAsYouGoBalInCard = this.payAsYouGoBalInCard / 100;
        }
        this.payAsYouGoAppliedTotal = +this.checkoutTotal
        if (this.payAsYouGoBalInCard != 0) {
          if (this.payAsYouGoAppliedTotal > presentPayAsYouGoBalInCard) {
            $('#notEnoughPayAsYouGo').modal('show');
          } else {
            this.handleChargeStoredValue();
            this.electronService.ipcRenderer.send('chargeStoredValue', JSON.parse(data).printed_id, Number(this.payAsYouGoAppliedTotal) * 100);
          }
        }
      } else if (data == null || data == '') {
        $('#errorModal').modal('show');
      }
    })
  }

  handleReadCardForReturnPayAsYouGo() {
    this.electronService.ipcRenderer.once('readcard_for_return_payasyougo_Result', (event, data) => {
      if (data != undefined && data != '') {
        var readCardInfo = new Array(JSON.parse(data));
        this.payAsYouGoAppliedTotal = -Math.abs(this.payAsYouGoAppliedTotal);
        this.handleReturnChargeStoredValue();
        this.electronService.ipcRenderer.send('returnChargeStoredValue', JSON.parse(data).printed_id, Number(this.payAsYouGoAppliedTotal) * 100);
      } else if (data == null || data == '') {
        $('#errorModal').modal('show');
      }
    })
  }

  handleReturnChargeStoredValue() {
    this.electronService.ipcRenderer.once('returnChargeStoredResult', (event, data, card_id) => {
      if (data != undefined && data != '') {
        if (data == 'true') {
          this.card_id = card_id;
          $('#returnPayAsYouGoToCard').modal('show');
        } else {
          $('#unableToReturnPayAsYouGo').modal('show');
        }
      }
    });
  }
  /**
   * getting the list of stored value
   *
   * @memberof AddProductComponent
   */
  storedValue() {
    this.selectedProductCategoryIndex = 1;
    this.currentWalletLineProduct = 0;
    this.merchantise = [];
    const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
    const list = FilterOfferings.getInstance.filterFareOfferings
      (item.Offering, TICKET_GROUP.RIDE, TICKET_TYPE.RIDE, this.currentWalletLineItem, this.accountBase);
    this.walletItemContents = this.formatWatlletContents(list, 6);
    this.merchantise = list;
  }
  /**
   * getting the list of frequent ride products
   *
   * @memberof AddProductComponent
   */
  frequentRide() {
    this.selectedProductCategoryIndex = 0;
    this.currentWalletLineProduct = 0;
    this.merchantise = [];
    const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
    const list = FilterOfferings.getInstance.filterFareOfferings(item.Offering,
      TICKET_GROUP.PERIOD_PASS, TICKET_TYPE.PERIOD, this.currentWalletLineItem, this.accountBase);
    this.walletItemContents = this.formatWatlletContents(list, 6);
    this.merchantise = list;
  }
  /**
   * by using custom amount you can manually enter amount for payAsYouGo product.
   *
   * @param {*} item
   * @returns
   * @memberof AddProductComponent
   */
  customAmount(item) {
    if (!this.isTotalproductCountForCardreached(item)) {
      this.maxLimitErrorMessages = this.getProductLimitMessage();
      $('#maxCardLimitModal').modal({
        backdrop: 'static',
        keyboard: false
      });
      return false;
    }
    this.customPayAsYouGo = item;
    this.isCustomAmount = true;
  }
  closeCustomAmount() {
    this.isCustomAmount = false;
  }
  /**
   * getting the list of payAsYouGo Products
   *
   * @memberof AddProductComponent
   */
  payValue() {
    this.selectedProductCategoryIndex = 2;
    this.currentWalletLineProduct = 0;
    this.merchantise = [];
    const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
    const list = FilterOfferings.getInstance.filterFareOfferings(item.Offering,
      TICKET_GROUP.VALUE, TICKET_TYPE.STORED_FIXED_VALUE, this.currentWalletLineItem, this.accountBase);
    this.walletItemContents = this.formatWatlletContents(list, 6);
    this.merchantise = list;
  }

  addCard() {
    $('#addCardModal').modal('show');

  }

  newFareCard() {
    $('#addCardModal').modal('hide');
    $('#newCardModal').modal('show');
  }
  checkCardType() {
    this.handleGetCardPIDResult();
    this.electronService.ipcRenderer.send('getCardPID', CardService.getInstance.getCardName());
  }
  existingCardClick() {
    isExistingCard = true;
    this.checkCardType();
  }
  handleGetCardPIDResult() {
    this.electronService.ipcRenderer.once('getCardPIDResult', (_event, data) => {
      console.log('cardPID Result', data);
      if (data == '') {
        this.callCardPIDUltraLightC();
      } else {
        this.config.cardTypeDetected = MediaType.SMART_CARD_ID;
        this.isSmartCard = true;
        if (isExistingCard) {
          this.ExistingCard();
        } else {
          this.newCard();
        }
      }
    });
  }
  callCardPIDUltraLightC() {
    this.handleGetCardPIDUltralightC();
    this.electronService.ipcRenderer.send('getCardPIDUltralightC', CardService.getInstance.getCardName());

  }
  handleGetCardPIDUltralightC() {
    this.electronService.ipcRenderer.once('getCardPIDUltraLightCResult', (_event, data) => {
      this.config.cardTypeDetected = MediaType.LUCC;
      console.log('UltraLight data', data);
      this.isSmartCard = false;
      this.readLUCCCard();
    });
  }
  readLUCCCard() {
    // this.updateSettingsForSmartAndLUCC();
    this.callReadLUCCCard();
  }

  callReadLUCCCard() {
    this.handleLUCCCardResult();
    this.electronService.ipcRenderer.send('readCardUltralightC');
  }

  handleLUCCCardResult() {
    this.electronService.ipcRenderer.once('readCardUltralightCResult', (_event, data) => {
      let isDuplicateCard = false;
      if (data != undefined && data != '') {
        localStorage.setItem('readCardData', JSON.stringify(data));
        this.carddata = new Array(JSON.parse(data));
        this.populateCardDataProductForLUCC();
        const status = Utils.getInstance.getStatusOfWallet(this.carddata[0]);
        if (Constants.INACTIVE == status) {
          $('#inactiveValidation').modal('show');
          return;
        }
        this._ngZone.run(() => {

          const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
          ShoppingCartService.getInstance.shoppingCart = null;
          this.cardJson.forEach(element => {
            if (element.printed_id == JSON.parse(data).printed_id) {
              isDuplicateCard = true;
            }
          });
          if (isDuplicateCard) {
            $('#newCardValidationModal').modal('show');
            return;
          } else {
            if (isExistingCard) {
              isExistingCard = false;
              this.cardJson.push(this.carddata[0]);
              this.currentCard = this.cardJson[this.cardJson.length - 1];
              this.selectedProductCategoryIndex = 0;

              this.shoppingcart = FareCardService.getInstance.addUltraLightCard(this.shoppingcart, this.carddata[0], item.Offering, false);
              this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
              this.activeWallet(this.shoppingcart._walletLineItem
              [this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
            } else {
              if (!(this.carddata[0].products[0].product_type != 0 && this.carddata[0].products[0].designator != 0)) {
                this.cardJson.push(this.carddata[0]);
                this.currentCard = this.cardJson[this.cardJson.length - 1];
                this.selectedProductCategoryIndex = 0;

                this.shoppingcart = FareCardService.getInstance.addUltraLightCard(this.shoppingcart, this.carddata[0], item.Offering, true);
                this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
                this.activeWallet(this.shoppingcart._walletLineItem
                [this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
              } else {
                $('#newCardValidateModal').modal('show');
              }
            }
          }
        });
      }
    });
  }

  populateCardDataProductForLUCC() {
    let readableIndex = 0;
    let cardDataProductObj = this.carddata[readableIndex].product;
    let cardDataObj = this.carddata[readableIndex];
    cardDataProductObj.designator = cardDataObj.card_designator;
    cardDataProductObj.product_type = cardDataObj.card_type;
    cardDataProductObj.cardType = cardDataObj.card_type;
    cardDataProductObj.exp_date = cardDataObj.card_exp;
    cardDataProductObj.card_expiration_date_str = cardDataObj.card_exp_str;
    cardDataProductObj.start_date = cardDataObj.start_date;
    cardDataProductObj.is_card_badlisted = cardDataObj.is_card_badlisted;
    cardDataProductObj.is_card_registered = cardDataObj.is_card_registered;
    cardDataProductObj.is_card_negative = cardDataObj.is_card_negative;
    cardDataProductObj.is_auto_recharge = cardDataObj.is_auto_recharge;
    this.carddata[readableIndex].products = [];
    this.carddata[readableIndex].products.push(cardDataProductObj);
  }
  /**
   * This method will call when you click on newcard / LUCC
   *
   * @memberof AddProductComponent
   */
  newCard() {
    this.isfromAddProduct = true;
    this.handleReadCardResult();
    this.electronService.ipcRenderer.send('readSmartcard', CardService.getInstance.getCardName());
    this.isMagnetic = false;
    this.isMerchendise = false;
    localStorage.setItem('isMagnetic', 'false');
    localStorage.setItem('isMerchendise', 'false');

  }

  /**
   * This method will call when you click on ExistingCard
   *
   * @memberof AddProductComponent
   */
  ExistingCard() {
    this.isfromAddProduct = true;
    isExistingCard = true;
    this.handleReadCardResult();
    this.electronService.ipcRenderer.send('readSmartcard', CardService.getInstance.getCardName());
    this.isMagnetic = false;
    this.isMerchendise = false;
    localStorage.setItem('isMagnetic', 'false');
    localStorage.setItem('isMerchendise', 'false');
  }
  /**
   * Selected mediatype is magnetic then this method will work.
   *
   * @memberof AddProductComponent
   */
  magneticCard() {
    this.isMagnetic = true;
    this.isMerchendise = false;
    localStorage.setItem('isMagnetic', 'true');
    localStorage.setItem('isMerchendise', 'false');
    this.selectedProductCategoryIndex = 0;
    const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));

    this.shoppingcart = FareCardService.getInstance.addMagneticsCard(this.shoppingcart, item.Offering);
    ShoppingCartService.getInstance.shoppingCart = null;
    this.walletItems = this.formatWatlletItems(this.shoppingcart._walletLineItem, 2);
    this.activeWallet(this.shoppingcart._walletLineItem[this.shoppingcart._walletLineItem.length - 1], this.walletItems.length - 1);
    this.frequentRide();
  }

  /**
   * This method will work when you click on Magnetic
   *
   * @param {*} index
   * @memberof AddProductComponent
   */
  clickOnMagnetic(index: any) {
    this.magneticId = index;
    this.isMagnetic = true;
    this.nonFare = true;
    this.regularRoute = false;
    this.isMerchendise = false;
    localStorage.setItem('isMerchendise', 'false');
    localStorage.setItem('isMagnetic', 'true');
    this.currentMagneticIndex = index;
    (this.selectedProductCategoryIndex == 0) ? this.frequentRide() :
      (this.selectedProductCategoryIndex == 1) ? this.storedValue() : this.payValue();
  }
  activeWallet(item, index) {
    if (item._walletTypeId == MediaType.SMART_CARD_ID || item._walletTypeId == MediaType.LUCC) {
      const cardIndex = Utils.getInstance.getIndexOfActiveWallet(this.cardJson, item);
      // if ((this.isFromAccountBasedCard()) || !this.accountBase) {
        this.bonusRidesCountText = Utils.getInstance.getBonusRideCount(this.cardJson[cardIndex]);
        this.userFarecode = Utils.getInstance.getFareCodeTextForThisWallet(this.cardJson[cardIndex], this.terminalConfigJson);
        // tslint:disable-next-line:max-line-length
        this.nextBonusRidesText = Utils.getInstance.getNextBonusRidesCount(this.cardJson[cardIndex], this.terminalConfigJson, this.config.cardTypeDetected);
      // }
      this.active_printed_id = this.cardJson[cardIndex].printed_id;
      this.active_card_expiration_date_str = this.cardJson[cardIndex].card_expiration_date_str;
      this.active_wallet_status = Utils.getInstance.getStatusOfWallet(this.cardJson[cardIndex]);
      const ticketMap = new Map(JSON.parse(localStorage.getItem('ticketMap')));
      this.cardContents = Utils.getInstance.getWalletProducts(this.cardJson[cardIndex], ticketMap);
    }

    this.selectedProductCategoryIndex = 0;
    this.currentWalletLineItem = item;
    this.currentWalletLineItemIndex = index;
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);
    if (this.currentWalletLineItem._walletTypeId == MediaType.MAGNETIC_ID) {
      this.isMagnetic = true;
    } else if (this.currentWalletLineItem._walletTypeId == MediaType.MERCHANDISE_ID) {
      this.isMerchendise = true;
    } else {
      this.isMagnetic = false;
      this.isMerchendise = false;
    }
    if (this.shoppingcart._walletLineItem[0]._walletTypeId == item._walletTypeId) {
      this.isMerchendise = true;
      this.clickOnMerch();

    } else {
      this.nonFare = true;
      this.regularRoute = false;
      this.isMerchendise = false;
      (this.selectedProductCategoryIndex == 0 && this.checkAccountCardsLength.cards.length != 0) ? this.frequentRide() :
        (this.selectedProductCategoryIndex == 1) ? this.storedValue() : this.payValue();
    }
  }
  /**
   * This method will work when you click on merchendise
   *
   * @memberof AddProductComponent
   */
  clickOnMerch() {
    this.nonFare = false;
    this.regularRoute = true;
    this.isMerchendise = true;
    this.isMagnetic = false;
    this.merchantise = [];
    localStorage.setItem('isMerchandise', 'true');
    localStorage.setItem('isMagnetic', 'false');
    const list = FilterOfferings.getInstance.filterNonFareOfferings(this.productJson);
    this.walletItemContents = this.formatWatlletContents(list, 6);
    this.merchantise = list;
  }

  textAreaEmpty() {
    if (this.currencyForm.value.currency == '' || this.currencyForm.value.currency == undefined) {
      this.currencyForm.value.currency = '' + this.checkoutTotal;
      this.clearDigit(0);
    }
  }
  onBackSpace() {
    if (this.currencyForm.value.currency != null || this.currencyForm.value.currency != '') {
      this.checkoutTotal = '' + this.currencyForm.value.currency.slice(1);
    }
  }
  customTextAreaEmpty() {
    if (this.customAmountForm.value.amount == '' || this.customAmountForm.value.amount == undefined) {
      this.customAmountForm.value.amount = '' + this.productTotal;
      this.clearDigit(0);
    }
  }

  onCustomAmountBackSpace() {
    if (this.customAmountForm.value.amount != null || this.customAmountForm.value.amount != '') {
      this.productTotal = '' + this.customAmountForm.value.amount.slice(1);
    }
  }

  displayDigit(digit) {
    if (this.isCustomAmount) {
      this.productTotal = Math.round(+(this.productTotal) * 100).toString();
      this.productTotal += digit;
      this.productTotal = (+(this.productTotal) / 100).toString();
      if (this.customAmountForm.value.amount == '') {
        this.customAmountForm.value.amount = '' + this.productTotal;
      }
    } else {
      if (this.totalDue == this.checkoutTotal) {
        this.checkoutTotal = '0';
      }
      this.checkoutTotal = Math.round(+(this.checkoutTotal) * 100).toString();
      this.checkoutTotal += digit;
      this.checkoutTotal = (+(this.checkoutTotal) / 100).toString();
      if (this.currencyForm.value.currency == '') {
        this.currencyForm.value.currency = '' + this.checkoutTotal;
      }
    }
  }
  /**
   * this method will work for enter the custom amount for payAsYouGo product
   *
   * @param {*} productTotal
   * @memberof AddProductComponent
   */
  enterCustomAmount(productTotal) {
    const offering = this.customPayAsYouGo;
    this.customPayAsYouGo = null;
    offering.UnitPrice = + productTotal;
    const thisIsCustomOffering = true;
    this.shoppingcart = FareCardService.getInstance.addFareProduct(this.shoppingcart,
      offering, this.currentWalletLineItem, thisIsCustomOffering);
    this.isCustomAmount = false;
    this.productTotal = 0;
    this.frequentRide();
    this.getSubTotal(this.currentWalletLineItem);
    this.getTotalDue(this.shoppingcart);
    this.getNonFareTotalTax(this.currentWalletLineItem);
  }
  /**
   *get the sub total.
   *
   * @param {*} currentWalletLineItem
   * @memberof AddProductComponent
   */
  getSubTotal(currentWalletLineItem) {
    this.subTotal = ShoppingCartService.getInstance.getSubTotalForCardUID(currentWalletLineItem);
  }

  /**
   * get the total due.
   *
   * @param {*} shoppingCart
   * @memberof AddProductComponent
   */
  getTotalDue(shoppingCart) {
    this.totalDue = ShoppingCartService.getInstance.getGrandTotal(shoppingCart);
    this.checkoutTotal = this.totalDue.toString();
  }

  /**
   * This method will work for display the magnetics subtotal.
   *
   * @param {*} products
   * @param {*} isTotalList
   * @memberof AddProductComponent
   */
  displayMagneticsSubtotal(products: any, isTotalList) {
    let index = 0;
    this.subTotal = 0;
    products.forEach(element => {
      if (isTotalList) {
        this.subTotal = this.subTotal + parseFloat(element.UnitPrice);
      } else {
        if (this.magneticIds[index] == this.currentMagneticIndex) {
          this.subTotal = this.subTotal + parseFloat(element.UnitPrice);
        }
      }
      index++;
    });
    this.subTotal = this.subTotal + parseFloat(this.magneticCardCost);
  }

  /**
   * before navigating to readcard removing result handler listeners and clearing data from local storage.
   *
   * @memberof AddProductComponent
   */
  navigateToDashboard() {
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem('cardsData');
    localStorage.removeItem('readCardData');
    this.electronService.ipcRenderer.removeAllListeners('readCardResult');
    this.electronService.ipcRenderer.removeAllListeners('saveTransactionForMagneticMerchandiseResult');
    this.electronService.ipcRenderer.removeAllListeners('doPinPadTransactionResult');
    this.electronService.ipcRenderer.removeAllListeners('getPinpadTransactionStatusResult');
    this.electronService.ipcRenderer.removeAllListeners('getPinpadTransactionDataResult');
    this.router.navigate(['/home']);
  }

  /**
   * This method will work when you clearing the entered amount
   *
   * @param {*} digit
   * @memberof AddProductComponent
   */
  clearDigit(digit) {
    if (this.isCustomAmount) {
      this.productTotal = '' + digit;
    } else {
      this.checkoutTotal = '' + digit;
    }
  }

  /**
   * when you removing the smartcard from cart this method will show the pop-up.
   *
   * @memberof AddProductComponent
   */
  removeSmartCard() {
    $('#smartCardRemove').modal('show');
  }

  /**
   * when you removing the magnetic card from cart this method will show the pop-up.
   *
   * @memberof AddProductComponent
   */
  removeMagneticCard() {
    $('#magneticCardRemove').modal('show');
  }


  /**
   * check the card is new card or existing card
   *
   * @returns
   * @memberof AddProductComponent
   */
  checkIsCardNew() {
    const flag = Utils.getInstance.isNew(this.carddata[0]);
    return flag;
  }

  checkIsLUCCCardNew() {
    const flag = (this.currentCard.product.product_type == 0 && this.currentCard.product.designator == 0) ? true : false;
  }


  /**
   * when you click on yes button in remove magnetic card pop-up this method will call.
   * calling remove magnetic product confirmation.
   * @memberof AddProductComponent
   */
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
    let index = 0;
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

  /**
   * this method will check for smartcard found in shoppingCart or not.
   *
   * @returns
   * @memberof AddProductComponent
   */
  isSmartCardFound() {
    let isSmartcardFound = false;
    this.shoppingcart._walletLineItem.forEach(element => {
      if (element._walletTypeId == MediaType.SMART_CARD_ID || element._walletTypeId == MediaType.LUCC) {
        isSmartcardFound = true;
      }
      if (!element._isNew && (0 == element._walletContents.length)) {
        isSmartcardFound = false;
      }
    });
    return isSmartcardFound;
  }

  getUserByUserID(userID) {
    let userData = null;
    const userJSON = JSON.parse(localStorage.getItem('shiftReport'));
    for (const user of userJSON) {
      if (user.userID == userID) {
        userData = user;
        break;
      }
    }
    return userData;
  }

  /**
   * Preparing Payment Object
   *
   * @returns
   * @memberof AddProductComponent
   */
  getPaymentsObject() {
    let paymentObj: any;
    const transactionAmount = localStorage.getItem('transactionAmount');
    if (localStorage.getItem('paymentMethodId') == '8') {
      paymentObj = {
        'paymentMethodId': Number(localStorage.getItem('paymentMethodId')),
        'amount': transactionAmount,
        'comment': localStorage.getItem('compReason')
      };
    } else {
      paymentObj = {
        'paymentMethodId': Number(localStorage.getItem('paymentMethodId')),
        'amount': transactionAmount,
        'comment': null
      };
    }
    return paymentObj;
  }

  /**
   * Handling save transaction for magnetic for magnetic result
   * Generating save transaction receipt.
   * @memberof AddProductComponent
   */
  handlesaveTransactionForMagneticMerchandiseResult() {
    var transactionListener: any = this.electronService.ipcRenderer.once('saveTransactionForMagneticMerchandiseResult', (event, data) => {
      if (data != undefined && data != '') {
        const timestamp = new Date().getTime();
        this.cdtaService.generateReceipt(timestamp);
        this._ngZone.run(() => {

          localStorage.removeItem('encodeData');
          localStorage.removeItem('productCardData');
          localStorage.removeItem('cardsData');
          localStorage.removeItem('readCardData');
          this.electronService.ipcRenderer.removeAllListeners('readCardResult');
          this.router.navigate(['/home']);
        });
      } else {

        $('#encodeErrorModal').modal('show');

      }
    });
  }

  /**
   * save transaction for merchendise and magnetic
   *
   * @memberof AddProductComponent
   */
  saveTransactionForMerchandiseAndMagnetic() {
    const userID = localStorage.getItem('userID');
    const transactionObj = TransactionService.getInstance.saveTransaction(this.shoppingcart, this.getUserByUserID(userID));
    localStorage.setItem('transactionObj', JSON.stringify(transactionObj));
    const deviceData = JSON.parse(localStorage.getItem('deviceInfo'));
    const deviceInfo = Utils.getInstance.increseTransactionCountInDeviceInfo(deviceData, transactionObj);
    localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    this.handlesaveTransactionForMagneticMerchandiseResult();
    this.electronService.ipcRenderer.send('savaTransactionForMagneticMerchandise', transactionObj);
  }


  /**
   * will search for smart card if it is found navigating to carddata else
   * saving transaction for merchendise and magnetic
   *
   * @memberof AddProductComponent
   */
  saveTransaction() {
    try {
      this.isCardApplied = false;
      this.isCashApplied = false;
      this.isVoucherApplied = false;
      this.isCheckApplied = false;
      this.isCompApplied = false;
      localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
      if (((this.isSmartCardFound()) && !this.accountBase) || (Utils.getInstance.isFromAccountBasedCard())) {
        this.router.navigate(['/carddata']);
      } else {
        this.saveTransactionForMerchandiseAndMagnetic();
      }
    } catch (e) {
      $('#encodeErrorModal').modal('show');
    }

  }

  proceedToSaveTransaction() {
    if (this.totalRemaining == (+this.checkoutTotal)) {
      this.saveTransaction();
    }
  }

  handlegetPinpadTransactionDataResult() {
    this.electronService.ipcRenderer.once('getPinpadTransactionDataResult', (event, data) => {
      if (data) {
        if (this.isCardPaymentCancelled) {
          return;
        }
        localStorage.setItem('pinPadTransactionData', data);

        if (this.totalRemaining == (+this.checkoutTotal)) {
          const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(9, this.shoppingcart);
          if (indexOfPayment == -1) {
            const payment = new PaymentType();
            payment.$amount = (+this.checkoutTotal);
            payment.$paymentMethodId = 9;
            payment.$comment = null;
            this.shoppingcart._payments.push(payment);
            this.totalRemaining = this.totalRemaining - (+this.checkoutTotal);
            $('#creditCardSuccessModal').modal('show');

          }
          this.openCashDrawer();
          this.getRefundTitle();
          $('#creditCardSuccessModal').modal('hide');
          $('#amountApplyModal').modal({
            backdrop: 'static',
            keyboard: false
          });
        } else {
          this.totalRemaining = +(this.totalRemaining - (+this.checkoutTotal)).toFixed(2);
          this.cardAppliedTotal = this.checkoutTotal;
          const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(9, this.shoppingcart);
          if (indexOfPayment == -1) {
            const payment = new PaymentType();
            payment.$amount = (+this.checkoutTotal);
            payment.$paymentMethodId = 9;
            payment.$comment = null;
            this.shoppingcart._payments.push(payment);
            this.isCardApplied = true;
            this.checkoutTotal = '0';
            $('#creditCardSuccessModal').modal('show');

          } else {
            this.shoppingcart._payments[indexOfPayment].amount += (+this.checkoutTotal);
            this.cardAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
            this.isCardApplied = true;
            $('#creditCardSuccessModal').modal('show');

          }
        }
      } else {
        $('#creditCardFailureModal').modal('show');
      }
    });
  }

  handlegetPinpadTransactionStatusResult() {
    this.electronService.ipcRenderer.once('getPinpadTransactionStatusResult', (event, data) => {
      if (data != undefined && data != '') {
        if (this.isCardPaymentCancelled) {
          return;
        }
        if (data == 0 && this.numOfAttempts < 600) {
          var timer = setTimeout(() => {
            this.numOfAttempts++;
            this.handlegetPinpadTransactionStatusResult();
            this.electronService.ipcRenderer.send('getPinpadTransactionStatus');
          }, 1000);
        } else {
          if (data != 1) {
            $('#creditCardApplyModal').modal('hide');
            $('#creditCardFailureModal').modal('show');
            return;
          }
          clearTimeout(timer);
          $('#creditCardApplyModal').modal('hide');
          this.handlegetPinpadTransactionDataResult();
          this.electronService.ipcRenderer.send('getPinpadTransactionData');
        }
      }
    });
  }

  handleDoPinPadTransactionResult() {
    var doPinPadTransactionResultListener: any = this.electronService.ipcRenderer.once('doPinPadTransactionResult', (event, data) => {
      if (data != undefined && data != '') {
        if (this.isCardPaymentCancelled) {
          return;
        }
        this.handlegetPinpadTransactionStatusResult();
        this.electronService.ipcRenderer.send('getPinpadTransactionStatus');
      }
    });
  }

  /**
   * This method will try to connect the credit card machine and doing transaction through credit card.
   *
   * @memberof AddProductComponent
   */
  doPinPadTransaction() {
    this.numOfAttempts = 0;
    this.isCardPaymentCancelled = false;
    $('#creditCardModal').modal('hide');
    $('#creditCardApplyModal').modal('show');
    this.handleDoPinPadTransactionResult();
    this.electronService.ipcRenderer.send('doPinPadTransaction', (+this.checkoutTotal * 100));
  }

  handleCancelPinPadTransaction() {
    this.electronService.ipcRenderer.once('cancelPinpadTransactionResult', (event, data) => {
      this.isCardPaymentCancelled = true;
      $('#creditCardApplyModal').modal('hide');
    });
  }

  handleOpenCashDrawerResult() {
    this.electronService.ipcRenderer.once('openCashDrawerResult', (event, data) => {
      if (data != undefined && data != '') {
        if (data) {
          console.log('cash drawer opened Sucessfully');
        } else {
          console.log('cash drawer open Failed');
        }
      }
    });
  }
  handleChargeStoredValue() {
    this.electronService.ipcRenderer.once('chargeStoredValueResult', (event, data, card_id) => {
      if (data != undefined && data != '') {
        if (data) {
          console.log('chargeStoredValue success');
          this.card_id = card_id;
          if (this.totalDue == (+this.checkoutTotal)) {
            this.onlyPayAsYouGoApplied = true
            this.isPayAsYouGoApplied = true;
            this.totalRemaining = +(this.totalRemaining - (+this.checkoutTotal)).toFixed(2);
            this.payAsYouGoAppliedTotal = (+this.checkoutTotal);
            this.payAsYouGoRemaining = this.totalRemaining;
            const payment = new PaymentType();
            payment.$paymentMethodId = 12;
            payment.$amount = (+this.checkoutTotal);
            payment.$comment = null;
            if (Utils.getInstance.checkIsPaymentMethodExists(12, this.shoppingcart) == -1) {
              this.shoppingcart._payments.push(payment);
            }
            this.isPayAsYouGoApplied = true;
          } else {
            this.isPayAsYouGoApplied = true;
            this.totalRemaining = this.totalRemaining - (+this.checkoutTotal);
            this.payAsYouGoRemaining = this.totalRemaining;
            const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(12, this.shoppingcart);
            if (indexOfPayment == -1) {
              const payment = new PaymentType();
              payment.$amount = (+this.checkoutTotal);
              payment.$paymentMethodId = 12;
              payment.$comment = null;
              this.shoppingcart._payments.push(payment);
              console.log(this.shoppingcart._payments);
              this.payAsYouGoAppliedTotal = payment.$amount;
              this.isPayAsYouGoApplied = true;
              this.checkoutTotal = '0';
            } else {
              this.shoppingcart._payments[indexOfPayment].amount += this.checkoutTotal;
              this.payAsYouGoAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
              console.log(this.shoppingcart._payments);
              this.isPayAsYouGoApplied = true;
              this.checkoutTotal = '0';
            }
          }
          if (this.payAsYouGoRemaining !== 0) {
            $('#payAsYouGoModal').modal('hide');
            $('#successPayAsYouGo').modal({
              backdrop: 'static',
              keyboard: false
            });
          } else if (this.payAsYouGoRemaining == 0) {
            this.getRefundTitle();
            $('#successPayAsYouGo').modal({
              backdrop: 'static',
              keyboard: false
            });
            // this.filerterIsOnlyPayAsYouGo(this.onlyPayAsYouGoApplied);
          }
        } else {
          $('#unablePayAsYouGo').modal('hide');
        }
      }
    });
  }

  filerterIsOnlyPayAsYouGo() {
    if (this.onlyPayAsYouGoApplied == true) {
      this.amountApplied();
    } else if (this.payAsYouGoRemaining == 0) {
      $('#amountApplyModal').modal({
        backdrop: 'static',
        keyboard: false
      });
    }
  }
  /**
   *After payment to open cash drawer
   *
   * @memberof AddProductComponent
   */
  openCashDrawer() {
    this.electronService.ipcRenderer.send('openCashDrawer');
  }

  cancelPinPadTransaction() {
    this.handleCancelPinPadTransaction();
    this.electronService.ipcRenderer.send('cancelPinpadTransaction');
  }

  /**
   * Format two dimentional array to fit carousel slider for walletline items.
   *
   * @param {*} list
   * @param {*} howMany
   * @returns
   * @memberof AddProductComponent
   */
  formatWatlletItems(list, howMany) {
    let idx = 0;
    const result = [];

    while (idx < list.length) {
      if (idx % howMany === 0) {
        result.push([]);
      }
      result[result.length - 1].push(list[idx++]);
    }
    return result;
  }

  /**
   * Format two dimentional array to fit carousel slider for products.
   *
   * @param {*} list
   * @param {*} howMany
   * @returns
   * @memberof AddProductComponent
   */
  formatWatlletContents(list, howMany) {
    let idx = 0;
    const result = [];

    while (idx < list.length) {
      if (idx % howMany === 0) {
        result.push([]);
      }
      result[result.length - 1].push(list[idx++]);
    }
    return result;
  }

  /**
   * calling this method for payment through cash
   *
   * @memberof AddProductComponent
   */
  paymentByCash() {
    if (+this.checkoutTotal == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == +(this.checkoutTotal)) {
      this.cashBack = 0;
      this.isVoucherApplied = false;
      this.isCheckApplied = false;
      this.isExistingFareCardApplied = false;
      this.isPayAsYouGoApplied = false;
      this.handleOpenCashDrawerResult();
      this.openCashDrawer();
      const payment = new PaymentType();
      payment.$paymentMethodId = 2;
      payment.$amount = (+this.checkoutTotal) - this.cashBack;
      payment.$comment = null;
      payment.$cashback = this.cashBack;
      this.cashAppliedTotal = payment.$amount;
      this.isCashApplied = true;
      this.isCashBack = true;
      if (Utils.getInstance.checkIsPaymentMethodExists(2, this.shoppingcart) == -1) {
        this.shoppingcart._payments.push(payment);
        this.totalRemaining = this.totalRemaining - (+this.checkoutTotal);
      }
      this.getRefundTitle();
      $('#amountApplyModal').modal({
        backdrop: 'static',
        keyboard: false
      });

    } else if (this.totalRemaining > +this.checkoutTotal) {

      if (this.isVoucherApplied) {
        this.isVoucherApplied = true;
      } else {
        this.isVoucherApplied = false;

      }
      if (this.isPayAsYouGoApplied) {
        this.isPayAsYouGoApplied = true;
      } else {
        this.isPayAsYouGoApplied = false;
      }

      if (this.isExistingFareCardApplied) {
        this.isExistingFareCardApplied = true;
      } else {
        this.isExistingFareCardApplied = false;

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
        this.isCardApplied = true;
      } else {
        this.isCardApplied = false;
      }

      if ((this.isCheckApplied && this.isVoucherApplied) || (this.isVoucherApplied && this.isCompApplied) ||
        (this.isCheckApplied && this.isCompApplied) || (this.isVoucherApplied && this.isCardApplied) ||
        (this.isCheckApplied && this.isCardApplied) || (this.isCompApplied && this.isCardApplied) ||
        (this.isCardApplied && this.isExistingFareCardApplied) || (this.isVoucherApplied && this.isExistingFareCardApplied) ||
        (this.isCompApplied && this.isExistingFareCardApplied) || (this.checkApplied && this.isExistingFareCardApplied) ||
        (this.isCardApplied && this.isPayAsYouGoApplied) || (this.isVoucherApplied && this.isPayAsYouGoApplied) ||
        (this.isCompApplied && this.isPayAsYouGoApplied) || (this.checkApplied && this.isPayAsYouGoApplied) ||
        (this.isExistingFareCardApplied && this.isPayAsYouGoApplied)) {

        $('#thirdPaymentModal').modal('show');
      } else {
        this.totalRemaining = +(this.totalRemaining - (+this.checkoutTotal)).toFixed(2);
        const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(2, this.shoppingcart);
        if (indexOfPayment == -1) {
          const payment = new PaymentType();
          payment.$amount = (+this.checkoutTotal) - this.cashBack;
          payment.$paymentMethodId = 2;
          payment.$comment = null;
          payment.$cashback = this.cashBack;
          this.shoppingcart._payments.push(payment);
          this.cashAppliedTotal = payment.$amount;
          this.isCashApplied = true;
          this.isCashBack = true;
          this.cancelCheckoutcash = true;
          this.checkoutTotal = '0';
        } else {
          this.shoppingcart._payments[indexOfPayment].amount += (+this.checkoutTotal);
          this.cashAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
          this.isCashApplied = true;
          this.cancelCheckoutcash = true;
          this.checkoutTotal = '0';
        }

      }
    } else if (this.totalRemaining < (+this.checkoutTotal)) {
      this.isCashApplied = true;
      this.isCashBack = true;
      this.cashAppliedTotal = this.checkoutTotal;
      this.cashBack = (+this.checkoutTotal) - this.totalRemaining;
      this.handleOpenCashDrawerResult();
      this.openCashDrawer();
      const payment = new PaymentType();
      payment.$paymentMethodId = 2;
      payment.$amount = (+this.checkoutTotal) - this.cashBack;
      payment.$comment = null;
      payment.$cashback = this.cashBack;
      this.cashAppliedTotal = payment.$amount;
      const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(2, this.shoppingcart);
      if (indexOfPayment == -1) {
        this.shoppingcart._payments.push(payment);
      } else {
        this.shoppingcart._payments[indexOfPayment].amount += (+this.checkoutTotal);
        this.shoppingcart._payments[indexOfPayment].cashback = this.cashBack;
      }
      this.getRefundTitle();
      $('#amountApplyModal').modal({
        backdrop: 'static',
        keyboard: false
      });
    }
  }


  /**
   * This method is used to pay through Existing Card
   */
  applyExistingCard() {
    if (+this.checkoutTotal == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == +(this.checkoutTotal)) {
      this.openCashDrawer();
      $('#existingFareCardModal').modal('show');

    } else if (this.totalRemaining > +this.checkoutTotal) {

      if (this.isVoucherApplied) {
        this.isVoucherApplied = true;
      } else {
        this.isVoucherApplied = false;

      }

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
        this.isCardApplied = true;
      } else {
        this.isCardApplied = false;
      }
      if (this.isPayAsYouGoApplied) {
        this.isPayAsYouGoApplied = true;
      } else {
        this.isPayAsYouGoApplied = false;
      }
      if ((this.isCheckApplied && this.isVoucherApplied) || (this.isVoucherApplied && this.isCompApplied) ||
        (this.isCheckApplied && this.isCompApplied) || (this.isVoucherApplied && this.isCardApplied) ||
        (this.isCheckApplied && this.isCardApplied) || (this.isCompApplied && this.isCardApplied) ||
        (this.isCheckApplied && this.isPayAsYouGoApplied) || (this.isVoucherApplied && this.isPayAsYouGoApplied) ||
        (this.isCompApplied && this.isPayAsYouGoApplied) || (this.isCardApplied && this.isPayAsYouGoApplied) ||
        (this.isCheckApplied && this.isCashApplied) || (this.isVoucherApplied && this.isCashApplied) ||
        (this.isCompApplied && this.isCashApplied) || (this.isCardApplied && this.isCashApplied) ||
        (this.isCashApplied && this.isPayAsYouGoApplied)) {
        $('#thirdPaymentModal').modal('show');
      } else {
        $('#existingFareCardModal').modal('show');

      }
    } else if (this.totalRemaining < (+this.checkoutTotal)) {
      $('#voucherErrorModal').modal('show');
    }
  }

  existingFareCardModalApply() {
    if (this.totalDue == (+this.checkoutTotal)) {
      this.totalRemaining = +(this.totalRemaining - (+this.checkoutTotal)).toFixed(2);
      this.ExistingFareCardAppliedTotal = (+this.checkoutTotal);
      this.existingCardRemaining = this.totalRemaining;
      const payment = new PaymentType();
      payment.$paymentMethodId = 10;
      payment.$amount = (+this.checkoutTotal);
      payment.$comment = null;
      if (Utils.getInstance.checkIsPaymentMethodExists(10, this.shoppingcart) == -1) {
        this.shoppingcart._payments.push(payment);

      }
      this.isExistingFareCardApplied = true;

    } else {
      this.totalRemaining = this.totalRemaining - (+this.checkoutTotal);
      this.existingCardRemaining = this.totalRemaining;
      const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(10, this.shoppingcart);
      if (indexOfPayment == -1) {
        const payment = new PaymentType();
        payment.$amount = (+this.checkoutTotal);
        payment.$paymentMethodId = 10;
        payment.$comment = null;
        this.shoppingcart._payments.push(payment);
        console.log(this.shoppingcart._payments);
        this.ExistingFareCardAppliedTotal = payment.$amount;
        this.isExistingFareCardApplied = true;
        this.checkoutTotal = '0';
      } else {
        this.shoppingcart._payments[indexOfPayment].amount += this.checkoutTotal;
        this.ExistingFareCardAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
        console.log(this.shoppingcart._payments);
        this.isExistingFareCardApplied = true;
        this.checkoutTotal = '0';
      }

    }
    if (this.existingCardRemaining !== 0) {
      $('#applyFareCardModal').modal('hide');
    } else if (this.existingCardRemaining == 0) {
      this.getRefundTitle();
      $('#amountApplyModal').modal({
        backdrop: 'static',
        keyboard: false
      });
    }
    // $('#voucherApplyModal').modal('show');
  }


  applyPayAsYouGo() {
    if (+this.checkoutTotal == 0) {
      $('#invalidAmountModal').modal('show');
    } else if (this.payAsYouGoAppliedTotal != 0) {
      $('#limitOncePaymentModal').modal('show');
    }
    else if (this.totalRemaining == +(this.checkoutTotal)) {
      this.openCashDrawer();
      $('#payAsYouGoModal').modal('show');
    } else if (this.totalRemaining > +this.checkoutTotal) {

      if (this.isVoucherApplied) {
        this.isVoucherApplied = true;
      } else {
        this.isVoucherApplied = false;

      }

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
        this.isCardApplied = true;
      } else {
        this.isCardApplied = false;
      }

      if (this.isExistingFareCardApplied) {
        this.isExistingFareCardApplied = true;
      } else {
        this.isExistingFareCardApplied = false;
      }

      if ((this.isCheckApplied && this.isVoucherApplied) || (this.isVoucherApplied && this.isCompApplied) ||
        (this.isCheckApplied && this.isCompApplied) || (this.isVoucherApplied && this.isCardApplied) ||
        (this.isCheckApplied && this.isCardApplied) || (this.isCompApplied && this.isCardApplied) ||
        (this.isCashApplied && this.isExistingFareCardApplied) || (this.isCheckApplied && this.isExistingFareCardApplied) ||
        (this.isVoucherApplied && this.isExistingFareCardApplied) || (this.isCompApplied && this.isExistingFareCardApplied) ||
        (this.isCardApplied && this.isExistingFareCardApplied) || (this.isCheckApplied && this.isCashApplied) ||
        (this.isVoucherApplied && this.isCashApplied) || (this.isCompApplied && this.isCashApplied) ||
        (this.isCardApplied && this.isCashApplied)) {
        $('#thirdPaymentModal').modal('show');
      } else {
        $('#payAsYouGoModal').modal('show');

      }
    } else if (this.totalRemaining < (+this.checkoutTotal)) {
      $('#voucherErrorModal').modal('show');
    }
  }

  payAsYouGoModalApply() {
    this.handleReadCardForPayAsYouGo();
    // this.isPayAsYouGoApplied = true;
    // this.isfromAddProduct = true;
    this.electronService.ipcRenderer.send('readCardForPayAsYouGo', CardService.getInstance.getCardName());
  }
  /**
   * checking hte credit card is applied or not.
   *
   * @memberof AddProductComponent
   */

  checkIfCreditCardApplied() {
    if (this.isCardApplied) {
      this.doPinPadTransaction();
    } else {
      this.saveTransaction();
    }
  }

  doSaveTransaction() {
    this.saveTransaction();
  }


  /**
   * Payment through voucher
   *
   * @memberof AddProductComponent
   */
  paymentByVoucher() {
    if (+this.checkoutTotal == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == (+this.checkoutTotal)) {
      this.openCashDrawer();
      $('#voucherModal').modal('show');
    } else if (this.totalRemaining > (+this.checkoutTotal)) {
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
      if (this.isPayAsYouGoApplied) {
        this.isPayAsYouGoApplied = true;
      } else {
        this.isPayAsYouGoApplied = false;
      }
      if (this.isExistingFareCardApplied) {
        this.isExistingFareCardApplied = true;
      } else {
        this.isExistingFareCardApplied = false;
      }

      if (this.isCompApplied) {
        this.isCompApplied = true;
      } else {
        this.isCompApplied = false;
      }

      if (this.isCardApplied) {
        this.isCardApplied = true;
      } else {
        this.isCardApplied = false;
      }


      if ((this.isCashApplied && this.isCheckApplied) || (this.isCheckApplied && this.isCompApplied) ||
        (this.isCashApplied && this.isCompApplied) || (this.isCardApplied && this.isCompApplied) ||
        (this.isCardApplied && this.isCashApplied) || (this.isCardApplied && this.isCheckApplied) ||
        (this.isCashApplied && this.isExistingFareCardApplied) || (this.isCardApplied && this.isExistingFareCardApplied) ||
        (this.isCheckApplied && this.isExistingFareCardApplied) || (this.isCompApplied && this.isExistingFareCardApplied) ||
        (this.isCashApplied && this.isPayAsYouGoApplied) || (this.isCardApplied && this.isPayAsYouGoApplied) ||
        (this.isCheckApplied && this.isPayAsYouGoApplied) || (this.isCompApplied && this.isPayAsYouGoApplied) ||
        (this.isExistingFareCardApplied && this.isPayAsYouGoApplied)) {

        $('#thirdPaymentModal').modal('show');
      } else {
        this.openCashDrawer();
        $('#voucherModal').modal('show');

      }

    } else if (this.totalRemaining < (+this.checkoutTotal)) {
      $('#voucherErrorModal').modal('show');
    }


  }

  voucherModalApply() {
    if (this.totalDue == (+this.checkoutTotal)) {
      this.totalRemaining = +(this.totalRemaining - (+this.checkoutTotal)).toFixed(2);
      this.voucherAppliedTotal = (+this.checkoutTotal);
      this.voucherRemaining = this.totalRemaining;
      const payment = new PaymentType();
      payment.$paymentMethodId = 11;
      payment.$amount = (+this.checkoutTotal);
      payment.$comment = null;
      if (Utils.getInstance.checkIsPaymentMethodExists(11, this.shoppingcart) == -1) {
        this.shoppingcart._payments.push(payment);

      }
      this.isVoucherApplied = true;

    } else {
      this.totalRemaining = this.totalRemaining - (+this.checkoutTotal);
      this.voucherRemaining = this.totalRemaining;
      const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(11, this.shoppingcart);
      if (indexOfPayment == -1) {
        const payment = new PaymentType();
        payment.$amount = (+this.checkoutTotal);
        payment.$paymentMethodId = 11;
        payment.$comment = null;
        this.shoppingcart._payments.push(payment);
        this.voucherAppliedTotal = payment.$amount;
        this.isVoucherApplied = true;
        this.checkoutTotal = '0';
      } else {
        this.shoppingcart._payments[indexOfPayment].amount += this.checkoutTotal;
        this.voucherAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
        this.isVoucherApplied = true;
        this.checkoutTotal = '0';
      }

    }
    if (this.voucherRemaining !== 0) {
      $('#voucherApplyModal').modal('hide');
    } else if (this.voucherRemaining == 0) {
      this.getRefundTitle();
      $('#amountApplyModal').modal({
        backdrop: 'static',
        keyboard: false
      });
    }

  }

  vocherPayment() {
    this.doSaveTransaction();
  }

  notToApplyvoucher() {
    if (this.isVoucherApplied) {
      this.isVoucherApplied = true;
    } else {
      this.isVoucherApplied = false;
    }

  }


  notToApplyExistingFareCard() {
    if (this.isExistingFareCardApplied) {
      this.isExistingFareCardApplied = true;
    } else {
      this.isExistingFareCardApplied = false;
    }

  }


  /**
   * when you are doing payment through check
   *
   * @memberof AddProductComponent
   */

  paymentByCheck() {
    if ((+this.checkoutTotal) == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == (+this.checkoutTotal)) {
      const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(3, this.shoppingcart);
      if (indexOfPayment == -1) {
        const payment = new PaymentType();
        payment.$amount = (+this.checkoutTotal);
        payment.$paymentMethodId = 3;
        payment.$comment = null;
        this.shoppingcart._payments.push(payment);
        this.checkAppliedTotal = payment.$amount;
        this.isCheckApplied = true;
        this.totalRemaining = this.totalRemaining - (+this.checkoutTotal);
      } else {
        this.shoppingcart._payments[indexOfPayment].amount += (+this.checkoutTotal);
        this.checkAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
        this.isCheckApplied = true;
      }

      this.openCashDrawer();
      this.getRefundTitle();
      $('#amountApplyModal').modal({
        backdrop: 'static',
        keyboard: false
      });
    } else if (this.totalRemaining > (+this.checkoutTotal)) {
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
      if (this.isPayAsYouGoApplied) {
        this.isPayAsYouGoApplied = true;
      } else {
        this.isPayAsYouGoApplied = false;
      }
      if (this.isExistingFareCardApplied) {
        this.isExistingFareCardApplied = true;
      } else {
        this.isExistingFareCardApplied = false;
      }

      if (this.isCompApplied) {
        this.isCompApplied = true;
      } else {
        this.isCompApplied = false;
      }

      if (this.isCardApplied) {
        this.isCardApplied = true;
      } else {
        this.isCardApplied = false;
      }


      if ((this.isCashApplied && this.isVoucherApplied) || (this.isVoucherApplied && this.isCompApplied) ||
        (this.isCashApplied && this.isCompApplied) || (this.isCardApplied && this.isVoucherApplied) ||
        (this.isCardApplied && this.isCompApplied) || (this.isCashApplied && this.isCardApplied) ||
        (this.isExistingFareCardApplied && this.isVoucherApplied) || (this.isCashApplied && this.isExistingFareCardApplied) ||
        (this.isCompApplied && this.isExistingFareCardApplied) || (this.isExistingFareCardApplied && this.isCardApplied) ||
        (this.isPayAsYouGoApplied && this.isVoucherApplied) || (this.isCashApplied && this.isPayAsYouGoApplied) ||
        (this.isCompApplied && this.isPayAsYouGoApplied) || (this.isPayAsYouGoApplied && this.isCardApplied) ||
        (this.isExistingFareCardApplied && this.isPayAsYouGoApplied)) {

        $('#thirdPaymentModal').modal('show');
      } else {
        this.totalRemaining = +(this.totalRemaining - (+this.checkoutTotal)).toFixed(2);
        const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(3, this.shoppingcart);
        if (indexOfPayment == -1) {
          const payment = new PaymentType();
          payment.$amount = (+this.checkoutTotal);
          payment.$paymentMethodId = 3;
          payment.$comment = null;
          this.shoppingcart._payments.push(payment);
          this.checkAppliedTotal = payment.$amount;
          this.isCheckApplied = true;
          this.checkoutTotal = '0';
        } else {
          this.shoppingcart._payments[indexOfPayment].amount += (+this.checkoutTotal);
          this.checkAppliedTotal = this.shoppingcart._payments[indexOfPayment].amount;
          this.isCheckApplied = true;
          this.checkoutTotal = '0';
        }

      }

    } else if (this.totalRemaining < (+this.checkoutTotal)) {
      $('#voucherErrorModal').modal('show');
    }
  }

  checkApplied() {
    const payment = new PaymentType();
    payment.$paymentMethodId = 3;
    payment.$amount = (+this.checkoutTotal);
    payment.$comment = null;
    if (Utils.getInstance.checkIsPaymentMethodExists(3, this.shoppingcart) == -1) {
      this.shoppingcart._payments.push(payment);
    }
    this.doSaveTransaction();
  }

  amountApplied() {
    this.doSaveTransaction();
  }

  fareCardApplied() {
    this.doSaveTransaction();
  }

  compApplied() {
    if ((+this.checkoutTotal) == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == (+this.checkoutTotal)) {
      $('#compModal').modal('show');
    } else if (this.totalRemaining > (+this.checkoutTotal)) {
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

      if (this.isExistingFareCardApplied) {
        this.isExistingFareCardApplied = true;
      } else {
        this.isExistingFareCardApplied = false;
      }
      if (this.isPayAsYouGoApplied) {
        this.isPayAsYouGoApplied = true;
      } else {
        this.isPayAsYouGoApplied = false;
      }
      if (this.isCheckApplied) {
        this.isCheckApplied = true;
      } else {
        this.isCheckApplied = false;
      }

      if (this.isCardApplied) {
        this.isCardApplied = true;
      } else {
        this.isCardApplied = false;
      }


      if ((this.isVoucherApplied && this.isCheckApplied) || (this.isCashApplied && this.isCheckApplied) ||
        (this.isCashApplied && this.isVoucherApplied) || (this.isCardApplied && this.isVoucherApplied) ||
        (this.isCardApplied && this.isCheckApplied) || (this.isCashApplied && this.isCardApplied) ||
        (this.isCardApplied && this.isExistingFareCardApplied) || (this.isCashApplied && this.isExistingFareCardApplied) ||
        (this.isVoucherApplied && this.isExistingFareCardApplied) || (this.isCheckApplied && this.isExistingFareCardApplied) ||
        (this.isCardApplied && this.isPayAsYouGoApplied) || (this.isCashApplied && this.isPayAsYouGoApplied) ||
        (this.isVoucherApplied && this.isPayAsYouGoApplied) || (this.isCheckApplied && this.isPayAsYouGoApplied) ||
        (this.isExistingFareCardApplied && this.isPayAsYouGoApplied)) {

        $('#thirdPaymentModal').modal('show');
      } else {
        $('#compModal').modal('show');
      }
    } else if (this.totalRemaining < (+this.checkoutTotal)) {
      $('#voucherErrorModal').modal('show');
    }


  }

  compApplication() {
    this.applyCompShow = true;
  }

  compensation() {
    if (this.totalRemaining == (+this.checkoutTotal)) {
      const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(8, this.shoppingcart);
      if (indexOfPayment == -1) {
        const payment = new PaymentType();
        payment.$amount = (+this.checkoutTotal);
        payment.$paymentMethodId = 8;
        payment.$comment = this.reasonForComp;
        this.shoppingcart._payments.push(payment);
      }
      this.electronService.ipcRenderer.send('compensation');
      this.applyCompShow = false;
      this.doSaveTransaction();
    } else if (this.totalRemaining > (+this.checkoutTotal)) {
      this.totalRemaining = +(this.totalRemaining - (+this.checkoutTotal)).toFixed(2);
      this.compDue = this.totalRemaining;
      const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(8, this.shoppingcart);
      if (indexOfPayment == -1) {
        const payment = new PaymentType();
        payment.$amount = (+this.checkoutTotal);
        payment.$paymentMethodId = 8;
        payment.$comment = this.reasonForComp;
        this.shoppingcart._payments.push(payment);
        this.isCompApplied = true;
        this.applyCompShow = false;
        this.checkoutTotal = '0';
      } else {
        this.shoppingcart._payments[indexOfPayment].amount += (+this.checkoutTotal);
        this.isCompApplied = true;
        this.applyCompShow = false;
        this.checkoutTotal = '0';
      }

    }

  }

  cancelCompensation() {
    this.applyCompShow = false;
    this.reason = true;
  }

  compensationReason(value) {
    if (this.reason == true && value == 'OTHERS') {
      this.reason = false;
      this.reasonForComp = '';
    }
  }

  cardApplied() {
    if (this.isCardApplied) {
      $('#creditCardDuplicateModal').modal('show');
      return;
    }
    if ((+this.checkoutTotal) == 0) {

      $('#invalidAmountModal').modal('show');

    } else if (this.totalRemaining == (+this.checkoutTotal)) {
      $('#creditCardModal').modal('show');
      this.doPinPadTransaction();
    } else if (this.totalRemaining > (+this.checkoutTotal)) {
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

      if (this.isExistingFareCardApplied) {
        this.isExistingFareCardApplied = true;
      } else {
        this.isExistingFareCardApplied = false;
      }
      if (this.isPayAsYouGoApplied) {
        this.isPayAsYouGoApplied = true;
      } else {
        this.isPayAsYouGoApplied = false;
      }
      if (this.isCompApplied) {
        this.isCompApplied = true;
      } else {
        this.isCompApplied = false;
      }

      if (this.isCheckApplied) {
        this.isCheckApplied = true;
      } else {
        this.isCheckApplied = false;
      }

      if ((this.isCashApplied && this.isCheckApplied) || (this.isCheckApplied && this.isVoucherApplied) ||
        (this.isCompApplied && this.isVoucherApplied) || (this.isCashApplied && this.isCompApplied) ||
        (this.isCashApplied && this.isVoucherApplied) || (this.isCheckApplied && this.isCompApplied) ||
        (this.isCheckApplied && this.isExistingFareCardApplied) || (this.isCashApplied && this.isExistingFareCardApplied) ||
        (this.isCompApplied && this.isExistingFareCardApplied) || (this.isVoucherApplied && this.isExistingFareCardApplied) ||
        (this.isCheckApplied && this.isPayAsYouGoApplied) || (this.isCashApplied && this.isPayAsYouGoApplied) ||
        (this.isCompApplied && this.isPayAsYouGoApplied) || (this.isVoucherApplied && this.isPayAsYouGoApplied) ||
        (this.isExistingFareCardApplied && this.isPayAsYouGoApplied)) {

        $('#thirdPaymentModal').modal('show');
      } else {

        $('#creditCardModal').modal('show');
        this.doPinPadTransaction();
      }
    } else if (this.totalRemaining < (+this.checkoutTotal)) {
      $('#voucherErrorModal').modal('show');
    }
  }

  /**
   * carousel swipe for top left wallet items
   *
   * @param {*} eType
   * @param {*} k
   * @memberof AddProductComponent
   */
  swipe(eType, k) {
    this.currentWalletLineItemIndex = k;
    if (eType === this.SWIPE_ACTION.LEFT && k < this.walletItems.length - 1) {
      this.currentWalletLineItemIndex++;
    } else if (eType === this.SWIPE_ACTION.RIGHT && k > 0) {
      this.currentWalletLineItemIndex--;
    }
  }
  /**
   * carousel swipe for products
   *
   * @param {*} eType
   * @param {*} k
   * @memberof AddProductComponent
   */
  productSwipe(eType, k) {
    this.currentWalletLineProduct = k;
    if (eType === this.SWIPE_ACTION.LEFT && k < this.walletItemContents.length - 1) {
      this.currentWalletLineProduct++;
    } else if (eType === this.SWIPE_ACTION.RIGHT && k > 0) {
      this.currentWalletLineProduct--;
    }
  }
  /**
   * carosel swipe for merchendise products
   *
   * @param {*} eType
   * @param {*} k
   * @memberof AddProductComponent
   */
  productMerchSwipe(eType, k) {
    this.currentWalletMerchProduct = k;
    if (eType === this.SWIPE_ACTION.LEFT && k < this.walletItemContents.length - 1) {
      this.currentWalletMerchProduct++;
    } else if (eType === this.SWIPE_ACTION.RIGHT && k > 0) {
      this.currentWalletMerchProduct--;
    }
  }
  walletItemsIndicator(i) {
    this.currentWalletLineItemIndex = i;
  }

  walletLineProductIndicator(i) {
    this.currentWalletLineProduct = i;
  }

  walletLineMerchProductIndicator(i) {
    this.currentWalletMerchProduct = i;
  }

  /**
   * when transaction applied this method calls a pop-up showing which transactions are applied by customer.
   *
   * @memberof AddProductComponent
   */
  getRefundTitle() {
    let count = 0;
    let commaFlag = false;
    this.message = ' ';
    this.title = '';
    let payments = [];
    payments = this.shoppingcart._payments;
    const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(8, this.shoppingcart);
    if (-1 != indexOfPayment) {
      payments.splice(indexOfPayment, 1);
    }

    if (payments.length > 2) {
      commaFlag = true;
    }
    payments.forEach(element => {

      if (payments.length != 0 && (0 != payments.length - 1) && (count == payments.length - 1)) {
        this.title = this.title + ' and ';
        this.message = this.message + ' and ';

        commaFlag = false;
      }
      if (count != 0 && commaFlag) {
        this.title = this.title + ', ';
      }
      switch (element.paymentMethodId) {

        case 2:
          this.title = this.title + 'Cash';
          this.message = this.message + 'Return change to customer.';
          break;

        case 3:
          this.title = this.title + 'Check';
          this.message = this.message + 'Place the check in the drawer.';
          break;

        case 11:
          this.title = this.title + 'Voucher';
          this.message = this.message + 'Place the voucher in the drawer.';
          break;

        case 9:
          this.title = this.title + 'Credit';
          this.message = this.message + 'Credit Applied.';
          break;
        case 10:
          this.title = this.title + 'Fare_card';
          this.message = this.message + 'Place the Fare_card in the drawer.';
          break;
        case 12:
          this.title = this.title + 'Pay_as_you_go';
          this.message = this.message + 'Pay As You Go Applied.';
          break;

        default:
          this.message = '';
          this.title = '';
      }

      count++;

    });

  }

  /**
   * when we click on cancel checkout this method calls a popup showing which transaction customer applied.
   *
   * @memberof AddProductComponent
   */
  getRefundCancelCheckoutTitle() {
    let count = 0;
    let commaFlag = false;
    this.message = 'Please give the customer back  ';
    this.title = 'Return ';
    let payments = [];
    payments = this.shoppingcart._payments;
    const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(8, this.shoppingcart);
    if (-1 != indexOfPayment) {
      payments.splice(indexOfPayment, 1);
    }
    if (payments.length > 2) {
      commaFlag = true;
    }
    payments.forEach(element => {
      if (payments.length != 0 && (0 != payments.length - 1) && (count == payments.length - 1)) {
        this.title = this.title + ' and ';
        this.message = this.message + ' and ';

        commaFlag = false;
      }
      if (count != 0 && commaFlag) {
        this.title = this.title + ', ';
        this.message = this.message + ', ';
      }
      switch (element.paymentMethodId) {
        case 2:
          this.title = this.title + 'Cash';
          this.message = this.message + 'cash';
          break;

        case 3:
          this.title = this.title + 'Check';
          this.message = this.message + 'check';
          break;

        case 11:
          this.title = this.title + 'Voucher';
          this.message = this.message + 'voucher';
          break;

        case 9:
          this.title = this.title + 'Credit';
          this.message = this.message + 'credit';
          break;

        case 12:
          this.title = this.title + 'Pay As You Go';
          this.message = this.message + 'pay as you go';
          break;

        default:
          this.message = 'Please give the customer back ';
      }
      count++;
    });

  }
  /**
   * calculating tax for merchandise prodcuts
   *
   * @param {*} currentWalletLineItem
   * @memberof AddProductComponent
   */
  getNonFareTotalTax(currentWalletLineItem) {
    this.taxTotal = ShoppingCartService.getInstance.getNonFareTotalTax(currentWalletLineItem);
  }
}

