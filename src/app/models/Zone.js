"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Zone = /** @class */ (function () {
    function Zone(_zoneId, _description) {
        this._zoneId = _zoneId;
        this._description = _description;
    }
    Object.defineProperty(Zone.prototype, "zoneId", {
        /**
         * Getter zoneId
         * @return {number}
         */
        get: function () {
            return this._zoneId;
        },
        /**
         * Setter zoneId
         * @param {number} value
         */
        set: function (value) {
            this._zoneId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Zone.prototype, "description", {
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
    return Zone;
}());
exports.Zone = Zone;
