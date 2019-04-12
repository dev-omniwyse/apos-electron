import { ShoppingCartService } from "./ShoppingCart.service";
import { FareCardService } from "./Farecard.service";
import { MediaType, TICKET_GROUP, Constants, PRODUCT_NAME } from "./MediaType";
import { TransactionService } from './Transaction.service';
import { DeviceInfo } from '../models/DeviceInfo';
import { CardSummary } from '../models/CardContetns';

export class Utils {


    private static _utilService = new Utils();

    public static get getInstance() {
        return Utils._utilService;
    }

    constructor() {

        if (Utils._utilService) {
            throw new Error("Error: Instantiation failed: Use Utils.getInstance() instead of new.");
        }
        Utils._utilService = this;
    }

    removeWalletFromLocalStore(cardJSON, walletLineItem) {
        let newCardJSON = null;

        for (let item of cardJSON) {

            // if(item.){

            // }
        }
    }
    generateSequenceNumberForWalletLineItem(shoppingCart) {
        let currentMaxSequenceNumber = 0;
        let cart = shoppingCart;

        for (let item of cart._walletLineItem) {
            if (item._sequenceNumber && item._sequenceNumber > currentMaxSequenceNumber) {
                currentMaxSequenceNumber = item._sequenceNumber;
            }
        }
        let nextMaxSequenceNumber = currentMaxSequenceNumber + 1;

        return nextMaxSequenceNumber;
    }

    generateSequenceNumberForWalletContent(walletLineItem) {

        let walletContents = walletLineItem._walletContents;
        let seqNumber = walletContents.length + 1;
        return seqNumber;
    }

    getPaymentTypeString(paymentType) {
        let paymentTypeText = null;

        /* payment types */
        /*INVOICED: 1,
         CASH: 2,
         CHECK: 3,
         AMEX: 4,
         VISA: 5,
         MASTERCARD: 6,
         DISCOVER: 7,
         COMP: 8,
         CREDIT: 9,
         FARE_CARD: 10,
         VOUCHER: 11,
         STORED_VALUE: 12 */

        // this is very unlikely to be needed...but if they remove a type, you still need to be able
        //    to print SOMETHING in the sales summary for old transactions. So this will serve as a default
        switch (paymentType) {
            case 1:
                paymentTypeText = 'Invoiced';
                break;
            case 2:
                paymentTypeText = 'Cash';
                break;
            case 3:
                paymentTypeText = 'Check';
                break;
            case 4:
                paymentTypeText = 'Amex';
                break;
            case 5:
                paymentTypeText = 'Visa';
                break;
            case 6:
                paymentTypeText = 'Mastercard';
                break;
            case 7:
                paymentTypeText = 'Discover';
                break;
            case 8:
                paymentTypeText = 'Comp';
                break;
            case 9:
                paymentTypeText = 'Credit';
                break;
            case 10:
                paymentTypeText = 'Fare Card';
                break;
            case 11:
                paymentTypeText = 'Voucher';
                break;
            // case 12:
            //     paymentTypeText = Labels.STORED_VALUE;
            //     break;
            default:
                break;
        }

        return paymentTypeText;
    }
    //product limits - 

    genearateMagneticSequenceNumber(shoppingCart) {
        let currentSequence = 0;
        let lastCardPID = null;
        for (let item of shoppingCart._walletLineItem) {
            if (item._walletTypeId == MediaType.MAGNETIC_ID) {
                lastCardPID = item._cardPID;
            }
        }
        let seq = null == lastCardPID ? 0 : lastCardPID.split(" ")[1];
        currentSequence = +seq;
        return (currentSequence + 1);
    }

    getActiveWalletLineItem(cart) {

        let lastIndex = cart._walletLineItem.length - 1;

        return cart[lastIndex];
    }

