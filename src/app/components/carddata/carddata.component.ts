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
import { FareCardService } from 'src/app/services/Farecard.service';
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
  isLUCCCardNew: any = false;
  catalogJson: any = [];
  terminalConfigJson: any = [];
  disableEncode = false;
  encodedCardsData: any = {};
  shoppingCart: any = [];
  isEncodeOnProcess: Boolean = true;
  encodedJsonCardIndex = 0;
  numOfAttempts = 0;
  payAsYouGoAppliedTotal = 0;
  message: string;
  title: string;
  commaFlag: boolean;
  card_id: any;
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
      if (this.isSmartOrLUCCCardFound()) {
        this.getSmartLUCCCardWalletContents();
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
        if (this.currentCard._walletTypeId == MediaType.SMART_CARD_ID) {
          this.handleReadcardResult();
          this.electronService.ipcRenderer.send('readSmartcard', cardName);
        } else {
          this.handleLUCCCardResult();
          this.electronService.ipcRenderer.send('readCardUltralightC');
        }
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

  handleLUCCCardResult() {
    const readcardListener: any = this.electronService.ipcRenderer.once('readCardUltralightCResult', (event, data) => {
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
            (this.isEncodeOnProcess) ? this.checkCardType() : this.removeCard();
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
  handleGetCardPIDResultForLUCC() {
    const cardPIDListener: any = this.electronService.ipcRenderer.once('getCardPIDUltraLightCResult', (event, data) => {
      console.log('data', data);
      if (data != undefined && data != '') {
        this._ngZone.run(() => {
          if (data == this.currentCard.printed_id) {
            (this.isEncodeOnProcess) ? this.checkCardType() : this.removeCard();
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
  /**
   *resultHandler for print reciept
   *
   * @memberof CarddataComponent
   */
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


  /**
   *
   *resultHandler for save Transaction if data present we call navigateToDashboard or else we will show encodeErrorModal
   * @memberof CarddataComponent
   */
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


  /**
   *
   *result Handler for encodeCard. If data presents we update walletLineItem and call encodeSucessModal Popup 
   and proceed for save transaction or else encode other cards in the Queue
   * @memberof CarddataComponent
   */
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


  /**
   * This function will check to proceed for save transaction or to encode other card in the queue.
   *
   * @memberof CarddataComponent
   */
  proceedForSaveTransaction() {
    $('#encodeSuccessModal').modal('hide');
    if (this.isSmartOrLUCCCardFound()) {
      this.disableEncode = false;
      this.populatCurrentCard();
      this.getSmartLUCCCardWalletContents();
    } else {
      this.initiateSaveTransaction();
    }
  }


  /**
   *resultHandler for deleteProductsFromCard here we call initialCancelEncodin g function to initiate cancel Encoding
   *
   * @memberof CarddataComponent
   */
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


  /**
   *
   *resultHandler for doPinPadVoidTransaction here we call getPinpadTransactionStatusEncode
   to check the status of pinpadVoidTransaction
   * @memberof CarddataComponent
   */
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


  /**
   *
   *resultHandler for pinpadTransactionStatusEncode(cancel credit card Transaction)
   here we wait for  max 600 seconds to check wether transaction completed if so we clear the timer
   and call getPinpadTransactionDataEncode.
   * @memberof CarddataComponent
   */
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


  /**
   *
   *resultHandler for getPinpadTransactionDataEncode if so we set localstorage for result
   and navigate to readcard.
   * @memberof CarddataComponent
   */
  handleGetPinpadTransactionDataEncodeResult() {
    this.electronService.ipcRenderer.once('getPinpadTransactionDataEncodeResult', (event, data) => {
      console.log('creditcardTransaction ', data);
      if (data != undefined && data != '') {
        localStorage.setItem('pinPadTransactionData', data);
        this.navigateToReadCard();
      }
    });
  }


  /**
   *this function checks if card is new if so calls updateCardData or else calls readSmartcard
   *and finally calls saveTransaction
   * @memberof CarddataComponent
   */
  initiateSaveTransaction() {
    this.disableEncode = true;
    const expirationDate: String = (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + (new Date().getFullYear() + 10);
    if (this.isNew || this.isLUCCCardNew) {
      this.handleUpdateCardDataResult();
      this.electronService.ipcRenderer.send('updateCardData', cardName, expirationDate);
    } else {
      if (this.currentCard._walletTypeId == MediaType.SMART_CARD_ID) {
        this.handleReadcardResult();
        this.electronService.ipcRenderer.send('readSmartcard', cardName);
      } else {
        this.handleLUCCCardResult();
        this.electronService.ipcRenderer.send('readCardUltralightC');
      }
    }
    const userID = localStorage.getItem('userID');
    const transactionObj = TransactionService.getInstance.saveTransaction(this.shoppingCart, Utils.getInstance.getUserByUserID(userID));
    localStorage.setItem('transactionObj', JSON.stringify(transactionObj));
    const deviceData = JSON.parse(localStorage.getItem('deviceInfo'));
    const deviceInfo = Utils.getInstance.increseTransactionCountInDeviceInfo(deviceData, transactionObj);
    localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    this.handleSaveTransactionResult();
    this.electronService.ipcRenderer.send('savaTransaction', transactionObj);
  }

  /**
   *
   *This function returns the paymentsObject based on paymentMethodID
   * @returns
   * @memberof CarddataComponent
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
   *
   *This function populates the currentCardDetails in to currentCard
   * @memberof CarddataComponent
   */
  populatCurrentCard() {
    this.cardJson.forEach(element => {
      if (element.printed_id == this.shoppingCart._walletLineItem[this.cardIndex]._cardPID) {
        this.currentCard = element;
      }
    });
  }


  /**
   *
   *This function setCardIndex to cardIndex for card to be cancelled(cancel Encoding)
   * @param {*} cardPID
   * @memberof CarddataComponent
   */
  setCardIndexForCancelEncode(cardPID) {
    for (let index = 0; index < this.shoppingCart._walletLineItem.length; index++) {
      const element = this.shoppingCart._walletLineItem[index];
      if (element._cardPID == cardPID) {
        this.cardIndex = index;
      }
    }

  }


  /**
   *
   *This functions checks if next smart card is available for encoding if so sets the cardIndex and
   returns true or false.
   * @returns
   * @memberof CarddataComponent
   */
  isSmartOrLUCCCardFound() {
    let index = 0;
    let nextItemFound: Boolean = false;
    for (const iterator of this.shoppingCart._walletLineItem) {
      if (iterator._walletTypeId == MediaType.SMART_CARD_ID || iterator._walletTypeId == MediaType.LUCC) {
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


  /**
   *
   *This function populates shopping card items based on cardindex to currentCardProductList
   * @memberof CarddataComponent
   */
  getSmartLUCCCardWalletContents() {
    this.currentCardProductList = this.shoppingCart._walletLineItem[this.cardIndex]._walletContents;
  }

  /**
   *
   *This function calls generateReceipt, removeLocalStorage and naviagtes to ReadCard
   * @memberof CarddataComponent
   */
  navigateToDashboard() {
    const timestamp_generateReciept = new Date().getTime();
    this.cdtaService.generateReceipt(timestamp_generateReciept);
    this.removeLocalStorage();
    this.router.navigate(['/home']);
  }


  /**
   *
   *This function calls removeLocalStorage and navigates to readcard.
   * @memberof CarddataComponent
   */
  navigateToReadCard() {
    this.removeLocalStorage();
    this.router.navigate(['/home']);
  }

  /**
   *
   *this function removes Localstorage for encodeData,productCardData,cardsData,
   * catalogJSON, readCardData
   * @memberof CarddataComponent
   */
  removeLocalStorage() {
    localStorage.removeItem('encodeData');
    localStorage.removeItem('productCardData');
    localStorage.removeItem('cardsData');
    localStorage.removeItem('catalogJSON');
    localStorage.removeItem('readCardData');
  }

  /**
   *
   *This function checks if currentCard is new or existing
   * @memberof CarddataComponent
   */
  checkIsCardNew() {
    this.isNew = (this.currentCard.products.length == 1 && ((this.currentCard.products[0].product_type == 3) &&
      (this.currentCard.products[0].remaining_value == 0))) ? true : false;
  }

  checkIsLUCCCardNew() {
    this.isLUCCCardNew = (this.currentCard.product.product_type == 0 && this.currentCard.product.designator == 0) ? true : false;
  }

  /**
   *
   *This function poupulates currentCardProductList with shoppingCart items based on cradIndex.
   * @memberof CarddataComponent
   */
  populatCurrentCardEncodedData() {
    this.currentCardProductList = this.shoppingCart._walletLineItem[this.cardIndex + 1]._walletContents;
  } 


  /**
   *
   *
   * @memberof CarddataComponent
   */
  ngOnInit(): void {

  }
  /**
   *
   *
   * @param {SimpleChanges} changes
   * @memberof CarddataComponent
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
    }
  }

  /**
   *
   *This function is called when we click on encode, here we call pouplateCurrentCArd and check the cardPid 
   if it matches with currentcardDetails
   * @memberof CarddataComponent
   */
  checkCorrectCard() {
    this.populatCurrentCard();
    console.log(cardName);
    this.disableEncode = true;
    if (this.shoppingCart._walletLineItem[this.cardIndex]._walletTypeId == MediaType.SMART_CARD_ID) {
      this.handleGetCardPIDResult();
      this.electronService.ipcRenderer.send('getCardPID', cardName);
    } else {
      this.handleGetCardPIDResultForLUCC();
      this.electronService.ipcRenderer.send('getCardPIDUltralightC', cardName);

    }
  }


  /**
   *
   *This function is called from handleGetCardPIDResult if pid matches with currentCard Pid
   We construct json based on Ticket Group and call encodenewCard or encodeExistingCard
   based on wether card is new or existing.
   * @memberof CarddataComponent
   */
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
      if (this.isNew || Utils.getInstance.isFromAccountBasedCard()) {
        this.electronService.ipcRenderer.send('encodenewCard', this.currentCard.printed_id,
          this.shoppingCart._walletLineItem[this.cardIndex]._fareCodeId, 0, 0, this.encodeJsonData);
      } else {
        this.electronService.ipcRenderer.send('encodeExistingCard', this.currentCard.printed_id, this.encodeJsonData);
      }
    } catch {
      $('#encodeErrorModal').modal('show');
    }
  }
  /**
   *This function is called from handleGetCardPIDResult if pid matches with currentCard Pid
    We construct json based on Ticket Group and call encodenewCard for LUCC or encodeExistingCard for LUCC
    based on wether card is new or existing
   *
   * @memberof CarddataComponent
   */
  encodeLUCCCard() {
    try {
      console.log('product list data', this.currentCardProductList);
      this.encodeJsonData = [];
      let JsonObj;
      let currentIndex = 0;
      let isStoredRideProductPresent = false;
      let isStoredValueProductPresent = false;
      let isFrequentRideProductPresent = false;
      let frequentRideJSON = [];
      let storedRideJSON = [];
      let storedValueJSON = [];
      let frequentRideJSONObj;
      let storedRideJSONObj;
      let storedValueJSONObj;
      this.currentCardProductList.forEach(element => {
        if (element._offering.Ticket.Group == 1) {
          isFrequentRideProductPresent = true;
          for (let index = 0; index < element._quantity; index++) {
            const internalJsonObj = FareCardService.getInstance.constructJsonForEncodingLUCC(element._offering.Ticket.Group,
              element, this.terminalConfigJson);
            frequentRideJSON.push(internalJsonObj);
          }
          frequentRideJSONObj = JSON.stringify(frequentRideJSON[0]);
        } else if (element._offering.Ticket.Group == 2) {
          isStoredRideProductPresent = true;
          JsonObj = FareCardService.getInstance.constructJsonForEncodingLUCC(element._offering.Ticket.Group,
            element, this.terminalConfigJson);
          storedRideJSON.push(JsonObj);
          storedRideJSONObj = JSON.stringify(storedRideJSON[0]);
        } else if (element._offering.Ticket.Group == 3) {
          isStoredValueProductPresent = true;
          JsonObj = FareCardService.getInstance.constructJsonForEncodingLUCC(element._offering.Ticket.Group,
            element, this.terminalConfigJson);
          storedValueJSON.push(JsonObj);
          storedValueJSONObj = JSON.stringify(storedValueJSON[0]);
        }
        currentIndex++;
      });
      if (!isFrequentRideProductPresent) {
        frequentRideJSONObj = null;
      }
      if (!isStoredRideProductPresent) {
        storedRideJSONObj = null;
      }
      if (!isStoredValueProductPresent) {
        storedValueJSONObj = null;
      }
      this.handleEncodeCardResult();
      this.checkIsLUCCCardNew()
      if (this.isLUCCCardNew) {
        this.electronService.ipcRenderer.send('encodeCardUltralightC', this.currentCard.printed_id,
          frequentRideJSONObj, storedRideJSONObj, storedValueJSONObj);
      } else {
        this.electronService.ipcRenderer.send('addValueUltralightC', this.currentCard.printed_id,
          frequentRideJSONObj, storedRideJSONObj, storedValueJSONObj);
      }
    } catch {
      $('#encodeErrorModal').modal('show');
    }
  }
  /**
   *
   *This funcion is called from encodeCard() to construct Json based on Ticket Group for encoding.
   * @param {*} product_type
   * @param {*} element
   * @returns
   * @memberof CarddataComponent
   */
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

  /**
   *
   *This is called when we click on cancel we deleteProductsFromCard to delete products from encoded cards. 
   * @memberof CarddataComponent
   */
  removeCard() {
    this.handleDeleteProductsFromCardResult();
    this.electronService.ipcRenderer.send('deleteProductsFromCard', this.currentCard.printed_id,
      this.encodedCardsData[this.currentCard.printed_id]);
  }
  checkCardType() {
    if (this.shoppingCart._walletLineItem[this.cardIndex]._walletTypeId == MediaType.SMART_CARD_ID) {
      this.encodeCard();
    } else {
      this.encodeLUCCCard();
    }
  }
  /**
   *
   *This functions returns cardPid based on cardIndex
   * @param {*} index
   * @returns
   * @memberof CarddataComponent
   */
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

  /**
   *
   *This function prepares transactionObject abd sets to localStorage
   * @memberof CarddataComponent
   */
  prePaidTransactionObject() {
    const userID = localStorage.getItem('userID');
    const transactionObj = TransactionService.getInstance.saveTransaction(this.shoppingCart, Utils.getInstance.getUserByUserID(userID));
    localStorage.setItem('transactionObj', JSON.stringify(transactionObj));
  }

  /**
   *
   *This function calls openCashDrawer methid to open cash drawer
   * @memberof CarddataComponent
   */
  openCashDrawer() {
    this.electronService.ipcRenderer.send('openCashDrawer');
  }

  /**
   *
   *This function initiates cancel encoding , calls generateRefundReceipt, doPinpadVoidTransaction if
   credit card trnasaction exists, and calls other methods to start cancel encoding.
   * @param {*} index
   * @returns
   * @memberof CarddataComponent
   */
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
    this.getSmartLUCCCardWalletContents();
  }

  /**
   *
   *This function checks if creditCard payments exists for the transaction and returns boolean accordingly
   * @returns
   * @memberof CarddataComponent
   */
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

  /**
   *
   *This function gets creditCard paymentAmount from transactionObject and by comparing peymentMethodId
   * @returns
   * @memberof CarddataComponent
   */
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

  /**
   *
   *This functions calls doPinpadVoidTransaction to cancel credit card transaction.
   * @param {*} amount
   * @memberof CarddataComponent
   */
  doPinpadVoidTransaction(amount) {
    this.handleDoPinpadVoidTransactionResult();
    this.electronService.ipcRenderer.send('doPinpadVoidTransaction', amount);
  }

  /**
   *
   *This function cdisplays modal to confirm cancel encoding and calls getRefundTitle method
   * @memberof CarddataComponent
   */
  confirmCancelEncoding() {
    $('#confirmCancelEncodeModal').modal('show');
    this.getRefundTitle();
  }

  returnPayments() {
    var payments = JSON.parse(localStorage.getItem('shoppingCart'))._payments;
    if (payments.length != 0) {
      for (let i = 0; i < payments.length; i++) {
        if (payments[i].paymentMethodId == 12) {
          this.payAsYouGoAppliedTotal = payments[i].amount;
        }
      }
    }
    if( this.payAsYouGoAppliedTotal > 0){
      $('#returnPayAsYouGoAmount').modal('show');
    }else{
      $('#returnCheckModal').modal('show');
    }
  }

  returnPayAsYouGoAmount(){
    this.handleReadCardForReturnPayAsYouGo();
    this.electronService.ipcRenderer.send('readForPayAsYouGoAmount', cardName);
  }

  handleReadCardForReturnPayAsYouGo() {
    this.electronService.ipcRenderer.once('readCardToReturnPayAsYouGoResult', (event, data) => {
      if (data != undefined && data != '') {
        this.payAsYouGoAppliedTotal = -Math.abs(this.payAsYouGoAppliedTotal);
        this.handleReturnChargeStoredValue();
        this.electronService.ipcRenderer.send('returnChargeStoredAmount', JSON.parse(data).printed_id, Number(this.payAsYouGoAppliedTotal) * 100);
      } else if (data == null || data == '') {
        $('#errorToReadModal').modal('show');
      }
    })
  }
  
    handleReturnChargeStoredValue() {
      this.electronService.ipcRenderer.once('returnChargeStoredAmountResult', (event, data, card_id) => {
        if (data != undefined && data != '') {
          if (data == 'true') {
            this.card_id = card_id;
            $('#returnSuccessPayAsYouGoAmount').modal('show');
          } else {
            $('#unableToReturnPayAsYouGoAmount').modal('show');
          }
        }
      });
    }
  
    cancelListOfPayments(){
      var onlyPayAsYouGo = false;
      if(this.shoppingCart._payments.length != 0){
        for (let i = 0; i < this.shoppingCart._payments.length; i++) {
          if (this.shoppingCart._payments[i].paymentMethodId == 12) {
            onlyPayAsYouGo = true
          }
        }
        if (this.shoppingCart._payments.length == 1 && onlyPayAsYouGo == true) {
          this.initiateCancelEncoding(this.encodedJsonCardIndex);
        }else{
          $('#returnCheckModal').modal('show');
        }
      }

    }
  /**
   *
   *This function returns refundTitle based on paymentMethod
   * @memberof CarddataComponent
   */
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

        case 10:
          this.title = this.title + 'Fare Card';
          this.message = this.message + 'Fare Card';
          break;
        case 12:
          this.title = this.title + 'Pay As You Go';
          this.message = this.message + 'Pay As You Go';
          break;

        default:
          this.message = 'Please give the customer back ';
      }
      count++;
    });
  }
}
