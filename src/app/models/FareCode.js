"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FareCode = /** @class */ (function () {
    function FareCode(_fareCodeId, _description) {
        this._fareCodeId = _fareCodeId;
        this._description = _description;
    }
    Object.defineProperty(FareCode.prototype, "fareCodeId", {
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
    Object.defineProperty(FareCode.prototype, "description", {
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
    return FareCode;
}());
exports.FareCode = FareCode;
