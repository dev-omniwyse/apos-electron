import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges, NgZone } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ElectronService } from 'ngx-electron';
import { Router, ActivatedRoute } from '@angular/router';
import { SSL_OP_NO_TICKET } from 'constants';
import { encode } from 'punycode';
import { MediaType, TICKET_GROUP } from 'src/app/services/MediaType';
import { TransactionService } from 'src/app/services/Transaction.service';
import { debug } from 'util';
import { timestamp } from 'rxjs/operators';
import { Utils } from 'src/app/services/Utils.service';
declare var pcsc: any;
declare var $: any;
const pcs = pcsc();
let cardName: any = 0;
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
        console.log('card removed'); /* card removed */
        reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Disconnected');
          }
        });
      } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
        cardName = reader.name;
        console.log('sample', cardName);
        console.log('card inserted'); /* card inserted */
        reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, function (err, protocol) {
          if (err) {
            console.log(err);
          } else {
            console.log('Protocol(', reader.name, '):', protocol);
            reader.transmit(new Buffer([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol, function (errTransmit, data) {
              if (errTransmit) {
                console.log(errTransmit);
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

  encodeJsonData: any = [];
  cardJson: any = [];
  currentCard: any = [];
  currentCardProductList: any = [];
  cardIndex: any = 0;
  isNew: any = false;
  catalogJson: any = [];
  terminalConfigJson: any = [];
  disableEncode = false;
  encodedCardsData: any = {};
  shoppingCart: any = [];
  isEncodeOnProcess: Boolean = true;
  encodedJsonCardIndex = 0;
  numOfAttempts = 0;
  message: string;
  title: string;
  commaFlag: boolean;
  constructor(private cdtaService: CdtaService, private route: ActivatedRoute, private router: Router,
    private _ngZone: NgZone, private electronService: ElectronService) {
    route.params.subscribe(val => {
      this.cardIndex = 0;
      this.terminalConfigJson = JSON.parse(localStorage.getItem('terminalConfigJson'));
      this.cardJson = JSON.parse(localStorage.getItem('cardsData'));
      const item = JSON.parse(localStorage.getItem('catalogJSON'));
      this.catalogJson = JSON.parse(item).Offering;
      this.shoppingCart = JSON.parse(localStorage.getItem('shoppingCart'));
      this.currentCard = this.cardJson[this.cardIndex];
      if (this.isSmartCardFound()) {
        this.getSmartCardWalletContents();
      }
    });
  }

  /**
   * resultHandler for UpdateCardData, we dispatch readSmartcard.
   *
   * @memberof CarddataComponent
   */
  handleUpdateCardDataResult() {
    const updateCardDataListener: any = this.electronService.ipcRenderer.once('updateCardDataResult', (event, data) => {
      if (data != undefined && data != '') {
        this.handleReadcardResult();
        this.electronService.ipcRenderer.send('readSmartcard', cardName);
      }
    });
  }

  /**
   * ResultHandler for readSmartcard, The result is stored in the local storage
   *
   * @memberof CarddataComponent
   */
  handleReadcardResult() {
    const readcardListener: any = this.electronService.ipcRenderer.once('readcardResult', (event, data) => {
      console.log('data', data);
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          localStorage.setItem('readCardData', JSON.stringify(data));
          localStorage.setItem('printCardData', data);
        });
      }
    });
  }

  /**
   * ResultHandler for grtCardPID, Here we start encoding or remove card from encoding
   * if result matches with currentcard pid.
   *
   * @memberof CarddataComponent
   */
  handleGetCardPIDResult() {
    const cardPIDListener: any = this.electronService.ipcRenderer.once('getCardPIDResult', (event, data) => {
      console.log('data', data);
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          if (data == this.currentCard.printed_id) {
            (this.isEncodeOnProcess) ? this.encodeCard() : this.removeCard();
          } else {
            $('#cardModal').modal('show');
            this.disableEncode = false;
            return;
          }
        });
      } else {
        $('#cardModal').modal('show');
        return;
      }
    });
  }

  handlePrintReceiptResult() {
    this.electronService.ipcRenderer.once('printReceiptResult', (event, data) => {
      if (data != undefined && data != '') {
        alert('print success ');
        this._ngZone.run(() => {
          this.electronService.ipcRenderer.removeAllListeners('printReceiptResult');
        });
      }
    });
  }

  handleSaveTransactionResult() {
    this.disableEncode = false;
    const transactionListener: any = this.electronService.ipcRenderer.once('saveTransactionResult', (event, data) => {
      console.log('data', data);
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          this.navigateToDashboard();
        });
      } else {
        $('#encodeErrorModal').modal({
          backdrop: 'static',
          keyboard: false
        });
      }
    });
  }

  handleEncodeCardResult() {
    const encodingListener: any = this.electronService.ipcRenderer.once('encodeCardResult', (event, data) => {
      const result = new Array(JSON.parse(data));
      const resultObj = result[0];
      if (resultObj != undefined && resultObj != null) {

        if (0 == this.shoppingCart._walletLineItem[this.cardIndex]._walletContents.length) {
          // dont try to update wallletContents..
        } else {
          this._ngZone.run(() => {

            for (const item of this.shoppingCart._walletLineItem[this.cardIndex]._walletContents) {

              for (const productItem of resultObj) {

                if (productItem.ticket_id == item._offering.Ticket.TicketId) {

                  item._status = productItem.status;
                  item._slot = productItem.slotNumber;

                  let balance = 0;
                  if (item._offering.Ticket.Group == TICKET_GROUP.VALUE) {
                    balance = productItem.balance / 100;
                  } else {
                    balance = productItem.balance;
                  }

                  let startDateEpochDays = 0;
                  if (productItem.start_date_epoch_days) {
                    startDateEpochDays = productItem.start_date_epoch_days;
                  }

                  let expDateEpochDays = 0;
                  if (productItem.exp_date_epoch_days) {
                    expDateEpochDays = productItem.exp_date_epoch_days;
                  }

                  let rechargesPending = 0;
                  if (productItem.recharges_pending) {
                    rechargesPending = productItem.recharges_pending;
                  }

                  item._balance = balance;
                  item._startDate = startDateEpochDays;
                  item._expirationDate = expDateEpochDays;
                  item._rechargesPending = rechargesPending;

                }
              }
            }
            this.encodedCardsData[this.currentCard.printed_id] = JSON.stringify(this.encodeJsonData);
          });
        }
        this.shoppingCart._walletLineItem[this.cardIndex]._encoded = true;
        $('#encodeSuccessModal').modal({
          backdrop: 'static',
          keyboard: false
        });
        $('#encodeSuccessModal').modal('show');
        this.disableEncode = false;
      } else {
        $('#encodeErrorModal').modal({
          backdrop: 'static',
          keyboard: false
        });
      }
    });
    this.disableEncode = false;
  }

  proceedForSaveTransaction() {
    $('#encodeSuccessModal').modal('hide');
    if (this.isSmartCardFound()) {
      this.disableEncode = false;
      this.populatCurrentCard();
      this.getSmartCardWalletContents();
    } else {
      this.initiateSaveTransaction();
    }
  }

  handleDeleteProductsFromCardResult() {
    const deleteProductListener: any = this.electronService.ipcRenderer.once('deleteProductsFromCardResult', (event, data) => {
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          this.encodedJsonCardIndex++;
          this.initiateCancelEncoding(this.encodedJsonCardIndex);
        });
      }
    });
  }

  handleDoPinpadVoidTransactionResult() {
    const doPinpadVoidTransactionListener: any = this.electronService.ipcRenderer.once('doPinpadVoidTransactionResult', (event, data) => {
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          this.encodedJsonCardIndex++;
          this.handleGetPinpadTransactionStatusEncodeResult();
          this.electronService.ipcRenderer.send('getPinpadTransactionStatusEncode');
        });
      }
    });
  }

  handleGetPinpadTransactionStatusEncodeResult() {
    this.electronService.ipcRenderer.once('getPinpadTransactionStatusEncodeResult', (event, data) => {
      console.log('transaction Status CreditCArd', data);
      if (data != undefined && data != '') {
        let timer: any;
        if (data == false && this.numOfAttempts < 600) {
          timer = setTimeout(() => {
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
      console.log('creditcardTransaction ', data);
      if (data != undefined && data != '') {
        localStorage.setItem('pinPadTransactionData', data);
        this.navigateToReadCard();
      }
    });
  }





  initiateSaveTransaction() {
    this.disableEncode = true;
    const expirationDate: String = (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + (new Date().getFullYear() + 10);
    if (this.isNew) {
      this.handleUpdateCardDataResult();
      this.electronService.ipcRenderer.send('updateCardData', cardName, expirationDate);
    } else {
      this.handleReadcardResult();
      this.electronService.ipcRenderer.send('readSmartcard', cardName);
    }
    const userID = localStorage.getItem('userID');

    const transactionObj = TransactionService.getInstance.saveTransaction(this.shoppingCart, this.getUserByUserID(userID));
    localStorage.setItem('transactionObj', JSON.stringify(transactionObj));
    const deviceData = JSON.parse(localStorage.getItem('deviceInfo'));
    const deviceInfo = Utils.getInstance.increseTransactionCountInDeviceInfo(deviceData, transactionObj);
    localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    this.handleSaveTransactionResult();
    this.electronService.ipcRenderer.send('savaTransaction', transactionObj);
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

  populatCurrentCard() {
    this.cardJson.forEach(element => {
      if (element.printed_id == this.shoppingCart._walletLineItem[this.cardIndex]._cardPID) {
        this.currentCard = element;
      }
    });
  }

  setCardIndexForCancelEncode(cardPID) {
    for (let index = 0; index < this.shoppingCart._walletLineItem.length; index++) {
      const element = this.shoppingCart._walletLineItem[index];
      if (element._cardPID == cardPID) {
        this.cardIndex = index;
      }
    }

  }

  isSmartCardFound() {
    let index = 0;
    let nextItemFound: Boolean = false;
    for (const iterator of this.shoppingCart._walletLineItem) {
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
    const timestamp_generateReciept = new Date().getTime();
    this.cdtaService.generateReceipt(timestamp_generateReciept);
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem('cardsData');
    localStorage.removeItem('catalogJSON');
    localStorage.removeItem('readCardData');
    this.router.navigate(['/readcard']);
  }

  printDiv() {
    window.print();
  }

  ngOnInit() {

  }

  removeEventListeners() {

  }

  navigateToReadCard() {
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem('cardsData');
    localStorage.removeItem('catalogJSON');
    localStorage.removeItem('readCardData');
    this.router.navigate(['/readcard']);
  }

  checkIsCardNew() {
    this.isNew = (this.currentCard.products.length == 1 && ((this.currentCard.products[0].product_type == 3) &&
      (this.currentCard.products[0].remaining_value == 0))) ? true : false;
  }

  populatCurrentCardEncodedData() {
    this.currentCardProductList = this.shoppingCart._walletLineItem[this.cardIndex + 1]._walletContents;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
    }
  }

  checkCorrectCard() {
    this.populatCurrentCard();
    console.log(cardName);
    this.disableEncode = true;
    this.handleGetCardPIDResult();
    this.electronService.ipcRenderer.send('getCardPID', cardName);
  }

  encodeCard() {
    try {
      console.log('product list data', this.currentCardProductList);
      this.encodeJsonData = [];
      let JsonObj;
      let currentIndex = 0;
      this.currentCardProductList.forEach(element => {
        if (element._offering.Ticket.Group == 1) {
          for (let index = 0; index < element._quantity; index++) {
            const internalJsonObj = this.constructJsonForEncoding(element._offering.Ticket.Group, element);
            this.encodeJsonData.push(internalJsonObj);
          }
        } else if (element._offering.Ticket.Group == 2) {
          JsonObj = this.constructJsonForEncoding(element._offering.Ticket.Group, element);
        } else if (element._offering.Ticket.Group == 3) {
          JsonObj = this.constructJsonForEncoding(element._offering.Ticket.Group, element);

        }
        if (element._offering.Ticket.Group != 1) {
          this.encodeJsonData.push(JsonObj);
        }
        currentIndex++;
      });
      this.handleEncodeCardResult();
      this.checkIsCardNew();
      if (this.isNew) {
        this.electronService.ipcRenderer.send('encodenewCard', this.currentCard.printed_id,
          this.shoppingCart._walletLineItem[this.cardIndex]._fareCodeId, 0, 0, this.encodeJsonData);
      } else {
        this.electronService.ipcRenderer.send('encodeExistingCard', this.currentCard.printed_id, this.encodeJsonData);
      }
    } catch {
      $('#encodeErrorModal').modal('show');
    }
  }

  constructJsonForEncoding(product_type, element) {
    let JsonObjectForProductType: any;
    switch (product_type) {
      case 1:
        JsonObjectForProductType = {
          'product_type': element._offering.Ticket.Group,
          'designator': element._offering.Ticket.Designator,
          'ticket_id': element._offering.Ticket.TicketId,
          'designator_details': 0,
          'start_date_epoch_days': element._offering.Ticket.DateStartEpochDays,
          'exp_date_epoch_days': element._offering.Ticket.DateExpiresEpochDays,
          'is_linked_to_user_profile': false,
          'type_expiration': element._offering.Ticket.ExpirationTypeId,
          'add_time': 240,
          'recharges_pending': 0,
          'days': (element._offering.Ticket.Value),
          'isAccountBased': element._isAccountBased,
          'isCardBased': element._isCardBased
        };
        break;
      case 2:
        JsonObjectForProductType = {
          'product_type': element._offering.Ticket.Group,
          'designator': element._offering.Ticket.Designator,
          'ticket_id': element._offering.Ticket.TicketId,
          'designator_details': 0,
          'remaining_rides': (element._quantity * element._offering.Ticket.Value),
          'recharge_rides': 0,
          'threshold': 0,
          'is_linked_to_user_profile': false,
          'isAccountBased': element._isAccountBased,
          'isCardBased': element._isCardBased
        };
        break;
      case 3:
        JsonObjectForProductType = {
          'product_type': element._offering.Ticket.Group,
          'designator': element._offering.Ticket.Designator,
          'ticket_id': element._offering.Ticket.TicketId,
          'designator_details': 0,
          'is_linked_to_user_profile': false,
          'remaining_value': (element._quantity * element._unitPrice * 100),
          'isAccountBased': element._isAccountBased,
          'isCardBased': element._isCardBased
        };
        break;

      default:
        break;
    }
    return JsonObjectForProductType;
  }

  removeCard() {
    this.handleDeleteProductsFromCardResult();
    this.electronService.ipcRenderer.send('deleteProductsFromCard', this.currentCard.printed_id,
      this.encodedCardsData[this.currentCard.printed_id]);
  }

  getKeyForCancelEncode(index) {
    let currentIndex = 0;
    let cardPID = undefined;
    for (const key in this.encodedCardsData) {
      if (currentIndex == index) {
        cardPID = key;
      }
      currentIndex++;
    }

    return cardPID;
  }

  prePaidTransactionObject() {
    const userID = localStorage.getItem('userID');
    const transactionObj = TransactionService.getInstance.saveTransaction(this.shoppingCart, this.getUserByUserID(userID));
    localStorage.setItem('transactionObj', JSON.stringify(transactionObj));
  }

  openCashDrawer() {
    this.electronService.ipcRenderer.send('openCashDrawer');
  }

  initiateCancelEncoding(index) {
    const cardPID = this.getKeyForCancelEncode(index);
    this.cdtaService.generateRefundReceipt();
    if (cardPID == undefined) {
      this.prePaidTransactionObject();
      if (this.checkIfCreditCardPaymentExists()) {
        this.numOfAttempts = 0;
        this.doPinpadVoidTransaction(this.getCreditCardPaymentAmount());
      } else {
        this.openCashDrawer();
        this.navigateToReadCard();
      }
      return;
    }
    this.isEncodeOnProcess = false;
    this.setCardIndexForCancelEncode(cardPID);
    this.populatCurrentCard();
    this.getSmartCardWalletContents();
  }

  checkIfCreditCardPaymentExists() {
    let creditCardPaymentExists: Boolean = false;
    const transObj = JSON.parse(localStorage.getItem('transactionObj'));
    transObj.payments.forEach(element => {
      if (element.paymentMethodId == 9) {
        creditCardPaymentExists = true;
      }
    });
    return creditCardPaymentExists;
  }

  getCreditCardPaymentAmount() {
    let amount = 0;
    const transObj = JSON.parse(localStorage.getItem('transactionObj'));
    transObj.payments.forEach(element => {
      if (element.paymentMethodId == 9) {
        amount = element.amount;
      }
    });
    return amount;
  }

  doPinpadVoidTransaction(amount) {
    this.handleDoPinpadVoidTransactionResult();
    this.electronService.ipcRenderer.send('doPinpadVoidTransaction', amount);
  }

  confirmCancelEncoding() {
    $('#confirmCancelEncodeModal').modal('show');
    this.getRefundTitle();
  }

  getRefundTitle() {
    let count = 0;
    let commaFlag = false;
    this.message = 'Please give the customer back  ';
    this.title = 'Return ';
    let payments = [];
    payments = this.shoppingCart._payments;
    const indexOfPayment = Utils.getInstance.checkIsPaymentMethodExists(8, this.shoppingCart);
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

        default:
          this.message = 'Please give the customer back ';
      }
      count++;
    });
  }
}
