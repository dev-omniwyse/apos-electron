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

    saveTransaction(shoppingCart, userData, paymentTypes) {

        let transaction = new Transaction();
        let transactionAmount = ShoppingCartService.getInstance.getGrandTotal(shoppingCart);
        let taxAmount = ShoppingCartService.getInstance.getTax();
        let timeStamp = new Date().getTime();

        transaction.$userID = userData.userName;
        transaction.$transactionType = Constants.CHARGE;
        transaction.$transactionID = timeStamp;
        transaction.$transactionAmount = transactionAmount;
        transaction.$salesAmount = transactionAmount;
        transaction.$taxAmount = taxAmount;
        transaction.$timestamp = timeStamp;

        let items = [];
        let walletLineItem = shoppingCart._walletLineItem;
        for (let wallet of walletLineItem) {
            let item = new Items();

            if (wallet._walletTypeId == MediaType.MERCHANDISE_ID && null != wallet._walletContents && [] != wallet._walletContents) {
                console.log("Adding Non-Fare Product transaction.");

                for (let nonFareItem of wallet._walletContents) {
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
                    item.$shiftType = userData.shiftType;
                }
            } else if (wallet._walletTypeId == MediaType.SMART_CARD_ID || wallet._walletTypeId == MediaType.MAGNETIC_ID) {

                let walletProductIdentifier = null;
                let walletCost = 0;
                let walletUnitPrice = 0;
                let walletQuantitySold = 1;

                let fareCodeDescription = "";
                if (wallet._offering) {

                    console.log("Adding wallet transaction.");
                    walletProductIdentifier = wallet._offering.ProductIdentifier;
                    walletCost = wallet._offering.UnitPrice;
                    walletUnitPrice = wallet._unitPrice;

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

                item.$walletTypeId = wallet.walletTypeId;

                console.log("wallet.walletTypeId......." + wallet._walletTypeId)
                // special case for Magnetics - record as Products
                if (wallet._walletTypeId == MediaType.MAGNETIC_ID) {
                    item.$IsBackendMerchandise = true;
                }

                item.$shiftType = userData.shiftType;
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
                    walletContentItem.$quantity = fareItem._offering.ProductIdentifier;
                    walletContentItem.$ticketTypeId = fareItem._offering.Ticket.TicketType.TicketTypeId;
                    walletContentItem.$ticketValue = ticketValue;
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
                    walletContentItem.$shiftType = userData.shiftID;

                    // special case for Magnetics - record as Products on backend
                    if (wallet._walletTypeId == MediaType.MAGNETIC_ID) {
                        item.$IsBackendMerchandise = true;
                    }
                    walletContentItems.push(walletContentItem);
                }
                item.$walletContentItems = walletContentItems;
            }
            items.push(item);
        }

        transaction.$items = items;

        let payments = [];

        for(let item of paymentTypes){
            let paymentTypeText = Utils.getInstance.getPaymentTypeString(item.id);
            let paymentInfo = new PaymentType();
            paymentInfo.$paymentMethodId = item.id;
            paymentInfo.$amount = paymentTypeText;

            payments.push(paymentInfo);
        }
        transaction.$payments = payments;

        return transaction;
    }
}