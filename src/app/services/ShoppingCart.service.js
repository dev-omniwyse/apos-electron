"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShoppingCart_1 = require("../models/ShoppingCart");
var ShoppingCartService = /** @class */ (function () {
    function ShoppingCartService() {
        if (ShoppingCartService._shoppingCartService) {
            throw new Error("Error: Instantiation failed: Use ShoppingCartService.getInstance() instead of new.");
        }
        ShoppingCartService._shoppingCartService = this;
    }
    Object.defineProperty(ShoppingCartService, "getInstance", {
        get: function () {
            return ShoppingCartService._shoppingCartService;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShoppingCartService.prototype, "shoppingCart", {
        /**
         * Getter shoppingCart
         * @return {ShoppingCart}
         */
        get: function () {
            return this._shoppingCart;
        },
        /**
         * Setter shoppingCart
         * @param {ShoppingCart} value
         */
        set: function (value) {
            this._shoppingCart = value;
        },
        enumerable: true,
        configurable: true
    });
    ShoppingCartService.prototype.createLocalStoreForShoppingCart = function () {
        var shoppingCart = new ShoppingCart_1.ShoppingCart();
        shoppingCart.walletLineItem = [];
        shoppingCart.activeCardUID = "";
        this._shoppingCart = shoppingCart;
        return this._shoppingCart;
        // localStorage.setItem('shoppingCart', JSON.stringify(this._shoppingCart));
    };
    ShoppingCartService.prototype.setCart = function (data) {
        localStorage.setItem('shoppingCart', JSON.stringify(data));
    };
    ShoppingCartService.prototype.getCart = function () {
        var item = JSON.parse(localStorage.getItem('shoppingCart'));
        return item;
    };
    ShoppingCartService.prototype.clearCart = function () {
        localStorage.removeItem('shoppingCart');
        this.emptyCart();
    };
    ShoppingCartService.prototype.emptyCart = function () {
        this._shoppingCart = null;
    };
    ShoppingCartService._shoppingCartService = new ShoppingCartService();
    return ShoppingCartService;
}());
exports.ShoppingCartService = ShoppingCartService;
