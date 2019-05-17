import { WalletLineItem } from '../models/WalletLineItem';
import { WalletContent } from '../models/WalletContent';
import { MediaType, Constants } from './MediaType';
import { ShoppingCart } from '../models/ShoppingCart';
import { Utils } from './Utils.service';
import { ShoppingCartService } from './ShoppingCart.service';
import { read } from 'fs';



export class FareCardService {

    private static _fareCardService = new FareCardService();

    public static get getInstance() {
        return FareCardService._fareCardService;
    }

    constructor() {

        if (FareCardService._fareCardService) {
            throw new Error('Error: Instantiation failed: Use FareCardService.getInstance() instead of new.');
        }
        FareCardService._fareCardService = this;
    }
    /***
     * created shoppingcart object here. in future we need to change
     */
    // shoppingCart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();

    // add Offering to WalletContent
    addFareProduct(shoppingCart, offering, walletLineItem, requestFromCustomOffering) {

        // FareCardService.getInstance.getWalletContentsForGivenUID(walletLineItem.cardPID);
        const indexOfWalletInShoppingCart = ShoppingCartService.getInstance.getIndexOfWalletLineItem(shoppingCart, walletLineItem);
        let walletContents = walletLineItem._walletContents;
        console.log('Found Walletcontents for this cardUID are :');
        const index = FareCardService.getInstance.getWalletContentIndexForOffering(offering, walletContents);
        if (-1 != index) {
            console.log('Is Existing Offering? increase qunatity.');
            walletContents = FareCardService.getInstance.updateOfferingCountForThisWallet(offering,
                walletContents, index, requestFromCustomOffering);
            shoppingCart._walletLineItem[indexOfWalletInShoppingCart]._walletContents = walletContents;
            walletLineItem._walletContents = shoppingCart._walletLineItem[indexOfWalletInShoppingCart]._walletContents;
        } else {
            console.log('adding wallet content..');
            const walletContent = new WalletContent();

            walletContent.cardUID = walletLineItem._cardUID;
            walletContent.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletContent(walletLineItem);
            walletContent.offering = offering;
            walletContent.unitPrice = offering.UnitPrice;
            walletContent.description = offering.Description;
            walletContent.quantity = 1;
            walletContent.status = '';
            walletContent.slot = 0;
            walletContent.balance = 0.0;
            walletContent.startDate = 0;
            walletContent.expirationDate = 0;
            walletContent.rechargesPending = 0;
            if (MediaType.MERCHANDISE_ID == walletLineItem._walletTypeId) {
                if (offering.TaxRate != undefined) {
                    walletContent.taxRate = offering.TaxRate;
                    walletContent.taxAmount = +(offering.UnitPrice * (offering.TaxRate) / 100).toFixed(2);
                } else {
                    walletContent.taxRate = 0.00;
                    walletContent.taxAmount = 0.00;
                }
            }
            shoppingCart._walletLineItem[indexOfWalletInShoppingCart]._walletContents.push(walletContent);
            walletLineItem._walletContents = shoppingCart._walletLineItem[indexOfWalletInShoppingCart]._walletContents;
        }

        return shoppingCart;
    }

    getWalletContentIndexForOffering(offering, walletContents) {
        let index = -1;
        for (let wcIndex = 0; wcIndex < walletContents.length; wcIndex++) {
            if (walletContents[wcIndex]._offering.OfferingId == offering.OfferingId) {
                index = wcIndex;
                break;
            }
        }
        return index;
    }

    updateOfferingCountForThisWallet(offering, walletContents, index, isCustomOffering) {
        console.log('request for updating wallet contents');
        console.log('Index of duplicate element is :' + index);
        if (isCustomOffering) {
            walletContents[index]._unitPrice = walletContents[index]._unitPrice + offering.UnitPrice;
        } else {
            walletContents[index]._quantity = walletContents[index]._quantity + 1;
        }
        return walletContents;
    }

    // add smart card data - WalletLineItem
    addSmartCard(shoppingCart, readCardJSON, offeringJSONArray, isNew) {

        /***
         * 1. create local storage
         * 2. push Non fare by default
         * 3. then add smartCart
         */
        // ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        if (null == shoppingCart._walletLineItem[0]) {
            shoppingCart = FareCardService.getInstance.addNonFareWallet(shoppingCart);
        }

        const offering = FareCardService.getInstance.getOfferingBasedOnWalletTypeID(offeringJSONArray, MediaType.SMART_CARD_ID);
        const walletC = [];
        /**
         * if card is new then add price else say it as 0;
         */
        let fareCardPrice = 0;
        let description = ' ';
        if (isNew) {
            fareCardPrice = offering.UnitPrice;
            description = 'New ' + offering.Description + ' $' + offering.UnitPrice.toFixed(0);
        } else {
            fareCardPrice = 0;
            description = '1 Card:' + ' ' + readCardJSON.printed_id;
        }
        // let walletLineItem = new WalletLineItem(Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart), offering,
        //     readCardJSON.printed_id, readCardJSON.uid, MediaType.SMART_CARD_ID, readCardJSON.user_profile, fareCardPrice,
        //     "New " + offering.Description, walletC, readCardJSON.card_expiration_date, false);

