import { Offering } from "../models/Offering";
import { Ticket } from "../models/Ticket";
import { TicketType } from "../models/TicketType";
import { FareCode } from "../models/FareCode";
import { WalletType } from "../models/WalletType";
 


export class Service {

    public get selectedOffering(){
        
        var offering = new Offering();

        offering.offeringId = 8;
        offering.productIdentifier = "1206";
        offering.description= "Nav Ride";
        offering.unitPrice = 15;
        offering.isTaxable= false;
        offering.isMerchandise= false;
        offering.dateEffective= 1522800000000;
        offering.dateExpires= 1838419200000;

        let ticket = new Ticket();
        let ticketType = new TicketType();
        let fareCode = new FareCode();
        
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
        ticket.isSubcribable =false;
        // ticket.fareCode": [
            // {
                fareCode.fareCodeId = 1;
                fareCode.description = "Full";
        ticket.fareCode = fareCode;
            // }
        //   ],
        //   "WalletType": [
        //     {
        let walletTypes = [];
        let walletType1 = new WalletType();
        let walletType2 = new WalletType();
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
    }
}