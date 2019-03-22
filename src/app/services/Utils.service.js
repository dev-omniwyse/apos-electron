"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShoppingCart_service_1 = require("./ShoppingCart.service");
var Farecard_service_1 = require("./Farecard.service");
var MediaType_1 = require("./MediaType");
var Utils = /** @class */ (function () {
    function Utils() {
        if (Utils._utilService) {
            throw new Error("Error: Instantiation failed: Use Utils.getInstance() instead of new.");
        }
        Utils._utilService = this;
    }
    Object.defineProperty(Utils, "getInstance", {
        get: function () {
            return Utils._utilService;
        },
        enumerable: true,
        configurable: true
    });
    Utils.prototype.isShoppingCartEmpty = function (shoppingCart) {
        var isEmpty = false;
        if (shoppingCart.walletLineItem == null || shoppingCart.walletLineItem == [] || shoppingCart.walletLineItem == undefined) {
            isEmpty = true;
        }
        if (shoppingCart.productLineItem == null || shoppingCart.productLineItem == [] || shoppingCart.productLineItem == undefined) {
            isEmpty = true;
        }
        return isEmpty;
    };
    Utils.prototype.generateSequenceNumberForWalletLineItem = function () {
        var currentMaxSequenceNumber = 0;
        var cart = ShoppingCart_service_1.ShoppingCartService.getInstance.getCart();
        for (var _i = 0, _a = cart.walletLineItem; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.sequenceNumber && item.sequenceNumber > currentMaxSequenceNumber) {
                currentMaxSequenceNumber = item.sequenceNumber;
            }
        }
        var nextMaxSequenceNumber = currentMaxSequenceNumber + 1;
        return nextMaxSequenceNumber;
    };
    Utils.prototype.generateSequenceNumberForWalletContent = function (cardPID) {
        var walletContents = Farecard_service_1.FareCardService.getInstance.getWalletContentsForGivenUID(cardPID);
        var seqNumber = walletContents.length + 1;
        return seqNumber;
    };
    //product limits - 
    Utils.prototype.genearateMagneticSequenceNumber = function () {
        var shoppingCart = ShoppingCart_service_1.ShoppingCartService.getInstance.getCart();
        var currentSequence = 0;
        for (var _i = 0, _a = shoppingCart.walletLineItem; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.walletTypeId == MediaType_1.MediaType.MAGNETIC_ID) {
                currentSequence++;
            }
        }
        return (currentSequence + 1);
    };
    Utils.prototype.getActiveWalletLineItem = function () {
        var cart = ShoppingCart_service_1.ShoppingCartService.getInstance.getCart();
        var lastIndex = cart.walletLineItem.length - 1;
        return cart[lastIndex];
    };
    Utils._utilService = new Utils();
    return Utils;
}());
exports.Utils = Utils;
