"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WalletContent = /** @class */ (function () {
    // Values returned from encoding
    //_slot, _balance, _startDate, _expirationDate, _rechargesPending
    function WalletContent(_cardUID, _sequenceNumber, _offering, _unitPrice, _description, _quantity, _status, _slot, _balance, _startDate, _expirationDate, _rechargesPending) {
        this._cardUID = _cardUID;
        this._sequenceNumber = _sequenceNumber;
        this._offering = _offering;
        this._unitPrice = _unitPrice;
        this._description = _description;
        this._quantity = _quantity;
        this._status = _status;
        this._slot = _slot;
        this._balance = _balance;
        this._startDate = _startDate;
        this._expirationDate = _expirationDate;
        this._rechargesPending = _rechargesPending;
    }
    Object.defineProperty(WalletContent.prototype, "cardUID", {
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
    Object.defineProperty(WalletContent.prototype, "sequenceNumber", {
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
    Object.defineProperty(WalletContent.prototype, "offering", {
        /**
         * Getter offering
         * @return {any}
         */
        get: function () {
            return this._offering;
        },
        /**
         * Setter offering
         * @param {any} value
         */
        set: function (value) {
            this._offering = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletContent.prototype, "unitPrice", {
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
    Object.defineProperty(WalletContent.prototype, "description", {
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
    Object.defineProperty(WalletContent.prototype, "quantity", {
        /**
         * Getter quantity
         * @return {number}
         */
        get: function () {
            return this._quantity;
        },
        /**
         * Setter quantity
         * @param {number} value
         */
        set: function (value) {
            this._quantity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletContent.prototype, "status", {
        /**
         * Getter status
         * @return {string}
         */
        get: function () {
            return this._status;
        },
        /**
         * Setter status
         * @param {string} value
         */
        set: function (value) {
            this._status = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletContent.prototype, "slot", {
        /**
         * Getter slot
         * @return {number}
         */
        get: function () {
            return this._slot;
        },
        /**
         * Setter slot
         * @param {number} value
         */
        set: function (value) {
            this._slot = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletContent.prototype, "balance", {
        /**
         * Getter balance
         * @return {any}
         */
        get: function () {
            return this._balance;
        },
        /**
         * Setter balance
         * @param {any} value
         */
        set: function (value) {
            this._balance = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletContent.prototype, "startDate", {
        /**
         * Getter startDate
         * @return {number}
         */
        get: function () {
            return this._startDate;
        },
        /**
         * Setter startDate
         * @param {number} value
         */
        set: function (value) {
            this._startDate = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletContent.prototype, "expirationDate", {
        /**
         * Getter expirationDate
         * @return {number}
         */
        get: function () {
            return this._expirationDate;
        },
        /**
         * Setter expirationDate
         * @param {number} value
         */
        set: function (value) {
            this._expirationDate = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WalletContent.prototype, "rechargesPending", {
        /**
         * Getter rechargesPending
         * @return {number}
         */
        get: function () {
            return this._rechargesPending;
        },
        /**
         * Setter rechargesPending
         * @param {number} value
         */
        set: function (value) {
            this._rechargesPending = value;
        },
        enumerable: true,
        configurable: true
    });
    return WalletContent;
}());
exports.WalletContent = WalletContent;
