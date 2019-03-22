"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TicketType = /** @class */ (function () {
    function TicketType(_ticketTypeId, _description) {
        this._ticketTypeId = _ticketTypeId;
        this._description = _description;
    }
    Object.defineProperty(TicketType.prototype, "ticketTypeId", {
        /**
         * Getter ticketTypeId
         * @return {number}
         */
        get: function () {
            return this._ticketTypeId;
        },
        /**
         * Setter ticketTypeId
         * @param {number} value
         */
        set: function (value) {
            this._ticketTypeId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TicketType.prototype, "description", {
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
    return TicketType;
}());
exports.TicketType = TicketType;
