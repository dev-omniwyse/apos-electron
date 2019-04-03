import { Transaction } from '../models/Transaction';
import { Constants, MediaType, TICKET_GROUP } from './MediaType';
import { ShoppingCartService } from './ShoppingCart.service';
import { Utils } from './Utils.service';
import { Items } from '../models/Items';
import { WalletContentItems } from '../models/WalletContentItems';
import { TicketType } from '../models/TicketType';
import { PaymentType } from '../models/Payments';

export class TransactionService {
    private static _transactionService = new TransactionService();


    public static get getInstance() {
        return TransactionService._transactionService;
    }

    constructor() {

        if (TransactionService._transactionService) {
            throw new Error("Error: Instantiation failed: Use ShoppingCartService.getInstance() instead of new.");
        }
        TransactionService._transactionService = this;
    }

    saveTransaction(shoppingCart, userData) {

        let walletLineItem = shoppingCart._walletLineItem;
        let userProfile = JSON.parse(localStorage.getItem("userProfile"));
        let fareCodeDescription = userProfile;
        debugger
        if (null != walletLineItem && !Utils.getInstance.isValidMerchandise(walletLineItem[0])) {
            walletLineItem.splice(0, 1);

            shoppingCart._walletLineItem = walletLineItem;
        }
        let transaction = new Transaction();
        let transactionAmount = ShoppingCartService.getInstance.getGrandTotal(shoppingCart);
        let taxAmount = ShoppingCartService.getInstance.getTax();
        let timeStamp = shoppingCart._transactionID;

        transaction.$userID = userData.userEmail;
        transaction.$transactionType = Constants.CHARGE;
        transaction.$transactionID = timeStamp;
        transaction.$transactionAmount = transactionAmount;
        transaction.$salesAmount = transactionAmount;
        transaction.$taxAmount = taxAmount;
        transaction.$timestamp = timeStamp;
        transaction.$shiftType = +userData.shiftType;

        let items = [];

        for (let wallet of walletLineItem) {
            let item = new Items();

            if (MediaType.MERCHANDISE_ID == wallet._walletTypeId) {
                console.log("Adding Non-Fare Product transaction.");
                items = this.generateTransactionForMerch(wallet, timeStamp, userData);
            } else if (wallet._walletTypeId == MediaType.SMART_CARD_ID || wallet._walletTypeId == MediaType.MAGNETIC_ID) {

                let walletProductIdentifier = null;
                let walletCost = 0;
                let walletUnitPrice = 0;
                let walletQuantitySold = 0;
                if (wallet._offering) {

                    console.log("Adding wallet transaction.");
                    walletProductIdentifier = wallet._offering.ProductIdentifier;
                    walletCost = wallet._offering.UnitPrice;
                    walletUnitPrice = wallet._unitPrice;
                    debugger
                    if (wallet._isNew) {
                        walletQuantitySold = 1;
                    }

                } else {
                    // Sold products on an existing wallet, not a new wallet
                    walletQuantitySold = 0;
                }
                item.$transactionID = timeStamp;
                item.$cardPID = wallet._cardPID;
                item.$cardUID = wallet._cardUID;
                item.$quantity = walletQuantitySold;
                item.$productIdentifier = walletProductIdentifier;
                item.$ticketTypeId = null;
                item.$ticketValue = 0;
                item.$slotNumber = 0;
                item.$expirationDate = wallet._cardExpiration;
                item.$balance = 0;
                item.$IsMerchandise = false;
                item.$IsBackendMerchandise = false;
                item.$IsFareCard = true;
                item.$unitPrice = walletUnitPrice;
                item.$totalCost = walletCost;
                item.$userID = userData.userID;
                item.$shiftID = userData.shiftID;
                //fareCodeDescription -----
                item.$fareCode = fareCodeDescription;

                item.$walletTypeId = wallet._walletTypeId;

                console.log("wallet.walletTypeId......." + wallet._walletTypeId)
                // special case for Magnetics - record as Products
                if (wallet._walletTypeId == MediaType.MAGNETIC_ID) {
                    item.$IsBackendMerchandise = true;
                }

                item.$shiftType = +userData.shiftType;
                item.$timestamp = timeStamp;

                let walletContentItems = [];
                for (let fareItem of wallet._walletContents) {
                    let walletContentItem = new WalletContentItems();

                    console.log("Adding wallet content transaction.");

                    let totalItemCost = fareItem._unitPrice * fareItem._quantity;

                    let ticketValue = 0;
                    if (fareItem._offering.Ticket.Group == TICKET_GROUP.VALUE) {
                        ticketValue = fareItem._unitPrice;
                    } else {
                        ticketValue = fareItem._offering.Ticket.Value;
                    }

                    walletContentItem.$transactionID = timeStamp;
                    walletContentItem.$quantity = fareItem._quantity;
                    walletContentItem.$ticketTypeId = fareItem._offering.Ticket.TicketType.TicketTypeId;
                    walletContentItem.$ticketValue = ticketValue;
                    walletContentItem.$productIdentifier = fareItem._offering.ProductIdentifier;
                    walletContentItem.$status = fareItem._status;
                    walletContentItem.$slotNumber = fareItem._slot;
                    walletContentItem.$startDate = fareItem._startDate;
                    walletContentItem.$expirationDate = fareItem._expirationDate;
                    walletContentItem.$balance = fareItem._balance;
                    walletContentItem.$rechargesPending = fareItem._rechargesPending;
                    walletContentItem.$IsMerchandise = false;
                    walletContentItem.$IsBackendMerchandise = false;
                    walletContentItem.$IsFareCard = false;
                    walletContentItem.$unitPrice = fareItem._unitPrice;
                    walletContentItem.$totalCost = totalItemCost;
                    walletContentItem.$userID = userData.username;
                    walletContentItem.$shiftID = userData.shiftID;
                    walletContentItem.$fareCode = fareCodeDescription;

                    walletContentItem.$offeringId = fareItem._offering.OfferingId;
                    walletContentItem.$cardPID = wallet._cardPID;
                    walletContentItem.$cardUID = wallet._cardUID;
                    walletContentItem.$walletTypeId = wallet._walletTypeId;
                    walletContentItem.$timestamp = timeStamp;
                    walletContentItem.$shiftType = +userData.shiftType;

                    // special case for Magnetics - record as Products on backend
                    if (wallet._walletTypeId == MediaType.MAGNETIC_ID) {
                        item.$IsBackendMerchandise = true;
                    }
                    walletContentItems.push(walletContentItem);
                }
                item.$walletContentItems = walletContentItems;
            }
            if (MediaType.MERCHANDISE_ID != wallet._walletTypeId) {
                items.push(item);
            }
        }

        transaction.$items = items;

        let payments = [];
        let paymentTypes = shoppingCart._payments;
        for (let item of paymentTypes) {
            let paymentInfo = new PaymentType();
            paymentInfo.$paymentMethodId = item.paymentMethodId;
            paymentInfo.$amount = item.amount;
            paymentInfo.$comment = item.comment;
            payments.push(paymentInfo);
        }
        transaction.$payments = payments;

        return transaction;
    }

    generateTransactionForMerch(wallet, timeStamp, userData) {
        let items = [];
        for (let nonFareItem of wallet._walletContents) {
            let item = new Items();
            let totalTax = nonFareItem._tax * nonFareItem._quantity;
            let totalItemCost = nonFareItem._offering.UnitPrice * nonFareItem._quantity;
            totalItemCost += totalTax;

            item.$transactionID = timeStamp;
            item.$quantity = nonFareItem._quantity;
            item.$productIdentifier = nonFareItem._offering.ProductIdentifier;
            item.$ticketTypeId = null;
            item.$ticketValue = 0;
            item.$slotNumber = 0;
            item.$balance = 0;
            item.$IsMerchandise = true;
            item.$IsBackendMerchandise = true;
            item.$IsFareCard = false;
            item.$unitPrice = nonFareItem._offering.UnitPrice;
            item.$totalCost = totalItemCost;
            item.$userID = userData.userID;
            item.$shiftID = userData.shiftID;
            item.$tax = totalTax;
            item.$fareCode = null;
            item.$timestamp = timeStamp;
            item.$shiftType = +userData.shiftType;

            items.push(item);
        }
        return items;
    }
}