"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WalletLineItem_1 = require("../models/WalletLineItem");
var WalletContent_1 = require("../models/WalletContent");
var MediaType_1 = require("./MediaType");
var Utils_service_1 = require("./Utils.service");
var ShoppingCart_service_1 = require("./ShoppingCart.service");
var FareCardService = /** @class */ (function() {
    function FareCardService() {
        /***
         * created shoppingcart object here. in future we need to change
         */
        this.shoppingCart = ShoppingCart_service_1.ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        if (FareCardService._fareCardService) {
            throw new Error("Error: Instantiation failed: Use FareCardService.getInstance() instead of new.");
        }
        FareCardService._fareCardService = this;
    }
    Object.defineProperty(FareCardService, "getInstance", {
        get: function() {
            return FareCardService._fareCardService;
        },
        enumerable: true,
        configurable: true
    });
    //add Offering to WalletContent
    FareCardService.prototype.addFareProduct = function(offering, walletLineItem) {
        // FareCardService.getInstance.getWalletContentsForGivenUID(walletLineItem.cardPID);
        var walletContents = walletLineItem.walletContents;
        console.log("Found Walletcontents for this cardUID are :");
        var index = FareCardService.getInstance.isExistingOfferingForThisWallet(offering, walletContents);
        if (-1 != index) {
            console.log("Is Existing Offering? increase qunatity.");
            FareCardService.getInstance.updateOfferingCountForThisWallet(offering, walletContents, index);
        } else {
            console.log("adding wallet content..");
            var walletContent = new WalletContent_1.WalletContent();
            walletContent.cardUID = walletLineItem.cardUID;
            walletContent.sequenceNumber = Utils_service_1.Utils.getInstance.generateSequenceNumberForWalletContent(walletLineItem.cardPID);
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
        return this.shoppingCart;
    };
    FareCardService.prototype.isExistingOfferingForThisWallet = function(offering, walletContents) {
        var index = -1;
        for (var a = 0; a < walletContents.length; a++) {
            if (walletContents[a].offering.offeringId == offering.offeringId) {
                index = a;
                break;
            }
        }
        return index;
    };
    FareCardService.prototype.updateOfferingCountForThisWallet = function(offering, walletContents, index) {
        console.log("request for updating wallet contents");
        console.log("Index of duplicate element is :" + index);
        // walletContents[index].sequenceNumber = Utils.getInstance.generateSequenceNumberForWalletContent(walletContents.cardPID);
        walletContents[index].unitPrice = walletContents[index].unitPrice + offering.UnitPrice;
        walletContents[index].quantity = walletContents[index].quantity + 1;
    };
    FareCardService.prototype.getWalletContentsForGivenUID = function(activePID) {
        var walletContents = null;
        var walletLineItems = null == this.shoppingCart.walletLineItem ? [] : this.shoppingCart.walletLineItem;
        //refactor..
        for (var i = 0; i < walletLineItems.length; i++) {
            if (walletLineItems[i].cardPID == activePID) {
                walletContents = walletLineItems[i].walletContents;
                break;
            }
        }
        return walletContents;
    };
    //add smart card data - WalletLineItem
    FareCardService.prototype.addSmartCard = function(readCardJSON, offeringJSONArray) {
        /***
         * 1. create local storage
         * 2. push Non fare by default
         * 3. then add smartCart
         */
        // ShoppingCartService.getInstance.createLocalStoreForShoppingCart();
        if (null == ShoppingCart_service_1.ShoppingCartService.getInstance.getCart()) {
            FareCardService.getInstance.addNonFareWallet();
        }
        var offering = FareCardService.getInstance.getOfferingBasedOnWalletTypeID(offeringJSONArray, MediaType_1.MediaType.SMART_CARD_ID);
        var walletC = [];
        /**
         * if card is new then add price else say it as 0;
         */
        var fareCardPrice = 0;
        if (this.isNew) {
            fareCardPrice = offering.UnitPrice;
        }
        var walletLineItem = new WalletLineItem_1.WalletLineItem();
        this.shoppingCart.activeCardUID = readCardJSON.uid;
        walletLineItem.cardPID = readCardJSON.printed_id;
        walletLineItem.cardUID = readCardJSON.uid;
        walletLineItem.cardExpiration = readCardJSON.card_expiration_date;
        walletLineItem.sequenceNumber = Utils_service_1.Utils.getInstance.generateSequenceNumberForWalletLineItem();
        walletLineItem.offering = offering;
        walletLineItem.walletTypeId = MediaType_1.MediaType.SMART_CARD_ID;
        walletLineItem.fareCodeId = readCardJSON.user_profile;
        walletLineItem.unitPrice = fareCardPrice;
        walletLineItem.description = "New " + offering.Description;
        walletLineItem.walletContents = walletC;
        walletLineItem.encoded = false;
        return this.shoppingCart.walletLineItem.push(walletLineItem);
    };
    FareCardService.prototype.addNonFareWallet = function() {
        // get shoppingcartJSON
        var walletLineItem = new WalletLineItem_1.WalletLineItem();
        walletLineItem.sequenceNumber = Utils_service_1.Utils.getInstance.generateSequenceNumberForWalletLineItem();
        walletLineItem.offering = null;
        walletLineItem.unitPrice = 0;
        walletLineItem.description = MediaType_1.Constants.MERCHANDISE_TEXT;
        walletLineItem.walletTypeId = MediaType_1.MediaType.MERCHANDISE_ID;
        this.shoppingCart.walletLineItem.push(walletLineItem);
        return this.shoppingCart;
    };
    FareCardService.prototype.isNew = function() {
        /**
         * From Electron code take instance of posApplet and call processAutoload method put whole logic here.
         */
        // processAutoload();
        var isCardNew = true;
    };
    FareCardService.prototype.getOfferingBasedOnWalletTypeID = function(offeringJSONArray, walletTypeID) {
        console.log("inside getOfferingBasedOnWalletTypeID");
        var offeringFound = null;
        for (var _i = 0, offeringJSONArray_1 = offeringJSONArray; _i < offeringJSONArray_1.length; _i++) {
            var o = offeringJSONArray_1[_i];
            if (!o.IsMerchandise && o.WalletType != null && o.Ticket == null && o.WalletType.WalletTypeId == walletTypeID) {
                offeringFound = o;
                break;
            }
        }
        return offeringFound;
    };
    //add smart card data - WalletLineItem
    FareCardService.prototype.addMagneticsCard = function(offeringJSONArray) {
        var offering = FareCardService.getInstance.getOfferingBasedOnWalletTypeID(offeringJSONArray, MediaType_1.MediaType.MAGNETIC_ID);
        console.log("Found offering");
        var walletC = [];
        var walletLineItem = new WalletLineItem_1.WalletLineItem();
        var text = MediaType_1.Constants.MAGNETICS_TEXT + Utils_service_1.Utils.getInstance.genearateMagneticSequenceNumber();
        if (Utils_service_1.Utils.getInstance.isShoppingCartEmpty(this.shoppingCart)) {
            this.shoppingCart.walletLineItem = [];
            this.shoppingCart.activeCardUID = text;
        }
        walletLineItem.cardPID = text;
        walletLineItem.cardUID = new Date().getTime().toString();
        walletLineItem.cardExpiration = 0;
        walletLineItem.sequenceNumber = Utils_service_1.Utils.getInstance.generateSequenceNumberForWalletLineItem();
        walletLineItem.offering = offering;
        walletLineItem.walletTypeId = MediaType_1.MediaType.MAGNETIC_ID;
        walletLineItem.fareCodeId = 0;
        walletLineItem.unitPrice = offering.UnitPrice;
        walletLineItem.description = MediaType_1.Constants.MAGNETICS_TEXT;
        walletLineItem.walletContents = walletC;
        walletLineItem.encoded = false;
        return this.shoppingCart.walletLineItem.push(walletLineItem);
    };
    FareCardService.prototype.getWalletLineItemForCardUID = function(cardUID) {
        var walletLineItem = null;
        for (var i = 0; i < this.shoppingCart.walletLineItem.length; i++) {
            if (this.shoppingCart.walletLineItem[i].cardUID == cardUID) {
                walletLineItem = this.shoppingCart.walletLineItem[i];
                break;
            }
        }
        return walletLineItem;
    };
    FareCardService._fareCardService = new FareCardService();
    return FareCardService;
}());
exports.FareCardService = FareCardService;