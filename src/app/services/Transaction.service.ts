import { Transaction } from '../models/Transaction';
import { Constants, MediaType, TICKET_GROUP } from './MediaType';
import { ShoppingCartService } from './ShoppingCart.service';
import { Utils } from './Utils.service';
import { Items } from '../models/Items';
import { WalletContentItems } from '../models/WalletContentItems';
import { TicketType } from '../models/TicketType';
import { PaymentType } from '../models/Payments';
import { AccountBaseItems } from '../models/AccountBaseItems';
import { AccountWalletContentItems } from '../models/AccountWalletContentItems';

export class TransactionService {
    private static _transactionService = new TransactionService();


    public static get getInstance() {
        return TransactionService._transactionService;
    }

    constructor() {

        if (TransactionService._transactionService) {
            throw new Error('Error: Instantiation failed: Use ShoppingCartService.getInstance() instead of new.');
        }
        TransactionService._transactionService = this;
    }

    saveTransaction(shoppingCart, userData) {

        const walletLineItem = shoppingCart._walletLineItem;
        const userProfile = JSON.parse(localStorage.getItem('userProfile'));
        const fareCodeDescription = userProfile;
        if (null != walletLineItem && !Utils.getInstance.isValidMerchandise(walletLineItem[0])) {
            walletLineItem.splice(0, 1);

            shoppingCart._walletLineItem = walletLineItem;
        }
        const transaction = new Transaction();
        const transactionAmount = ShoppingCartService.getInstance.getGrandTotal(shoppingCart);
        const taxAmount = ShoppingCartService.getInstance.getNonFareTotalTax(walletLineItem[0]);
        const timeStamp = shoppingCart._transactionID;
        const isAccountBase = localStorage.getItem('isAccountBased') == 'false' ? false : true;
        const selectedAccountBaseCardIndex = Number(localStorage.getItem('selectedAccountBaseCardIndex'));
        const accountDetails = JSON.parse(localStorage.getItem('accountDetails'));
        transaction.$userID = userData.userEmail;
        transaction.$transactionType = Constants.CHARGE;
        transaction.$transactionID = timeStamp;
        transaction.$transactionAmount = transactionAmount;
        transaction.$salesAmount = transactionAmount;
        transaction.$taxAmount = taxAmount;
        transaction.$timestamp = timeStamp;
        transaction.$shiftType = +userData.shiftType;
 
        let items = [];

        for (const wallet of walletLineItem) {
            let item: any;
            item = (!isAccountBase) ? new Items() : new AccountBaseItems();
            if (MediaType.MERCHANDISE_ID == wallet._walletTypeId) {
                console.log('Adding Non-Fare Product transaction.');
                items = this.generateTransactionForMerch(wallet, timeStamp, userData);
            } else if (wallet._walletTypeId == MediaType.SMART_CARD_ID ||
                wallet._walletTypeId == MediaType.MAGNETIC_ID || wallet._walletTypeId == MediaType.LUCC) {

                let walletProductIdentifier = null;
                let walletCost = 0;
                let walletUnitPrice = 0;
                let walletQuantitySold = 0;
                if (wallet._offering) {

                    console.log('Adding wallet transaction.');
                    walletProductIdentifier = wallet._offering.ProductIdentifier;
                    walletCost = wallet._offering.UnitPrice;
                    walletUnitPrice = wallet._unitPrice;
                    if (wallet._isNew) {
                        walletQuantitySold = 1;
                    }

                } else {
                    // Sold products on an existing wallet, not a new wallet
                    walletQuantitySold = 0;
                }
                item.$transactionID = timeStamp;
                item.$cardPID = (isAccountBase) ? selectedAccountBaseCardIndex != -1
                                                ? accountDetails.cards[selectedAccountBaseCardIndex].pid
                                                : Utils.getInstance.isFromAccountBasedCard() ? wallet._cardPID : null
                                                : wallet._cardPID;
                item.$cardUID = (isAccountBase) ? selectedAccountBaseCardIndex != -1
                                                ? accountDetails.cards[selectedAccountBaseCardIndex].eid
                                                : Utils.getInstance.isFromAccountBasedCard() ? wallet._cardUID : null
                                                : wallet._cardUID;
                item.$expirationDate = (isAccountBase) ? selectedAccountBaseCardIndex != -1
                                                ? Number(accountDetails.cards[selectedAccountBaseCardIndex].expiryDate) / 86400000
                                                : Utils.getInstance.isFromAccountBasedCard() ? wallet._cardExpiration : 0
                                                : wallet._cardExpiration;
                // item.$quantity = (isAccountBase) ? 0 : walletQuantitySold;
                item.$quantity = walletQuantitySold;
                // item.$productIdentifier = isAccountBase ? null : walletProductIdentifier;
                item.$productIdentifier =  walletProductIdentifier;
                item.$ticketTypeId = null;
                item.$ticketValue = 0;
                // item.$slotNumber = (isAccountBase) ? 1 : 0;
                item.$slotNumber = 0;
                item.$balance = 0;
                item.$IsMerchandise = false;
                item.$IsBackendMerchandise = false;
                item.$IsFareCard = true;
                // item.$unitPrice = (isAccountBase) ? 0 : walletUnitPrice;
                // item.$totalCost = (isAccountBase) ? 0 : walletCost;
                item.$unitPrice =  walletUnitPrice;
                item.$totalCost = walletCost;
                item.$userID = (isAccountBase) ? userData.userEmail : userData.userID;
                item.$shiftID = userData.shiftID;
                if (isAccountBase) {
                    item.$personId = Number(accountDetails.personId);
                }
                // fareCodeDescription -----
                item.$fareCode = (isAccountBase) ? 'Full' : fareCodeDescription;

                if (!isAccountBase) {
                    item.$walletTypeId = wallet._walletTypeId;
                }

                console.log('wallet.walletTypeId.......' + wallet._walletTypeId);
                // special case for Magnetics - record as Products
                if (wallet._walletTypeId == MediaType.MAGNETIC_ID) {
                    item.$IsBackendMerchandise = true;
                }

                item.$shiftType = +userData.shiftType;
                item.$timestamp = timeStamp;

                const walletContentItemsConst = [];
                for (const fareItem of wallet._walletContents) {
                    let walletContentItem: any;
                    walletContentItem  = (isAccountBase) ? new AccountWalletContentItems() : new WalletContentItems();

                    console.log('Adding wallet content transaction.');

                    const totalItemCost = fareItem._unitPrice * fareItem._quantity;

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
                    walletContentItem.$status = (isAccountBase) ? (fareItem._status == '') ? null : fareItem._status : fareItem._status;
                    walletContentItem.$slotNumber = (isAccountBase) ? 1 : fareItem._slot;
                    walletContentItem.$balance = fareItem._balance;
                    walletContentItem.$IsMerchandise = false;
                    walletContentItem.$IsBackendMerchandise = false;
                    walletContentItem.$IsFareCard = false;
                    walletContentItem.$unitPrice = fareItem._unitPrice;
                    walletContentItem.$totalCost = totalItemCost;
                    walletContentItem.$userID = userData.username;
                    walletContentItem.$userID = (isAccountBase) ? userData.userEmail : userData.userID;
                    walletContentItem.$shiftID = userData.shiftID;
                    walletContentItem.$fareCode = (isAccountBase) ? 'Full' : fareCodeDescription;
                    if (!isAccountBase) {
                        walletContentItem.$walletTypeId = wallet._walletTypeId;
                        walletContentItem.$cardPID = wallet._cardPID;
                        walletContentItem.$cardUID = wallet._cardUID;
                        walletContentItem.$offeringId = fareItem._offering.OfferingId;
                        walletContentItem.$rechargesPending = fareItem._rechargesPending;
                        walletContentItem.$startDate = fareItem._startDate;
                        walletContentItem.$expirationDate = fareItem._expirationDate;
                    }
                    walletContentItem.$timestamp = timeStamp;
                    walletContentItem.$shiftType = +userData.shiftType;

                    // special case for Magnetics - record as Products on backend
                    if (wallet._walletTypeId == MediaType.MAGNETIC_ID) {
                        item.$IsBackendMerchandise = true;
                    }
                    walletContentItemsConst.push(walletContentItem);
                }
                item.$walletContentItems = walletContentItemsConst;
            }
            if (MediaType.MERCHANDISE_ID != wallet._walletTypeId) {
                items.push(item);
            }
        }

        transaction.$items = items;

        const payments = [];
        const paymentTypes = shoppingCart._payments;
        for (const item of paymentTypes) {
            const paymentInfo = new PaymentType();
            paymentInfo.$paymentMethodId = item.paymentMethodId;
            paymentInfo.$amount = item.amount;
            paymentInfo.$comment = item.comment;
            payments.push(paymentInfo);
        }
        transaction.$payments = payments;

        return transaction;
    }

    generateTransactionForMerch(wallet, timeStamp, userData) {
        const items = [];
        for (const nonFareItem of wallet._walletContents) {
            const item = new Items();
            const totalTax = nonFareItem._taxAmount * nonFareItem._quantity;
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
            item.$tax = nonFareItem._taxAmount;
            item.$fareCode = null;
            item.$timestamp = timeStamp;
            item.$shiftType = +userData.shiftType;

            items.push(item);
        }
        return items;
    }
}
