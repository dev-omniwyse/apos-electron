import { Component, NgZone, OnInit } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
declare var pcsc: any;
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
  productCardList:any = [];
  productTotal: any = 0;
  checkout = true;
  payPricing: any = [];
  cardJson: any = [];
  productJson: any = [];
  readCarddata: any = {};
  numberDigits: any = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  saveTransactionData: any;
  encodeJsonData: any = []; // encode data json 
  currentCard:any = {};
  selectedProductCategoryIndex:any = 0;
  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, ) {

    this.electronService.ipcRenderer.on('saveTransactionResult', (event, data) => {
      if (data != undefined && data != "") {
        // this.show = true;
        this._ngZone.run(() => {
          // this.carddata = new Array(JSON.parse(data));
          // console.log('this.carddata', this.carddata);
          // localStorage.setItem('catalogJSON', JSON.stringify(data));
          //this.router.navigate(['/addproduct'])
        });
      }
    });

    this.electronService.ipcRenderer.on('readcardResult', (event, data) => {
      if (data != undefined && data != "") {
          this._ngZone.run(() => {
               this.cardJson.push(JSON.parse(data));
          });
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
    let item = JSON.parse(localStorage.getItem("catalogJSON"));
    this.productJson = JSON.parse(item).Offering;
    console.log(this.productJson);
    this.readCarddata = JSON.parse(localStorage.getItem("readCardData"));
    this.cardJson.push(JSON.parse(this.readCarddata));
    this.currentCard = JSON.parse(this.readCarddata)
    console.log(this.readCarddata);
    this.frequentRide();
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
  removeProduct(merch) {
    this.productTotal = this.productTotal - parseFloat(merch.Ticket.Price);
    var selectedIndex = this.merchantList.indexOf(merch);
    this.merchantList.splice(selectedIndex, 1);
    this.productCardList.splice(selectedIndex,1);
  }
  productCheckout() {
    localStorage.setItem('encodeData', JSON.stringify(this.merchantList));
    localStorage.setItem('productCardData', JSON.stringify(this.productCardList));
    localStorage.setItem('cardsData', JSON.stringify(this.cardJson));
    localStorage.setItem('transactionAmount', JSON.stringify(this.productTotal));
    this.checkout = false;
  }

  selectCard(index:any){
    this.currentCard = this.cardJson[index];
    (this.selectedProductCategoryIndex == 0)?this.frequentRide(): (this.selectedProductCategoryIndex == 1)?this.storedValue():this.payValue();
  }

  // stored ride values
  storedValue() {
    this.selectedProductCategoryIndex = 1;
    this.merchantise = [];
    this.cdtaService.getJSON().subscribe(data => {
      var i = 0;
      this.productJson.forEach(element => {
        if (null != element.Ticket && undefined != element.Ticket &&  this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "2" && (element.Ticket.TicketType.TicketTypeId == 2 && !element.IsMerchandise)) {
          this.merchantise.push(element);
          i++;
        }
      });
    });
  }
  frequentRide() {
    this.selectedProductCategoryIndex = 0;
    this.merchantise = [];
    var i = 0;
    this.productJson.forEach(element => {
      if (null != element.Ticket && undefined != element.Ticket &&  this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "1" && (element.Ticket.TicketType.TicketTypeId == 3 && !element.IsMerchandise) && i < 10) {
        this.merchantise.push(element);
        i++;
      }
    });

  }
  payValue() {
    this.selectedProductCategoryIndex = 2;
    this.merchantise = [];
    var i = 0;
    this.productJson.forEach(element => {
      if (null != element.Ticket && undefined != element.Ticket &&  this.currentCard.user_profile == element.Ticket.FareCode[0].FareCodeId && element.Ticket.Group == "3" && (element.Ticket.TicketType.TicketTypeId == 1 && !element.IsMerchandise) && i < 10) {
        this.merchantise.push(element);
        i++;
      }
    });
  }

  addCard(){
    this.electronService.ipcRenderer.send('readSmartcard', cardName)
  }
  //   saveTransaction(merch){
  //     // this.saveTransactionData.push(merch);

  //     this.electronService.ipcRenderer.send('savaTransaction',  this.merchantList)
  //     console.log(this.merchantList);
  // }
}