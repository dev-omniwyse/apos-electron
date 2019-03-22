"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WalletLineItem = /** @class */ (function () {
    function WalletLineItem(_sequenceNumber, _offering, _cardPID, _cardUID, _walletTypeId, _fareCodeId, _unitPrice, _description, _walletContents, _cardExpiration, _encoded) {
        this._sequenceNumber = _sequenceNumber;
        this._offering = _offering;
        this._cardPID = _cardPID;
        this._cardUID = _cardUID;
        this._walletTypeId = _walletTypeId;
        this._fareCodeId = _fareCodeId;
        this._unitPrice = _unitPrice;
        this._description = _description;
        this._walletContents = _walletContents;
        this._cardExpiration = _cardExpiration;
        this._encoded = _encoded;
    }
    Object.defineProperty(WalletLineItem.prototype, "sequenceNumber", {
        /**
         * Getter sequenceNumber
         * @return {number}
         */
        get: function () {
            return this._sequenceNumber;
        },
        /**
         * Setter sequenceNumber
         * @param {number} value
         */
        set: function (value) {
            this._sequenceNumber = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletLineItem.prototype, "offering", {
        /**
         * Getter offering
         * @return {Offering}
         */
        get: function () {
            return this._offering;
        },
        /**
         * Setter offering
         * @param {Offering} value
         */
        set: function (value) {
            this._offering = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletLineItem.prototype, "cardPID", {
        /**
         * Getter cardPID
         * @return {string}
         */
        get: function () {
            return this._cardPID;
        },
        /**
         * Setter cardPID
         * @param {string} value
         */
        set: function (value) {
            this._cardPID = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletLineItem.prototype, "cardUID", {
        /**
         * Getter cardUID
         * @return {string}
         */
        get: function () {
            return this._cardUID;
        },
        /**
         * Setter cardUID
         * @param {string} value
         */
        set: function (value) {
            this._cardUID = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletLineItem.prototype, "walletTypeId", {
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
    Object.defineProperty(WalletLineItem.prototype, "fareCodeId", {
        /**
         * Getter fareCodeId
         * @return {number}
         */
        get: function () {
            return this._fareCodeId;
        },
        /**
         * Setter fareCodeId
         * @param {number} value
         */
        set: function (value) {
            this._fareCodeId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletLineItem.prototype, "unitPrice", {
        /**
         * Getter unitPrice
         * @return {any}
         */
        get: function () {
            return this._unitPrice;
        },
        /**
         * Setter unitPrice
         * @param {any} value
         */
        set: function (value) {
            this._unitPrice = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletLineItem.prototype, "description", {
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
    Object.defineProperty(WalletLineItem.prototype, "cardExpiration", {
        /**
         * Getter cardExpiration
         * @return {number}
         */
        get: function () {
            return this._cardExpiration;
        },
        /**
         * Setter cardExpiration
         * @param {number} value
         */
        set: function (value) {
            this._cardExpiration = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletLineItem.prototype, "encoded", {
        /**
         * Getter encoded
         * @return {boolean}
         */
        get: function () {
            return this._encoded;
        },
        /**
         * Setter encoded
         * @param {boolean} value
         */
        set: function (value) {
            this._encoded = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletLineItem.prototype, "walletContents", {
        /**
         * Getter walletContents
         * @return {WalletContent[]}
         */
        get: function () {
            return this._walletContents;
        },
        /**
         * Setter walletContents
         * @param {WalletContent[]} value
         */
        set: function (value) {
            this._walletContents = value;
        },
        enumerable: true,
        configurable: true
    });
    return WalletLineItem;
}());
exports.WalletLineItem = WalletLineItem;
