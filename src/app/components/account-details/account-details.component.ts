import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent implements OnInit {
  public isShowCardOptions: Boolean = true;
  accountDetails: any = [];
  accountDescription = ['Account Status', 'Account Balance', 'Active Cards'];

  constructor(private router: Router) { }

  ngOnInit() {
    this.accountDetails = JSON.parse(localStorage.getItem('accountDetails'));
    console.log(this.accountDetails);
    this.populateAccountDetails();
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
      this.accountDetails.accountInfo.push({description: this.accountDescription[i], value: accountDescriptionValue});
    }
  }
  addProduct() {
    this.router.navigate(['/addproduct']);
  }
  Back() {
    this.router.navigate(['/home']);
  }
}
