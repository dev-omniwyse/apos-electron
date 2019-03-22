"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NonFareLineItem = /** @class */ (function () {
    function NonFareLineItem(_sequenceNumber, _offering, _unitPrice, _description, _quantity) {
        this._sequenceNumber = _sequenceNumber;
        this._offering = _offering;
        this._unitPrice = _unitPrice;
        this._description = _description;
        this._quantity = _quantity;
    }
    Object.defineProperty(NonFareLineItem.prototype, "sequenceNumber", {
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
    Object.defineProperty(NonFareLineItem.prototype, "offering", {
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
    Object.defineProperty(NonFareLineItem.prototype, "unitPrice", {
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
    Object.defineProperty(NonFareLineItem.prototype, "description", {
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
    Object.defineProperty(NonFareLineItem.prototype, "quantity", {
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
    return NonFareLineItem;
}());
exports.NonFareLineItem = NonFareLineItem;
