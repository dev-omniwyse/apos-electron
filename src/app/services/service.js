"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Offering_1 = require("../models/Offering");
var Ticket_1 = require("../models/Ticket");
var TicketType_1 = require("../models/TicketType");
var FareCode_1 = require("../models/FareCode");
var WalletType_1 = require("../models/WalletType");
var Service = /** @class */ (function () {
    function Service() {
    }
    Object.defineProperty(Service.prototype, "selectedOffering", {
        get: function () {
            var offering = new Offering_1.Offering();
            offering.offeringId = 8;
            offering.productIdentifier = "1206";
            offering.description = "Nav Ride";
            offering.unitPrice = 15;
            offering.isTaxable = false;
            offering.isMerchandise = false;
            offering.dateEffective = 1522800000000;
            offering.dateExpires = 1838419200000;
            var ticket = new Ticket_1.Ticket();
            var ticketType = new TicketType_1.TicketType();
            var fareCode = new FareCode_1.FareCode();
            // "Ticket": {
            ticket.ticketId = 272;
            //   "TicketType": {
            ticketType.ticketTypeId = 2;
            ticketType.description = "Stored Ride";
            //   },
            ticket.ticketType = ticketType;
            ticket.description = "Nav Ride";
            ticket.descriptionLong = "Nav Ride",
                ticket.price = 15;
            ticket.value = 5;
            ticket.dateStartEpochDays = 0;
            ticket.dateExpiresEpochDays = 0;
            ticket.isSubcribable = false;
            // ticket.fareCode": [
            // {
            fareCode.fareCodeId = 1;
            fareCode.description = "Full";
            ticket.fareCode = fareCode;
            // }
            //   ],
            //   "WalletType": [
            //     {
            var walletTypes = [];
            var walletType1 = new WalletType_1.WalletType();
            var walletType2 = new WalletType_1.WalletType();
            walletType1.walletTypeId = 3;
            walletType1.description = "Smart Card";
            walletTypes.push(walletType1);
            // },
            // {
            walletType2.walletTypeId = 10;
            walletType2.description = "Magnetics";
            walletTypes.push(walletType2);
            ticket.walletType = walletTypes;
            //     }
            //   ],
            ticket.group = 2;
            ticket.designator = 18;
            // },
            offering.isAccountBased = false,
                offering.isCardBased = true;
            return offering;
        },
        enumerable: true,
        configurable: true
    });
    return Service;
}());
exports.Service = Service;
