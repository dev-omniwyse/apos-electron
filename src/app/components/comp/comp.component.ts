
import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { TransactionService } from 'src/app/services/Transaction.service';
import { MediaType, TICKET_GROUP, TICKET_TYPE } from 'src/app/services/MediaType';
@Component({
  selector: 'app-comp',
  templateUrl: './comp.component.html',
  styleUrls: ['./comp.component.css']
})
export class CompComponent implements OnInit {
  public reason: Boolean = true
  public reasonForComp: string;
  isSmartCard: boolean;
  shoppingcart: any = [];
  cardJson: any = [];
  cardIndex: any = 0;
  public buttonArray = ["DEFECTIVE CARD", "LOST CARD", "SCHEDULE DELAYS", "OTHERS"]
  constructor(private cdtaservice: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {
    this.cardJson = JSON.parse(localStorage.getItem("cardsData"));
    this.shoppingcart = JSON.parse(localStorage.getItem("shoppingCart"));
    this.isSmartCard = JSON.parse(localStorage.getItem('isSmartCard'));
    var transactionListener: any = this.electronService.ipcRenderer.on('saveTransactionForMagneticMerchandiseResult', (event, data) => {
    console.log("data", data)
    if (data != undefined && data != "") {
      var timestamp = new Date().getTime();
      // this.cdtaService.generateReceipt(timestamp);
      this._ngZone.run(() => {
        // if (this.merchantiseList.length != 0 || this.merchantList.length != 0) {
        //   this.saveTransaction(localStorage.getItem("paymentMethodId"));
        // }
        // else if (this.MagneticList.length == 0 && this.merchantiseList.length == 0 && this.merchantList.length == 0) {

        localStorage.removeItem('encodeData');
        localStorage.removeItem('productCardData');
        localStorage.removeItem("cardsData");
        localStorage.removeItem("readCardData");
        this.electronService.ipcRenderer.removeAllListeners("readCardResult");
        this.router.navigate(['/readcard'])
        // }
      });
    } else {

    }
  });
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
  compReason(value) {
    this.reasonForComp = value
    if (this.reason == true && value == "OTHERS") {
      this.reason = false
      this.reasonForComp = ""
    } else {
      // this.reasonForComp = value
      localStorage.setItem("compReason", this.reasonForComp)
    }
  }
  compNavigate() {
    if (this.reason == true) {
      this.router.navigate(['/addproduct'])
    } else if (this.reason == false) {
      this.reason = true
    }
  }

  compensation() {
    //this.electronService.ipcRenderer.send('compensation')
    //console.log('read call', cardName)
    localStorage.setItem("compReason", this.reasonForComp)
    console.log('reason for comp', this.reasonForComp)
    if(this.isSmartCardFound()) {
      this.router.navigate(['/carddata'])

    } else {
      this.saveTransactionForMerchandiseAndMagnetic()
      // this.router.navigate(['/readcard']);
    }
  }

  
  saveTransactionForMerchandiseAndMagnetic() {
    let userID = localStorage.getItem('userID');
    let transactionObj = TransactionService.getInstance.saveTransaction(this.shoppingcart, this.getUserByUserID(userID), this.getPaymentsObject());
    localStorage.setItem("transactionObj", JSON.stringify(transactionObj))
    this.electronService.ipcRenderer.send('savaTransactionForMagneticMerchandise', transactionObj);
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

  

  ngOnInit() {

  }

  ngOnDestroy() {
    this.electronService.ipcRenderer.removeAllListeners("saveTransactionForMagneticMerchandiseResult");
  }


  

}
