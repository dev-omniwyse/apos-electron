import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges, NgZone } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ElectronService } from 'ngx-electron';
import { Router } from '@angular/router';
// import { product_log } from '../../../assets/data/product_catalog'
@Component({
  selector: 'app-carddata',
  templateUrl: './carddata.component.html',
  styleUrls: ['./carddata.component.css']
})
export class CarddataComponent implements OnInit, OnChanges {

  @Input() public Carddata;
  merchantise = [];
  merchantList: any = [];
  encodeParseData: any = [];
  encodeJsonData: any = [];
  readCarddata: any = {};
  cardJson: any= [];
  productCardList: any = [];
  encodedProductCardData: any = [];
  currentCard:any = [];
  currentCardMerchantList:any = [];
  cardIndex:any = 0;
  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService) {
    this.electronService.ipcRenderer.on('encodeCardResult', (event, data) => {
      // if (data != undefined && data != "") {
          //this.show = true;
          this._ngZone.run(() => {
            if(this.encodeParseData.length-1 == this.cardIndex)
               this.router.navigate(['/readcard']) 
            else{
              this.cardIndex++;
              this.currentCard = this.cardJson[this.cardIndex];
              this.populatCurrentCardEncodedData();
            }
          });
      // }
  });
 }

  printDiv() {
    // var printContents = document.getElementById(divName).innerHTML;
    // var originalContents = document.body.innerHTML;
    // document.body.innerHTML = printContents;
    // this.electronService.ipcRenderer.send("printPDF", printContents);
    window.print();
    //  document.body.innerHTML = originalContents;
  }

  ngOnInit() {
    this.merchantList = localStorage.getItem('encodeData');
    this.productCardList = localStorage.getItem('productCardData');
    this.encodeParseData = JSON.parse(this.merchantList); 
    this.encodedProductCardData = JSON.parse(this.productCardList); 
    this.cardJson = JSON.parse(localStorage.getItem("cardsData"));
    // this.readCarddata = JSON.parse(localStorage.getItem("cardsData"));
    // this.cardJson = JSON.parse(this.readCarddata);
    this.currentCard = this.cardJson[this.cardIndex];
    this.populatCurrentCardEncodedData();
  }

  populatCurrentCardEncodedData(){
    var dataIndex:any = 0;
    this.currentCardMerchantList = [];
    this.encodedProductCardData.forEach(element => {
      if(element == this.currentCard.printed_id){
        this.currentCardMerchantList.push(this.encodeParseData[dataIndex]);
      }
      dataIndex++
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
    }
  }

  // {"product_type":1,"
  // designator":54,
  // "ticket_id":203,
  // "designator_details":0,
  // "start_date_epoch_days":0,
  // "exp_date_epoch_days":0,
  // "is_linked_to_user_profile":false,
  // "type_expiration":1,
  // "add_time":240,
  // "recharges_pending":0,
  // "days":1,
  // "isAccountBased":false,
  // "isCardBased":true}

  encodeCard() {
    console.log("product list data" ,this.currentCardMerchantList);
    this.encodeJsonData = [];
    var JsonObj;
    this.currentCardMerchantList.forEach(element => {
    if(element.Ticket.Group == 1)
    JsonObj = {
      "product_type":element.Ticket.Group,
      "designator":element.Ticket.Designator,
      "ticket_id":element.Ticket.TicketId,
      "designator_details":0,
      "start_date_epoch_days":element.Ticket.DateStartEpochDays,
      "exp_date_epoch_days":element.Ticket.DateExpiresEpochDays,
      "is_linked_to_user_profile":false,
      "type_expiration":element.Ticket.ExpirationTypeId,
      "add_time":240,
      "recharges_pending":0,
      "days":element.Ticket.Value,
      "isAccountBased":element.IsAccountBased,
      "isCardBased":element.IsCardBased
    }
    else if(element.Ticket.Group == 2){
      JsonObj = {
        "product_type":element.Ticket.Group,
        "designator":element.Ticket.Designator,
        "ticket_id":element.Ticket.TicketId,
        "designator_details":0,
        "remaining_rides": element.Ticket.Value,
        "recharge_rides": 0,
        "threshold":0,
        "is_linked_to_user_profile":false,
        "isAccountBased":element.IsAccountBased,
        "isCardBased":element.IsCardBased
      }
    }
    else if(element.Ticket.Group == 3){
      JsonObj = {
        "product_type":element.Ticket.Group,
        "designator":element.Ticket.Designator,
        "ticket_id":element.Ticket.TicketId,
        "designator_details":0,
        "is_linked_to_user_profile":false,
        "remaining_value": element.Ticket.Price*100,
        "isAccountBased":element.IsAccountBased,
        "isCardBased":element.IsCardBased
      }
    }
    this.encodeJsonData.push(JsonObj);
      
    });
    // this.encodeJsonData = [
    //   {
    //     "product_type" : this.encodeParseData[0].Ticket.TicketType.TicketTypeId,
    //     "ticket_id": this.encodeParseData[0].Ticket.TicketId,
    //     "designator": this.encodeParseData[0].Ticket.Designator,
    //     "designator_details":0,
    //     "is_linked_to_user_profile":false,
    //     "balance":this.encodeParseData[0].Ticket.Price,
    //     "isAccountBased":false,
    //     "isCardBased":true
    //     }]
      // [{
      //   "type_expiration":0,
      //   // "add_time":0,
      //   "recharges_pending":0,
      //   "days":31,
      //   "priority_and_condition":5,
      //   "status":"ACTIVE",
      //   "is_prod_bad_listed":false,
      //   "product_type": this.encodeParseData[0].Ticket.TicketType.TicketTypeId,
      //   "ticket_id":this.encodeParseData[0].Ticket.TicketId,
      //   "designator":this.encodeParseData[0].Ticket.Designator,
      //   "designator_details":0,
      //   "start_date_epoch_days":0,
      //   "exp_date_epoch_days":0,
      //   "is_linked_to_user_profile":false,
      //   "sourceZone":0,
      //   "destinationZone":0,
      //   "mfgId":0,
      //   "equipmentType":0,
      //   "equipmentId":0,
      //   "individualLoadSeqNo":0,
      //   "tpbCode":0,
      //   "rangeLoadSeqNo":0,
      //   "fileSize":0,
      //   "accessRights":0,
      //   "fileVersion":0,
      //   "slotNumber":2,
      //   "balance":this.encodeParseData[0].Ticket.Price,
      //   "isRegistered":false,
      //   "start_date":18000000,
      //   "isAutoRechargeBackend":false,
      //   "isAutoRechargePurse1":false,
      //   "isAutoRechargePurse2":false,
      //   "isCardBased":true,
      //   "isAccountBased":false,
      //   "isTpbLock":false,
      //   "exp_date":18000000,
      //   "exp_date_str":"02/03/2019",
      //   "start_date_str":"01/01/1970"
      //   }]

  console.log(this.encodeJsonData);
    if(this.currentCard.products.length == 1 && (this.currentCard.products[0].product_type == 3))
     this.electronService.ipcRenderer.send('encodenewCard', this.currentCard.printed_id ,1,0,0, this.encodeJsonData);
    else
    this.electronService.ipcRenderer.send('encodeExistingCard', this.currentCard.printed_id , this.encodeJsonData);
  }
}