    isNew(cardObj) {
        // let isCardExpired = this.isCardExpired(cardObj);
        let isCardNew = true;
        if (cardObj.products.length === 0) {
            console.log("Smart card doesn't have expected fixed value product.");
            isCardNew = false;
        } else if (cardObj.is_card_bad_listed === true) {
            console.log("Smart card is badlisted, cannot encode.");
            isCardNew = false;
        }
        // else if(isCardExpired === true) {
        //     console.log("Smart card is expired, cannot encode.");
        //     isCardNew = false;
        // } 
        else {
            if (cardObj.products.length > 1) {
                console.log("Smart card has more than 1 product, " +
                    "does not match expected blank.");
                isCardNew = false;
            } else {
                if (cardObj.products[0].product_type === TICKET_GROUP.VALUE) {
                    if (cardObj.products[0].remaining_value === 0) {
                    } else {
                        console.log("Smart card stored value product not $0, " +
                            "does not match expected blank.");
                        isCardNew = false;
                    }
                } else {
                    console.log("Smart card product not expected fixed value product, " +
                        "does not match expected blank.");
                    isCardNew = false;
                }
            }
        }

        //         if(isCardNew) {
        //             //Continue

        //         } else {
        //             Ext.Msg.show({
        //                 title: 'Error',
        //                 message: 'Card does not appear to be blank, either add products to existing card, or discard if invalid.',
        //                 width: 450,
        //                 height: 275,
        //                 minWidth: 450,
        //                 hideAnimation: null,
        //                 buttons: Ext.MessageBox.OK
        //             });

        //             return isCardNew;
        //         }

        //     } else if(APOS.util.Config.cardTypeDetected == APOS.util.Config.WALLET_TYPE.LUCC) {

        //         // Refresh card contents following autoload
        //         card_contents = APOS.util.POSApplet.readCardUltralightC();

        //         cardObj = Ext.JSON.decode(card_contents);

        //         let isCardNew = true;

        //         let isBadlisted = cardObj.is_card_badlisted;
        //         cardObj.product.is_card_badlisted = isBadlisted;
        //         if(isBadlisted) {
        //             console.log("LUCC card is badlisted, cannot encode.");
        //             isCardNew = false;
        //         } else {
        //             let cardType = cardObj.card_type;
        //             if(cardType === 0) {
        //                 if(cardObj.card_exp === 0) {
        //                     // Matches expected blank
        //                 } else {
        //                     console.log("LUCC expiration date doesn't match expected blank, cannot encode.");
        //                     isCardNew = false;
        //                 }
        //             } else {
        //                 console.log("LUCC card type doesn't match expected blank, cannot encode.");
        //                 isCardNew = false;
        //             }
        //         }

        //         if(isCardNew) {
        //             // Continue
        //         } else {
        //             Ext.Msg.show({
        //                 title: 'Error',
        //                 message: 'Card does not appear to be blank, either add products to existing card, or discard if invalid.',
        //                 width: 450,
        //                 height: 275,
        //                 minWidth: 450,
        //                 hideAnimation: null,
        //                 buttons: Ext.MessageBox.OK
        //             });
        //         }
        //     }

        //     return isCardNew;
        // }   
        //     }

        //     isCardExpired : function(card) {
        //         let isExpired = false;

        //         let currentEpochDays = posApplet.getCurrentEpochDays();

        //         if(card.card_expiration_date > 0 && card.card_expiration_date < currentEpochDays) {
        //             isExpired = true;
        //         } else if (card.user_profile_expiration_date > 0 && card.user_profile_expiration_date < currentEpochDays) {
        //             isExpired = true;
        //         } 

        //         return isExpired;
        return isCardNew;
    }

    getBonusRideCount(cardData) {
        let bonus_rides = 0;
        let bonusRideStatusText = "Bonus Ride(s): " + bonus_rides;
        if ((cardData.num_bonus_passes != null) &&
            (cardData.num_bonus_passes > 0)) {

            if (cardData.bonus_pass) {
                bonus_rides = cardData.bonus_pass.ride_count;
            }
            bonusRideStatusText = "Bonus Ride(s): " + bonus_rides;
            console.log("Bonus ride set!");
        }
        return bonusRideStatusText;
    }

