import { MediaType } from './MediaType';


export class FilterOfferings {
    private static _filterService = new FilterOfferings();

    public static get getInstance() {
        return FilterOfferings._filterService;
    }

    constructor() {

        if (FilterOfferings._filterService) {
            throw new Error('Error: Instantiation failed: Use FilterOfferings.getInstance() instead of new.');
        }
        FilterOfferings._filterService = this;
    }

    filterFareOfferings(offeringJSON, ticketGroup, ticketTypeId, walletLineItem, isAccountBased) {

        const filteredProducts = [];
        for (const item of offeringJSON) {

            if (null != item.Ticket) {
                if ((null != item.Ticket.Group) && (null != item.Ticket.TicketType)) {
                    if (item.Ticket.Group == ticketGroup &&
                        (ticketTypeId == null || item.Ticket.TicketType.TicketTypeId == ticketTypeId) &&
                        null != item.Ticket.WalletType &&
                        null != item.Ticket.FareCode) {
                        let walletTypeMatch = false;
                        let fareCodeMatch = false;

                        for (let i = 0; i < item.Ticket.WalletType.length; i++) {
                            if (walletLineItem._walletTypeId == item.Ticket.WalletType[i].WalletTypeId) {
                                walletTypeMatch = true;
                            }
                        }

                        if (walletLineItem._walletTypeId === MediaType.MAGNETIC_ID || walletLineItem._walletTypeId === MediaType.LUCC) {
                            // Display all farecodes for Magnetics
                            fareCodeMatch = true;
                        } else {
                            for (let i = 0; i < item.Ticket.FareCode.length; i++) {
                                if (walletLineItem._fareCodeId == item.Ticket.FareCode[i].FareCodeId) {
                                    fareCodeMatch = true;
                                }
                            }
                        }

                        if (!isAccountBased && walletTypeMatch && fareCodeMatch && item.IsCardBased) {
                            filteredProducts.push(item);
                        } else if (item.IsAccountBased) {
                            filteredProducts.push(item);
                        }
                    }
                }
            }
        }

        return filteredProducts;

    }

    filterNonFareOfferings(offeringJSON) {

        const filteredNonFareProducts = [];
        for (const item of offeringJSON) {
            if (true == item.IsMerchandise) {
                filteredNonFareProducts.push(item);
            }
        }

        return filteredNonFareProducts;
    }

}
