"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WalletType = /** @class */ (function () {
    function WalletType(_walletTypeId, _description, _monthsToExpire) {
        this._walletTypeId = _walletTypeId;
        this._description = _description;
        this._monthsToExpire = _monthsToExpire;
    }
    Object.defineProperty(WalletType.prototype, "walletTypeId", {
        /**
         * Getter walletTypeId
         * @return {number}
         */
        get: function () {
            return this._walletTypeId;
        },
        /**
         * Setter walletTypeId
         * @param {number} value
         */
        set: function (value) {
            this._walletTypeId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletType.prototype, "description", {
        /**
         * Getter description
         * @return {string}
         */
        get: function () {
            return this._description;
        },
        /**
         * Setter description
         * @param {string} value
         */
        set: function (value) {
            this._description = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletType.prototype, "monthsToExpire", {
        /**
         * Getter monthsToExpire
         * @return {number}
         */
        get: function () {
            return this._monthsToExpire;
        },
        /**
         * Setter monthsToExpire
         * @param {number} value
         */
        set: function (value) {
            this._monthsToExpire = value;
        },
        enumerable: true,
        configurable: true
    });
    return WalletType;
}());
exports.WalletType = WalletType;