    getNextBonusRidesCount(cardData, terminalConfig) {
        let bonusRideThreshold = terminalConfig.BonusRideThreshold;
        let bonus_ride_counter = 0;

        // cardStore.products.forEach(cardElement => {
        cardData.products.forEach(fItem => {
            if (fItem.product_type == TICKET_GROUP.VALUE) {
                bonus_ride_counter = fItem.bonus_ride_count;
            }
        });
        let text = "Next Bonus: " + bonus_ride_counter + "/" + bonusRideThreshold;
        return text;
    }
    isAnyEmptyMagnetics(shoppingCart) {
        let isEmpty = false;
        let walletLineItems = shoppingCart._walletLineItem
        for (let itemIndex = 0; itemIndex < walletLineItems.length; itemIndex++) {
            if (walletLineItems[itemIndex]._walletTypeId == MediaType.MAGNETIC_ID && (0 == walletLineItems[itemIndex]._walletContents.length)) {
                isEmpty = true;
                break;
            }
        }
        return isEmpty;
    }
    isValidMerchandise(wallet) {
        let flag = true;
        if ((wallet._walletTypeId == MediaType.MERCHANDISE_ID) &&
            (0 == wallet._walletContents.length)) {
            flag = false;
        }

        return flag;
    }
    isEmptyShoppingCart(shoppingcart) {

        let walletLineItems = shoppingcart._walletLineItem;
        let isEmpty = false;
        if (0 == walletLineItems.length) {
            isEmpty = true;
        } else if (1 == walletLineItems.length && !this.isValidMerchandise(walletLineItems[0])) {
            isEmpty = true;
        }
        return isEmpty;
    }
    createDeviceInfoDefaultRecord() {
        let deviceInfo = new DeviceInfo();
        deviceInfo.$CURRENT_UNSYNCED_TRANSACTION_NUMBER = 0;
        deviceInfo.$CURRENT_UNSYNCED_TRANSACTION_VALUE = 0;
        deviceInfo.$LIFETIME_TRANSACTION_COUNT = 0;
        deviceInfo.$LIFETIME_TRANSACTION_VALUE = 0;
        deviceInfo.$terminalID = "0";
        deviceInfo.$failedLoginCount = 0;
        deviceInfo.$PRESHARE = "";
        deviceInfo.$operatingMode = "0";
        return deviceInfo;
    }
    increseTransactionCountInDeviceInfo(deviceInfo, transactionObj) {
        deviceInfo.CURRENT_UNSYNCED_TRANSACTION_NUMBER++;
        deviceInfo.CURRENT_UNSYNCED_TRANSACTION_VALUE += transactionObj.salesAmount;

        deviceInfo.LIFETIME_TRANSACTION_COUNT++;
        deviceInfo.LIFETIME_TRANSACTION_VALUE += transactionObj.salesAmount;

        return deviceInfo;
    }

    decreaseTransactionCountInDeviceInfo(deviceInfo, transactionObj) {
        deviceInfo.CURRENT_UNSYNCED_TRANSACTION_NUMBER--;
        deviceInfo.CURRENT_UNSYNCED_TRANSACTION_VALUE -= transactionObj.salesAmount;

        deviceInfo.LIFETIME_TRANSACTION_COUNT--;
        deviceInfo.LIFETIME_TRANSACTION_VALUE -= transactionObj.salesAmount;

        return deviceInfo;
    }

    getIndexOfActiveWallet(cardsData, item) {

        let cardIndex = -1;
        for (let index = 0; index < cardsData.length; index++) {

            if (item._cardPID == cardsData[index].printed_id) {
                cardIndex = index;
                break;
            }
        }
        return cardIndex;
    }

    getFareCodeTextForThisWallet(cardData, terminalConfig) {

        let fareCodeText = "Unknown"
        let fareCodes = terminalConfig.Farecodes;
        for (let index = 0; index < fareCodes.length; index++) {
            if (cardData.user_profile == fareCodes[index].FareCodeId) {
                fareCodeText = fareCodes[index].Description;
                break;
            }
        }
        return fareCodeText;
    }

    getStatusOfWallet(readCardJson) {

        let cardStatus = "";
        let isCardExpired = this.isCardExpired(readCardJson);
        let isCardBadListed = readCardJson.is_card_bad_listed;

        if (isCardExpired === true) {
            cardStatus = 'EXPIRED';
        } else if (isCardBadListed === true) {
            cardStatus = 'INACTIVE';
        } else {
            cardStatus = 'Active';
        }

        return cardStatus;
    }
    isCardExpired(data) {

        let currentEpochDays = this.getCurrentEpochDays();
        let isExpired = false;
        if (data.card_expiration_date > 0 && data.card_expiration_date < currentEpochDays) {
            isExpired = true;
        } else if (data.user_profile_expiration_date > 0 && data.user_profile_expiration_date < currentEpochDays) {
            isExpired = true;
        }

        return isExpired;
    }

    getCurrentEpochDays() {
        let startDate = Date.parse("1970-01-01");
        let endDate = Date.parse(new Date().toString());
        let timeDiff = endDate - startDate;
        let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return daysDiff;
    }

