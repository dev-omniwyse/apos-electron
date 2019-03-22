"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShoppingCart = /** @class */ (function () {
    function ShoppingCart(_walletLineItem, _activeCardUID) {
        this._walletLineItem = _walletLineItem;
        this._activeCardUID = _activeCardUID;
    }
    Object.defineProperty(ShoppingCart.prototype, "walletLineItem", {
        /**
         * Getter walletLineItem
         * @return {WalletLineItem[]}
         */
        get: function () {
            return this._walletLineItem;
        },
        /**
         * Setter walletLineItem
         * @param {WalletLineItem[]} value
         */
        set: function (value) {
            this._walletLineItem = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShoppingCart.prototype, "activeCardUID", {
        /**
         * Getter activeCardUID
         * @return {string}
         */
        get: function () {
            return this._activeCardUID;
        },
        /**
         * Setter activeCardUID
         * @param {string} value
         */
        set: function (value) {
            this._activeCardUID = value;
        },
        enumerable: true,
        configurable: true
    });
    return ShoppingCart;
}());
exports.ShoppingCart = ShoppingCart;
