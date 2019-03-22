"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Offering = /** @class */ (function () {
    function Offering(_offeringId, _productIdentifier, _description, _unitPrice, _taxRate, _isMerchandise, _isTaxable, _quantityMax, _dateEffective, _dateExpires, _ticket, _walletType, _isAccountBased, _isCardBased) {
        this._offeringId = _offeringId;
        this._productIdentifier = _productIdentifier;
        this._description = _description;
        this._unitPrice = _unitPrice;
        this._taxRate = _taxRate;
        this._isMerchandise = _isMerchandise;
        this._isTaxable = _isTaxable;
        this._quantityMax = _quantityMax;
        this._dateEffective = _dateEffective;
        this._dateExpires = _dateExpires;
        this._ticket = _ticket;
        this._walletType = _walletType;
        this._isAccountBased = _isAccountBased;
        this._isCardBased = _isCardBased;
    }
    Object.defineProperty(Offering.prototype, "offeringId", {
        /**
         * Getter offeringId
         * @return {number}
         */
        get: function () {
            return this._offeringId;
        },
        /**
         * Setter offeringId
         * @param {number} value
         */
        set: function (value) {
            this._offeringId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "productIdentifier", {
        /**
         * Getter productIdentifier
         * @return {string}
         */
        get: function () {
            return this._productIdentifier;
        },
        /**
         * Setter productIdentifier
         * @param {string} value
         */
        set: function (value) {
            this._productIdentifier = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "description", {
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
    Object.defineProperty(Offering.prototype, "unitPrice", {
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
    Object.defineProperty(Offering.prototype, "taxRate", {
        /**
         * Getter taxRate
         * @return {any}
         */
        get: function () {
            return this._taxRate;
        },
        /**
         * Setter taxRate
         * @param {any} value
         */
        set: function (value) {
            this._taxRate = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "isMerchandise", {
        /**
         * Getter isMerchandise
         * @return {boolean}
         */
        get: function () {
            return this._isMerchandise;
        },
        /**
         * Setter isMerchandise
         * @param {boolean} value
         */
        set: function (value) {
            this._isMerchandise = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "isTaxable", {
        /**
         * Getter isTaxable
         * @return {boolean}
         */
        get: function () {
            return this._isTaxable;
        },
        /**
         * Setter isTaxable
         * @param {boolean} value
         */
        set: function (value) {
            this._isTaxable = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "quantityMax", {
        /**
         * Getter quantityMax
         * @return {number}
         */
        get: function () {
            return this._quantityMax;
        },
        /**
         * Setter quantityMax
         * @param {number} value
         */
        set: function (value) {
            this._quantityMax = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "dateEffective", {
        /**
         * Getter dateEffective
         * @return {number}
         */
        get: function () {
            return this._dateEffective;
        },
        /**
         * Setter dateEffective
         * @param {number} value
         */
        set: function (value) {
            this._dateEffective = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "dateExpires", {
        /**
         * Getter dateExpires
         * @return {number}
         */
        get: function () {
            return this._dateExpires;
        },
        /**
         * Setter dateExpires
         * @param {number} value
         */
        set: function (value) {
            this._dateExpires = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "ticket", {
        /**
         * Getter ticket
         * @return {Ticket}
         */
        get: function () {
            return this._ticket;
        },
        /**
         * Setter ticket
         * @param {Ticket} value
         */
        set: function (value) {
            this._ticket = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "walletType", {
        /**
         * Getter walletType
         * @return {WalletType}
         */
        get: function () {
            return this._walletType;
        },
        /**
         * Setter walletType
         * @param {WalletType} value
         */
        set: function (value) {
            this._walletType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "isAccountBased", {
        /**
         * Getter isAccountBased
         * @return {boolean}
         */
        get: function () {
            return this._isAccountBased;
        },
        /**
         * Setter isAccountBased
         * @param {boolean} value
         */
        set: function (value) {
            this._isAccountBased = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offering.prototype, "isCardBased", {
        /**
         * Getter isCardBased
         * @return {boolean}
         */
        get: function () {
            return this._isCardBased;
        },
        /**
         * Setter isCardBased
         * @param {boolean} value
         */
        set: function (value) {
            this._isCardBased = value;
        },
        enumerable: true,
        configurable: true
    });
    return Offering;
}());
exports.Offering = Offering;
