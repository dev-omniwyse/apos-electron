import { WalletLineItem } from '../models/WalletLineItem';
import { WalletContent } from '../models/WalletContent';
import { MediaType, Constants } from './MediaType';
import { ShoppingCart } from '../models/ShoppingCart';
import { Utils } from './Utils.service';
import { ShoppingCartService } from './ShoppingCart.service';



export class FareCardService {

    private static _fareCardService = new FareCardService();

    public static get getInstance() {
        return FareCardService._fareCardService;
    }

    constructor() {

        if (FareCardService._fareCardService) {
            throw new Error("Error: Instantiation failed: Use FareCardService.getInstance() instead of new.");
        }
        FareCardService._fareCardService = this;
    }
    /***
     * created shoppingcart object here. in future we need to change 
     */
    // shoppingCart = ShoppingCartService.getInstance.createLocalStoreForShoppingCart();

    //add Offering to WalletContent
    addFareProduct(shoppingCart, offering, walletLineItem) {

        // FareCardService.getInstance.getWalletContentsForGivenUID(walletLineItem.cardPID);
        let walletContents = walletLineItem.walletContents;
        console.log("Found Walletcontents for this cardUID are :");
        let index = FareCardService.getInstance.isExistingOfferingForThisWallet(offering, walletContents)
        if (-1 != index) {
            console.log("Is Existing Offering? increase qunatity.");
            walletContents = FareCardService.getInstance.updateOfferingCountForThisWallet(offering, walletContents, index);
        } else {
            console.log("adding wallet content..");
            let walletContent = new WalletContent();

            walletContent.cardUID = walletLineItem.cardUID;
            walletContent.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletContent(shoppingCart, walletLineItem.cardPID);
            walletContent.offering = offering;
            walletContent.unitPrice = offering.UnitPrice;
            walletContent.description = offering.Description;
            walletContent.quantity = 1;
            walletContent.status = "";
            walletContent.slot = 0;
            walletContent.balance = 0.0;
            walletContent.startDate = 0;
            walletContent.expirationDate = 0;
            walletContent.rechargesPending = 0;

            walletContents.push(walletContent);

        }
        shoppingCart._walletContents = walletContents;
        return shoppingCart;
    }

    isExistingOfferingForThisWallet(offering, walletContents) {
        let index = -1;
        for (let a = 0; a < walletContents.length; a++) {
            if (walletContents[a].offering.offeringId == offering.offeringId) {
                index = a;
                break;
            }
        }
        return index;
    }

    updateOfferingCountForThisWallet(offering, walletContents, index) {
        console.log("request for updating wallet contents");
        console.log("Index of duplicate element is :" + index);
        // walletContents[index].sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletContent(walletContents.cardPID);
        walletContents[index].unitPrice = walletContents[index].unitPrice + offering.UnitPrice;
        walletContents[index].quantity = walletContents[index].quantity + 1;
        return walletContents;
    }

    getWalletContentsForGivenUID(shoppingCart, activePID) {
        let walletContents = null;
        let walletLineItems = null == shoppingCart._walletLineItem ? [] : shoppingCart._walletLineItem;
        //refactor..
        for (let i = 0; i < walletLineItems.length; i++) {
            if (walletLineItems[i].cardPID == activePID) {
                walletContents = walletLineItems[i].walletContents;
                break;
            }
        }
        return walletContents;
    }


    //add smart card data - WalletLineItem
    addSmartCard(shoppingCart, readCardJSON, offeringJSONArray) {

        /***
         * 1. create local storage
         * 2. push Non fare by default
         * 3. then add smartCart
         */
        // ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        if (null == shoppingCart._walletLineItem[0]) {
            shoppingCart = FareCardService.getInstance.addNonFareWallet(shoppingCart);
        }

