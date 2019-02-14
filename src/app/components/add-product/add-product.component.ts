import { Component, NgZone, OnInit } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  merchantise = [];
  merch = [];
  merchantList: any = [];
  productTotal: any = 0;
  checkout = true;
  payPricing: any = [];
  cardJson: any = [];
  productJson: any = [];
  readCarddata: any = {};
  numberDigits: any = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  saveTransactionData: any;
  encodeJsonData: any = []; // encode data json 

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
    this.cardJson = JSON.parse(this.readCarddata);
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
    localStorage.setItem('encodeData', JSON.stringify(this.merchantList));

    this.productTotal = this.productTotal + parseFloat(merch.Ticket.Price);
  }
  removeProduct(merch) {
    this.productTotal = this.productTotal - parseFloat(merch.Ticket.Price);
    this.merchantList.splice(this.merchantList.indexOf(merch), 1);
  }
  productCheckout() {
    this.checkout = false;
  }



  // stored ride values
  storedValue() {
    this.merchantise = [];
    this.cdtaService.getJSON().subscribe(data => {
      var i = 0;
      this.productJson.forEach(element => {
        if (null != element.Ticket && undefined != element.Ticket && element.Ticket.Group == "2" && (element.Ticket.TicketType.TicketTypeId == 2 && !element.IsMerchandise)) {
          this.merchantise.push(element);
          i++;
        }
      });
    });
  }
  frequentRide() {
    this.merchantise = [];
    var i = 0;
    this.productJson.forEach(element => {
      if (null != element.Ticket && undefined != element.Ticket && element.Ticket.Group == "1" && (element.Ticket.TicketType.TicketTypeId == 3 && !element.IsMerchandise) && i < 10) {
        this.merchantise.push(element);
        i++;
      }
    });

  }
  payValue() {
    this.merchantise = [];
    var i = 0;
    this.productJson.forEach(element => {
      if (null != element.Ticket && undefined != element.Ticket && element.Ticket.Group == "3" && (element.Ticket.TicketType.TicketTypeId == 1 && !element.IsMerchandise) && i < 10) {
        this.merchantise.push(element);
        i++;
      }
    });
  }

  //   saveTransaction(merch){
  //     // this.saveTransactionData.push(merch);

  //     this.electronService.ipcRenderer.send('savaTransaction',  this.merchantList)
  //     console.log(this.merchantList);
  // }
}