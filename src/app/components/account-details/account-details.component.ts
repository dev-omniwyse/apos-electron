import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { FareCardService } from 'src/app/services/Farecard.service';
import { Utils } from 'src/app/services/Utils.service';
import { SysytemConfig } from 'src/app/config';
import { ShoppingCartService } from 'src/app/services/ShoppingCart.service';
import { CardService } from 'src/app/services/Card.service';



declare var $: any;

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent implements OnInit {
  public isShowCardOptions: Boolean = true;
  accountDetails: any = [];
  accountDescription = ['Account Status', 'Account Balance', 'Active Cards'];
  public carddata: any = [];
  public cardType: any = '';
  terminalConfigJson: any = [];
  shoppingcart: any;
  cardContents = [];
  public catalogData = [];
  active_wallet_status: string;
  ticketMap = new Map();
  public readCardData = [];
  newCardData: any;
  public errorMessage: String = 'Cannot find encoder:';
  disableaddFund: Boolean = false;
  selectedCardIndex: any = -1;
  cardFareCodeId: any;

  constructor(private router: Router, private config: SysytemConfig, private _ngZone: NgZone, private electronService?: ElectronService) { }

  ngOnInit() {
    this.accountDetails = JSON.parse(localStorage.getItem('accountDetails'));
    this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
    console.log(this.accountDetails);
    this.populateAccountDetails();
    this.selectDefaultCard();
    this.disabledAddFundProducts();
  }
  populateAccountDetails() {
    this.accountDetails.accountInfo = [];
    let accountDescriptionValue: any;
    for (let i = 0; i < this.accountDescription.length; i++) {
      switch (i) {
        case 0:
          accountDescriptionValue = this.accountDetails.status;
          break;
        case 1:
          accountDescriptionValue = this.accountDetails.balance;
          break;
        case 2:
          accountDescriptionValue = this.accountDetails.cards.length;
          break;
      }
      this.accountDetails.accountInfo.push({ description: this.accountDescription[i], value: accountDescriptionValue });
    }
  }

  selectDefaultCard() {
    if (this.accountDetails.cards.length > 0) {
      this.onCardSelect(0);
    }
  }

  addProduct() {
    localStorage.setItem('addCardForAccount', 'false');
    // this.readCard();
    this.updateSettingsForSmartAndLUCC();
    this.populateEmptyCard();
    this.navigateToShoppingCart();
  }

  Back() {
    this.router.navigate(['/home']);
  }

  readCard() {
    this.handleSmartCardResult();
    this.electronService.ipcRenderer.send('readSmartcard', CardService.getInstance.getCardName());
  }

  navigateToShoppingCart() {
    localStorage.setItem('selectedAccountBaseCardIndex', this.selectedCardIndex);
    this.router.navigate(['/addproduct']);
  }

  populateEmptyCard() {
    const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
    this.carddata.push(Utils.getInstance.populateDummyCard());
    this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart,
      this.carddata[0], item.Offering, false);
    localStorage.setItem('readCardData', JSON.stringify(JSON.stringify(this.carddata[0])));
    localStorage.setItem('printCardData', this.carddata[0]);
    localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
    this.showCardContents();
  }

  handleSmartCardResult() {
    this.electronService.ipcRenderer.once('readcardResult', (_event, data) => {
      console.log('data', data);
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          this.updateSettingsForSmartAndLUCC();
          localStorage.setItem('readCardData', JSON.stringify(data));
          localStorage.setItem('printCardData', data);
          this.carddata = new Array(JSON.parse(data));
          let item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
          const checkOffering = FareCardService.getInstance.getOfferingBasedOnWalletTypeID(item, this.carddata[0].group);
          if (checkOffering) {
            this.showCardNotAvailableForSale();
            return;
          }
          this.handleReadAccountDetailsResult();
          const type = 'mediaid';
          this.electronService.ipcRenderer.send('readAccountDetails', type, this.carddata[0].printed_id);
        });
      }
    });
  }
  checkFairCodeIsRegular() {
    let isFareCodeRegular: Boolean;
    for (let i = 0; i < this.accountDetails.cards.length; i++) {
      if (this.carddata[0].printed_id == this.accountDetails.cards[i].pid && this.cardFareCodeId == 1) {
        isFareCodeRegular = true;
      } else {
        isFareCodeRegular = false;
      }
    }
    return isFareCodeRegular;
  }
  checkCardIsAlreadyUsed() {
    if (this.carddata[0].account_fulfillment && this.cardFareCodeId == 1) {
      return true;
    } else {
      return false;
    }
  }
  checkCardIsAssignedToTheCurrentUser() {
    if (null != this.newCardData.personId && this.newCardData.personId != this.accountDetails.personId && this.cardFareCodeId == 1) {
      return true;
    } else {
      return false;
    }
  }

  checkCardIsLinkedAccount() {
    this.cardFareCodeId = 1;
    if (this.carddata[0].user_profile > 0) {
      this.cardFareCodeId = this.carddata[0].user_profile;
    }
    if ((this.checkFairCodeIsRegular()) || (this.checkCardIsAlreadyUsed()) || (this.checkCardIsAssignedToTheCurrentUser())) {
      return true;
    }
  }

  showCardNotAvailableForSale() {
    $('#cardSaleError').modal('show');
  }
  showValidationMessageForCardLinkedToAccount() {
    $('#addCardErrorModal').modal('show');
  }
  updateSettingsForSmartAndLUCC() {
    localStorage.removeItem('shoppingCart');
    ShoppingCartService.getInstance.shoppingCart = null;
    this.shoppingcart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
  }
  showCardContents() {
    this.readCardData = [];
    this._ngZone.run(() => {
      const item = JSON.parse(localStorage.getItem('catalogJSON'));
      this.catalogData = JSON.parse(item).Offering;
      this.active_wallet_status = Utils.getInstance.getStatusOfWallet(this.carddata[0]);
      this.cardContents = Utils.getInstance.getWalletProducts(this.carddata[0], this.ticketMap);
      this.router.navigate(['/addproduct']);
    });
  }
  refreshAccountDetails() {
    this.getAccountDetailsResult();
    const type = 'emailid';
    this.electronService.ipcRenderer.send('getAccountDetails', type, this.accountDetails.emailId);
  }
  getAccountDetailsResult() {
    this.electronService.ipcRenderer.on('getAccountDetailsResult', (event, data) => {
      console.log('account details', data);
      localStorage.setItem('accountDetails', data);
      this.accountDetails = JSON.parse(localStorage.getItem('accountDetails'));
      this.populateAccountDetails();
      this.selectDefaultCard();
      this.disabledAddFundProducts();
    });
  }

  disabledAddFundProducts() {
    if (this.accountDetails.balance >= this.terminalConfigJson.MaximumAccountBalance) {
      this.disableaddFund = true;
    }
  }
  checkUserFareCodeAndCardFareCode() {
    if (null != this.accountDetails.farecodes[0] && this.accountDetails.farecodes[0].id == 1 && this.cardFareCodeId != 1) {
      return true;
    } else {
      return false;
    }
  }
  showErrorForFareCode() {
    $('#userProfileError').modal('show');
  }

  addCard() {
    localStorage.setItem('addCardForAccount', 'true');
    this.readCard();
  }
  showErrorMessages() {
    $('#errorModal').modal('show');
  }
  onCardSelect(index) {
    this.selectedCardIndex = index;
  }
  handleReadAccountDetailsResult() {
    this.electronService.ipcRenderer.on('newReadCardResult', (event, data) => {
      this._ngZone.run(() => {
        if (data != null && data.length == 0) {
          $('#inventoryError').modal('show');
          return;
        } else {
          this.newCardData = JSON.parse(data);
          if (this.checkCardIsLinkedAccount()) {
            this.showValidationMessageForCardLinkedToAccount();
            return;
          }
          if (this.checkUserFareCodeAndCardFareCode()) {
            this.showErrorForFareCode();
            return;
          }
          this.initiateNavigationToShoppingCart();
        }
      });
    });
  }

  initiateNavigationToShoppingCart() {
    localStorage.setItem('userProfile', JSON.stringify(this.cardType));
    const item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
    this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart,
      this.carddata[0], item.Offering, true);
    localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
    this.showCardContents();
    this.navigateToShoppingCart();
  }
}