        let offering = FareCardService.getInstance.getOfferingBasedOnWalletTypeID(offeringJSONArray, MediaType.SMART_CARD_ID);
        let walletC = [];
        /**
         * if card is new then add price else say it as 0;
         */
        let fareCardPrice = 0;
        if (this.isNew) {
            fareCardPrice = offering.UnitPrice;
        }
        // let walletLineItem = new WalletLineItem(Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart), offering,
        //     readCardJSON.printed_id, readCardJSON.uid, MediaType.SMART_CARD_ID, readCardJSON.user_profile, fareCardPrice,
        //     "New " + offering.Description, walletC, readCardJSON.card_expiration_date, false);


        let walletLineItem = new WalletLineItem();
        shoppingCart._activeCardUID = readCardJSON.uid;

        walletLineItem.cardPID = readCardJSON.printed_id;
        walletLineItem.cardUID = readCardJSON.uid;
        walletLineItem.cardExpiration = readCardJSON.card_expiration_date;
        walletLineItem.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart);
        walletLineItem.offering = offering;
        walletLineItem.walletTypeId = MediaType.SMART_CARD_ID;
        walletLineItem.fareCodeId = readCardJSON.user_profile;
        walletLineItem.unitPrice = fareCardPrice;
        walletLineItem.description = "New " + offering.Description;
        walletLineItem.walletContents = walletC;
        walletLineItem.encoded = false;
        shoppingCart._walletLineItem.push(walletLineItem);

        return shoppingCart;
    }

    addNonFareWallet(shoppingCart) {
        // get shoppingcartJSON
        let walletLineItem = new WalletLineItem();

        walletLineItem.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart);
        walletLineItem.offering = null;
        walletLineItem.unitPrice = 0;
        walletLineItem.description = Constants.MERCHANDISE_TEXT;
        walletLineItem.walletTypeId = MediaType.MERCHANDISE_ID;
        walletLineItem.cardPID = Constants.MERCHANDISE_TEXT;


        shoppingCart._walletLineItem.push(walletLineItem);
        return shoppingCart;
    }

    isNew() {
        /**
         * From Electron code take instance of posApplet and call processAutoload method put whole logic here.
         */
        // processAutoload();

        var isCardNew = true;

    }

    getOfferingBasedOnWalletTypeID(offeringJSONArray, walletTypeID) {

        console.log("inside getOfferingBasedOnWalletTypeID");
        let offeringFound = null;
        for (let o of offeringJSONArray) {
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
        let offering = FareCardService.getInstance.getOfferingBasedOnWalletTypeID(offeringJSONArray, MediaType.MAGNETIC_ID);
        console.log("Found offering");
        let walletC = [];
        let walletLineItem = new WalletLineItem();
        let text = Constants.MAGNETICS_TEXT + Utils.getInstance.genearateMagneticSequenceNumber(shoppingCart);

        walletLineItem.cardPID = text;
        walletLineItem.cardUID = new Date().getTime().toString();
        walletLineItem.cardExpiration = 0;
        walletLineItem.sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletLineItem(shoppingCart);
        walletLineItem.offering = offering;
        walletLineItem.walletTypeId = MediaType.MAGNETIC_ID;
        walletLineItem.fareCodeId = 0;
        walletLineItem.unitPrice = offering.UnitPrice;
        walletLineItem.description = Constants.MAGNETICS_TEXT;
        walletLineItem.walletContents = walletC;
        walletLineItem.encoded = false;
        shoppingCart._walletLineItem.push(walletLineItem);

        return shoppingCart;
    }


    getWalletLineItemForCardUID(shoppingCart, cardUID) {
        let walletLineItem = null;
        for (let i = 0; i < shoppingCart._walletLineItem.length; i++) {
            if (shoppingCart._walletLineItem[i].cardUID == cardUID) {
                walletLineItem = shoppingCart._walletLineItem[i];
                break;
            }
        }
        return walletLineItem;
    }

    //list of walletLinItems

    getListOfWalletLineItems() {

    }

    //get magneticCountIndex

    //getSubtotal for cardUID

    //getTotalFor CardUID

}