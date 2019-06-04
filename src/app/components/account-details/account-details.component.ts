import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { FareCardService } from 'src/app/services/Farecard.service';
import { Utils } from 'src/app/services/Utils.service';
import { ShoppingCartService } from 'src/app/services/ShoppingCart.service';

declare var $: any;
declare var pcsc: any;
// tslint:disable-next-line:prefer-const
declare var pcsc: any;
// tslint:disable-next-line:prefer-const
let pcs = pcsc();
let cardName: any = '';
pcs.on('reader', function (reader) {

  console.log('reader', reader);
  console.log('New reader detected', reader.name);

  reader.on('error', function (err) {
    console.log('Error(', this.name, '):', err.message);
  });

  reader.on('status', function (status) {
    console.log('Status(', this.name, '):', status);
    /* check what has changed */
    // tslint:disable-next-line:no-bitwise
    const changes = this.state ^ status.state;
    if (changes) {
      // tslint:disable-next-line:no-bitwise
      if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
        console.log('card removed'); /* card removed */
        reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Disconnected');
          }
        });
        // tslint:disable-next-line:no-bitwise
      } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
        cardName = reader.name;
        console.log('sample', cardName);
        console.log('card inserted'); /* card inserted */
        reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, function (err, protocol) {
          if (err) {
            console.log(err);
          } else {
            console.log('Protocol(', reader.name, '):', protocol);
            reader.transmit(new Buffer([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol,
              // tslint:disable-next-line:no-shadowed-variable
              function (err: any, data: { toString: (arg0: string) => void; }) {
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
  disableaddFund: Boolean = false;


  constructor(private router: Router, private _ngZone: NgZone, private electronService?: ElectronService) { }

  ngOnInit() {
    this.accountDetails = JSON.parse(localStorage.getItem('accountDetails'));
    this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
    console.log(this.accountDetails);
    this.populateAccountDetails();
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
          accountDescriptionValue = Array(this.accountDetails.cards).length;
          break;
      }
      this.accountDetails.accountInfo.push({ description: this.accountDescription[i], value: accountDescriptionValue });
    }
  }
  addProduct() {
    this.handleSmartCardResult();
    this.electronService.ipcRenderer.send('readSmartcard', cardName);
  }
  Back() {
    this.router.navigate(['/home']);
  }
  handleSmartCardResult() {
    this.electronService.ipcRenderer.once('readcardResult', (_event, data) => {
      console.log('data', data);
      if (data != undefined && data != '') {
        // this.setCardOptionsForLUCCAndSmartCard();
        this._ngZone.run(() => {
          this.updateSettingsForSmartAndLUCC();
          localStorage.setItem('readCardData', JSON.stringify(data));
          localStorage.setItem('printCardData', data);
          this.carddata = new Array(JSON.parse(data));
          localStorage.setItem('userProfile', JSON.stringify(this.cardType));
          console.log('this.carddata', this.carddata);
          // tslint:disable-next-line:prefer-const
          let item = JSON.parse(JSON.parse(localStorage.getItem('catalogJSON')));
          this.shoppingcart = FareCardService.getInstance.addSmartCard(this.shoppingcart,
            this.carddata[0], item.Offering, false);
          localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingcart));
          this.showCardContents();
        });
      }
    });
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
      // this.getBonusRidesCount();
      // this.getNextBonusRides();
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
      this.disabledAddFundProducts();
    });
  }
  disabledAddFundProducts() {
    if (this.accountDetails.balance >= this.terminalConfigJson.MaximumAccountBalance) {
      this.disableaddFund = true;
    }
  }
  addCard() {
    if (this.accountDetails.cards.length !== 0) {
      $('#errorModal').modal('show');
    }
  }
}
