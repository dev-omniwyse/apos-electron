"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MediaType;
(function (MediaType) {
    MediaType[MediaType["SMART_CARD_ID"] = 3] = "SMART_CARD_ID";
    MediaType[MediaType["MAGNETIC_ID"] = 10] = "MAGNETIC_ID";
    MediaType[MediaType["MERCHANDISE_ID"] = 99] = "MERCHANDISE_ID";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
var Constants;
(function (Constants) {
    Constants["MERCHANDISE_TEXT"] = "Merch*";
    Constants["MAGNETICS_TEXT"] = "Magnetic ";
})(Constants = exports.Constants || (exports.Constants = {}));
var TICKET_GROUP;
(function (TICKET_GROUP) {
    TICKET_GROUP[TICKET_GROUP["PERIOD_PASS"] = 1] = "PERIOD_PASS";
    TICKET_GROUP[TICKET_GROUP["RIDE"] = 2] = "RIDE";
    TICKET_GROUP[TICKET_GROUP["VALUE"] = 3] = "VALUE";
})(TICKET_GROUP = exports.TICKET_GROUP || (exports.TICKET_GROUP = {}));
var TICKET_TYPE;
(function (TICKET_TYPE) {
    TICKET_TYPE[TICKET_TYPE["STORED_FIXED_VALUE"] = 1] = "STORED_FIXED_VALUE";
    TICKET_TYPE[TICKET_TYPE["RIDE"] = 2] = "RIDE";
    TICKET_TYPE[TICKET_TYPE["PERIOD"] = 3] = "PERIOD";
    TICKET_TYPE[TICKET_TYPE["STORED_VARIABLE_VALUE"] = 4] = "STORED_VARIABLE_VALUE";
})(TICKET_TYPE = exports.TICKET_TYPE || (exports.TICKET_TYPE = {}));