    getWalletProducts(carddata, ticketMap) {

        let prodcts = [];
        carddata.products.forEach(product => {
            let cardSummary = new CardSummary();
            let productType = product.product_type;

            cardSummary.$product = this.getProductTypeBasedOnProductTypeID(productType);


            let days = product.days;
            let recharges_pending = product.recharges_pending;
            let remainingValue = product.remaining_value;
            let remainingRides = product.remaining_rides;
            let start_date = product.start_date_str;
            let exp_date = product.exp_date_str;
            let start_date_epoch_days = product.start_date_epoch_days;
            let exp_date_epoch_days = product.exp_date_epoch_days;
            let designator = product.designator;
            let bad_listed = product.is_prod_bad_listed;
            let addTime = 0;
            let productStatus = "";
            let currentEpochDays = this.getCurrentEpochDays();
            if (null != product.add_time) {
                addTime = product.add_time;
            }

            if (true == product.is_prod_bad_listed) {
                productStatus = "Inactive";
            }
            else if (exp_date_epoch_days > 1 && exp_date_epoch_days < currentEpochDays && TICKET_GROUP.PERIOD_PASS != productType) {
                productStatus = "Expired";
            } else if (start_date_epoch_days == 65535) {
                // rolling start
                productStatus = "Active";
            } else {
                productStatus = "Active";
            }
            if (0 == remainingRides) {
                productStatus = product.status;
            }
            let cardBalance = "";

            let d = new Date();
            let currentMinutesInDay = (d.getHours() * 60) + d.getMinutes();
            let productDescription = "";
            switch (productType) {
                case TICKET_GROUP.PERIOD_PASS:
                    if (exp_date_epoch_days > 0) {

                        let exp = new Date(product.exp_date_str);
                        exp.setTime(exp.getTime() + addTime);
                        // let expTime  = new Date();
                        // expTime.setTime(addTime);
                        cardBalance = "Exp: " + product.exp_date_str + " " + exp.getHours() + ":" + exp.getMinutes();

                    } else {

                        cardBalance = (days + 1) + " Days";
                    }
                    productDescription = (days + 1) + " Day Pass";
                    if (0 != exp_date_epoch_days && 65535 != exp_date_epoch_days) {
                        // exp date on the card is essentially the day BEFORE the expiration...but at midnight.
                        if ((exp_date_epoch_days) < currentEpochDays) {
                            productStatus = "Expired";
                        }
                        // product expires TODAY, check the time against addTime on the card
                        else if ((exp_date_epoch_days) == currentEpochDays) {
                            if (addTime <= currentMinutesInDay) {
                                productStatus = "Expired";
                            }
                        }
                    }
                    else {
                        if (start_date_epoch_days != 65535) {
                            if ((start_date_epoch_days + days + 1) < currentEpochDays) {
                                productStatus = "Expired";
                            }
                            else if ((start_date_epoch_days + days + 1) == currentEpochDays) {

                                if (addTime <= currentMinutesInDay) {
                                    productStatus = "Expired";
                                }
                            }
                        }
                    }
                    if (recharges_pending) {
                        productStatus += " (" + recharges_pending + " Pending)"
                    }

                    break;
                case TICKET_GROUP.RIDE:
                    if (1 == remainingRides) {
                        cardBalance = remainingRides + " Ride";
                    }
                    else {
                        cardBalance = remainingRides + " Rides";
                    }
                    productDescription = PRODUCT_NAME.STORED_RIDE;
                    break;
                case TICKET_GROUP.VALUE:

                    let remaining_value = 0;

                    if (product.remaining_value && product.remaining_value > 0) {
                        remaining_value = product.remaining_value / 100;
                    }

                    // textProductType = APOS.util.Config.PRODUCT_NAME.STORED_VALUE;
                    // textProductType = 'sdsd';

                    cardBalance = "$ " + remaining_value.toFixed(2);
                    productDescription = PRODUCT_NAME.STORED_VALUE;
                    break;
                default:
                    // textProductType = "Unknown Product";
                    break;
            }
            cardSummary.$balance = cardBalance;
            let description = this.getProductDescription(product, ticketMap);
            if (description != undefined) {
                productDescription = description;
            }
            cardSummary.$status = productStatus;
            cardSummary.$description = productDescription;
            prodcts.push(cardSummary);
        });
        return prodcts
    }

