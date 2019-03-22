"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ticket = /** @class */ (function () {
    function Ticket(_ticketId, _description, _descriptionLong, _price, _value, _group, _designator, _dateStart, _dateStartEpochDays, _dateExpires, _dateExpiresEpochDays, _isSubcribable, _expirationTypeId, _expirationTime, _replenishValue, _replenishThreshold, _ticketType, _zone, _fareCode, _walletType) {
        this._ticketId = _ticketId;
        this._description = _description;
        this._descriptionLong = _descriptionLong;
        this._price = _price;
        this._value = _value;
        this._group = _group;
        this._designator = _designator;
        this._dateStart = _dateStart;
        this._dateStartEpochDays = _dateStartEpochDays;
        this._dateExpires = _dateExpires;
        this._dateExpiresEpochDays = _dateExpiresEpochDays;
        this._isSubcribable = _isSubcribable;
        this._expirationTypeId = _expirationTypeId;
        this._expirationTime = _expirationTime;
        this._replenishValue = _replenishValue;
        this._replenishThreshold = _replenishThreshold;
        this._ticketType = _ticketType;
        this._zone = _zone;
        this._fareCode = _fareCode;
        this._walletType = _walletType;
    }
    Object.defineProperty(Ticket.prototype, "ticketId", {
        /**
         * Getter ticketId
         * @return {number}
         */
        get: function () {
            return this._ticketId;
        },
        /**
         * Setter ticketId
         * @param {number} value
         */
        set: function (value) {
            this._ticketId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "description", {
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
    Object.defineProperty(Ticket.prototype, "descriptionLong", {
        /**
         * Getter descriptionLong
         * @return {string}
         */
        get: function () {
            return this._descriptionLong;
        },
        /**
         * Setter descriptionLong
         * @param {string} value
         */
        set: function (value) {
            this._descriptionLong = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "price", {
        /**
         * Getter price
         * @return {any}
         */
        get: function () {
            return this._price;
        },
        /**
         * Setter price
         * @param {any} value
         */
        set: function (value) {
            this._price = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "value", {
        /**
         * Getter value
         * @return {any}
         */
        get: function () {
            return this._value;
        },
        /**
         * Setter value
         * @param {any} value
         */
        set: function (value) {
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "group", {
        /**
         * Getter group
         * @return {number}
         */
        get: function () {
            return this._group;
        },
        /**
         * Setter group
         * @param {number} value
         */
        set: function (value) {
            this._group = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "designator", {
        /**
         * Getter designator
         * @return {number}
         */
        get: function () {
            return this._designator;
        },
        /**
         * Setter designator
         * @param {number} value
         */
        set: function (value) {
            this._designator = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "dateStart", {
        /**
         * Getter dateStart
         * @return {number}
         */
        get: function () {
            return this._dateStart;
        },
        /**
         * Setter dateStart
         * @param {number} value
         */
        set: function (value) {
            this._dateStart = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "dateStartEpochDays", {
        /**
         * Getter dateStartEpochDays
         * @return {number}
         */
        get: function () {
            return this._dateStartEpochDays;
        },
        /**
         * Setter dateStartEpochDays
         * @param {number} value
         */
        set: function (value) {
            this._dateStartEpochDays = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "dateExpires", {
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
    Object.defineProperty(Ticket.prototype, "dateExpiresEpochDays", {
        /**
         * Getter dateExpiresEpochDays
         * @return {number}
         */
        get: function () {
            return this._dateExpiresEpochDays;
        },
        /**
         * Setter dateExpiresEpochDays
         * @param {number} value
         */
        set: function (value) {
            this._dateExpiresEpochDays = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "isSubcribable", {
        /**
         * Getter isSubcribable
         * @return {boolean}
         */
        get: function () {
            return this._isSubcribable;
        },
        /**
         * Setter isSubcribable
         * @param {boolean} value
         */
        set: function (value) {
            this._isSubcribable = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "expirationTypeId", {
        /**
         * Getter expirationTypeId
         * @return {number}
         */
        get: function () {
            return this._expirationTypeId;
        },
        /**
         * Setter expirationTypeId
         * @param {number} value
         */
        set: function (value) {
            this._expirationTypeId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "expirationTime", {
        /**
         * Getter expirationTime
         * @return {number}
         */
        get: function () {
            return this._expirationTime;
        },
        /**
         * Setter expirationTime
         * @param {number} value
         */
        set: function (value) {
            this._expirationTime = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "replenishValue", {
        /**
         * Getter replenishValue
         * @return {any}
         */
        get: function () {
            return this._replenishValue;
        },
        /**
         * Setter replenishValue
         * @param {any} value
         */
        set: function (value) {
            this._replenishValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "replenishThreshold", {
        /**
         * Getter replenishThreshold
         * @return {any}
         */
        get: function () {
            return this._replenishThreshold;
        },
        /**
         * Setter replenishThreshold
         * @param {any} value
         */
        set: function (value) {
            this._replenishThreshold = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "ticketType", {
        /**
         * Getter ticketType
         * @return {TicketType}
         */
        get: function () {
            return this._ticketType;
        },
        /**
         * Setter ticketType
         * @param {TicketType} value
         */
        set: function (value) {
            this._ticketType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "zone", {
        /**
         * Getter zone
         * @return {Zone}
         */
        get: function () {
            return this._zone;
        },
        /**
         * Setter zone
         * @param {Zone} value
         */
        set: function (value) {
            this._zone = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "fareCode", {
        /**
         * Getter fareCode
         * @return {FareCode}
         */
        get: function () {
            return this._fareCode;
        },
        /**
         * Setter fareCode
         * @param {FareCode} value
         */
        set: function (value) {
            this._fareCode = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "walletType", {
        /**
         * Getter walletType
         * @return {WalletType[]}
         */
        get: function () {
            return this._walletType;
        },
        /**
         * Setter walletType
         * @param {WalletType[]} value
         */
        set: function (value) {
            this._walletType = value;
        },
        enumerable: true,
        configurable: true
    });
    return Ticket;
}());
exports.Ticket = Ticket;