        const walletLineItem = new WalletLineItem();
        shoppingCart._activeCardUID = readCardJSON.uid;

        walletLineItem.cardPID = readCardJSON.printed_id;
        walletLineItem.cardUID = readCardJSON.uid;
        walletLineItem.cardExpiration = readCardJSON.card_expiration_date;
        walletLineItem.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart);
        walletLineItem.offering = offering;
        walletLineItem.walletTypeId = MediaType.SMART_CARD_ID;
        walletLineItem.fareCodeId = readCardJSON.user_profile;
        walletLineItem.unitPrice = fareCardPrice;
        walletLineItem.description = description;
        walletLineItem.walletContents = walletC;
        walletLineItem.encoded = false;
        walletLineItem.isNew = isNew;
        shoppingCart._walletLineItem.push(walletLineItem);

        return shoppingCart;
    }
    addUltraLightCard(shoppingCart, readCardJSON, offeringJSONArray, isNew) {
        if (null == shoppingCart._walletLineItem[0]) {
            shoppingCart = FareCardService.getInstance.addNonFareWallet(shoppingCart);
        }

        const offering = FareCardService.getInstance.getOfferingBasedOnWalletTypeID(offeringJSONArray, MediaType.LUCC);
        const walletC = [];
        let fareCardPrice = 0;
        let description = ' ';
        if (isNew) {
            fareCardPrice = offering.UnitPrice;
            description = 'New ' + offering.Description + ' $' + offering.UnitPrice.toFixed(0);
        } else {
            fareCardPrice = 0;
            description = '1 Card:' + ' ' + readCardJSON.printed_id;
        }
        const walletLineItem = new WalletLineItem();
        shoppingCart._activeCardUID = readCardJSON.uid;

        walletLineItem.cardPID = readCardJSON.printed_id;
        walletLineItem.cardUID = readCardJSON.uid;
        walletLineItem.cardExpiration = readCardJSON.card_expiration_date;
        walletLineItem.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart);
        walletLineItem.offering = offering;
        walletLineItem.walletTypeId = MediaType.LUCC;
        walletLineItem.fareCodeId = readCardJSON.user_profile;
        walletLineItem.unitPrice = fareCardPrice;
        walletLineItem.description = description;
        walletLineItem.walletContents = walletC;
        walletLineItem.encoded = false;
        walletLineItem.isNew = isNew;
        shoppingCart._walletLineItem.push(walletLineItem);

        return shoppingCart;
    }
    addNonFareWallet(shoppingCart) {
        // get shoppingcartJSON
        const walletLineItem = new WalletLineItem();

        walletLineItem.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart);
        walletLineItem.offering = null;
        walletLineItem.unitPrice = 0;
        walletLineItem.description = Constants.MERCHANDISE_TEXT;
        walletLineItem.walletTypeId = MediaType.MERCHANDISE_ID;
        walletLineItem.cardPID = Constants.MERCHANDISE_TEXT;
        walletLineItem.walletContents = [];

        shoppingCart._walletLineItem.push(walletLineItem);
        return shoppingCart;
    }

    isNew() {
        /**
         * From Electron code take instance of posApplet and call processAutoload method put whole logic here.
         */
        // processAutoload();

        let isCardNew = true;

    }

    getOfferingBasedOnWalletTypeID(offeringJSONArray, walletTypeID) {

        console.log('inside getOfferingBasedOnWalletTypeID');
        let offeringFound = null;
        for (const o of offeringJSONArray) {
            if (!o.IsMerchandise && o.WalletType != null && o.Ticket == null && o.WalletType.WalletTypeId == walletTypeID) {
                offeringFound = o;
                break;
            }
        }
        return offeringFound;
    }

    //add smart card data - WalletLineItem
    addMagneticsCard(shoppingCart, offeringJSONArray) {

        if (null == shoppingCart._walletLineItem[0]) {
            shoppingCart = FareCardService.getInstance.addNonFareWallet(shoppingCart);
        }
        const offering = FareCardService.getInstance.getOfferingBasedOnWalletTypeID(offeringJSONArray, MediaType.MAGNETIC_ID);
        console.log('Found offering');
        const walletC = [];
        const walletLineItem = new WalletLineItem();
        const text = Constants.MAGNETICS_TEXT + Utils.getInstance.genearateMagneticSequenceNumber(shoppingCart);

        walletLineItem.cardPID = text;
        walletLineItem.cardUID = new Date().getTime().toString();
        walletLineItem.cardExpiration = 0;
        walletLineItem.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart);
        walletLineItem.offering = offering;
        walletLineItem.walletTypeId = MediaType.MAGNETIC_ID;
        walletLineItem.fareCodeId = 0;
        walletLineItem.unitPrice = offering.UnitPrice;
        walletLineItem.description = 1 + 'New Magnetics';
        walletLineItem.walletContents = walletC;
        walletLineItem.encoded = false;
        walletLineItem.isNew = true;
        shoppingCart._walletLineItem.push(walletLineItem);

        return shoppingCart;
    }


}