    getProductDescription(product, ticketMap) {
        let description = undefined;

        let ticketKey = product.product_type + "_" + product.designator;
        if (ticketMap.size != 0 && ticketMap.get(ticketKey) != undefined) {
            description = ticketMap.get(ticketKey);
        }
        return description;
    }

    pushTicketToMap(element, ticketMap) {

        if (element.Ticket != null) {
            let ticket = element.Ticket;

            if (ticket.Group != null && ticket.Designator != null) {
                let ticketKey = ticket.Group + "_" + ticket.Designator;
                ticketMap.set(ticketKey, ticket.Description);
            }
        }
        return ticketMap;
    }
    getProductTypeBasedOnProductTypeID(product_typeId) {

        let productName = "Unknown";

        switch (product_typeId) {
            case 1:
                productName = Constants.FREQUENT_RIDE;
                break;
            case 2:
                productName = Constants.STORED_RIDE;
                break;
            case 3:
                productName = Constants.STORED_VALUE;
                break;
            default:
                break;
        }
        return productName;
    }

    getProductExpirationDate(exp_date_epoch_days, addTime) {
        // 	console.log("exp_date_epoch_days: " + exp_date_epoch_days);

        let expDate = new Date(1970, 0, 1, 0, 0, 0);

        //     let expDateDays = exp_date_epoch_days;

        // (addTime * 60000)
        //     let startDate = Date.parse("1970-01-01");
        //     let endDate = Date.parse(Date.now.toString());
        //     let timeDiff = endDate - startDate;
        //     // let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        //     let expirationDate = (new Date(expDate + expDateDays));
        //     console.log("expirationDate " +expirationDate);
        let expirationDate = new Date(expDate.getTime() + exp_date_epoch_days * addTime * 60000);
        return expirationDate;
    }
    isProductExpiredDesfire(exp_date_epoch_days, addTime) {
        let isExpired = false;
        let currentEpochDays = this.getCurrentEpochDays();

        if (0 != exp_date_epoch_days && 65535 != exp_date_epoch_days) {
            // exp date on the card is essentially the day BEFORE the expiration...but at midnight.
            if (exp_date_epoch_days < currentEpochDays) {
                isExpired = true;
            }
            // product expires TODAY, check the time against addTime on the card
            else if (exp_date_epoch_days == currentEpochDays) {

                let d = new Date();
                let currentMinutesInDay = (d.getHours() * 60) + d.getMinutes();

                if (addTime <= currentMinutesInDay) {
                    isExpired = true;
                }
            }
        }

        return isExpired;
    }

    checkSyncLimitsHit(terminalRecordData, deviceInfo) {

        let maxNumber = null;
        let maxValue = null;

        let currentNumber = null;
        let currentValue = null;

        if (null != terminalRecordData) {
            maxNumber = terminalRecordData.MaxUnsyncedTransactionNumber;
            maxValue = terminalRecordData.MaxUnsyncedTransactionValue;
        }

        currentNumber = deviceInfo.CURRENT_UNSYNCED_TRANSACTION_NUMBER;
        currentValue = deviceInfo.CURRENT_UNSYNCED_TRANSACTION_VALUE;

        if ((currentNumber != null) && (maxNumber != null) && (currentNumber >= (maxNumber * .75))) {
            console.log("Number of unsynced transactions " + currentNumber + " is high, limit is " + maxNumber);
            // if (syncTrigger) {
            //     console.log("Triggering elevated sync.");
            //     posApplet.triggerElevatedSync();
            // }
            if (currentNumber >= (maxNumber)) {
                console.log("Max transactions limit reached: " + currentNumber + " over limit " + maxNumber);
                return true;
            }
        } else if ((currentValue != null) && (maxValue != null) && (currentValue >= (maxValue * .75))) {
            console.log("Number of unsynced transactions " + currentValue + " is high, limit is " + maxValue);
            // if (syncTrigger) {
            //     console.log("Triggering elevated sync.");
            //     posApplet.triggerElevatedSync();
            // }
            if (currentValue >= (maxValue)) {
                console.log("Max transactions limit reached: " + currentValue + " over limit " + maxValue);
                return true;
            }
        } else {
            console.log("Sync check, not performing sync: " + currentNumber + " of " + maxNumber + ", and " + currentValue + " of " + maxValue);
        }

        return false;

    }
}