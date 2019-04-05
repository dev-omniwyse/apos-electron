import { ShoppingCartService } from "./ShoppingCart.service";
import { FareCardService } from "./Farecard.service";
import { MediaType, TICKET_GROUP } from "./MediaType";
import { TransactionService } from './Transaction.service';
import { DeviceInfo } from '../models/DeviceInfo';

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
        debugger;
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
        var bonus_ride_counter = 0;

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

    getIndexOfActiveWallet(cardsData, item){

        let cardIndex = -1;
        for(let index = 0; index < cardsData.length; index++){

            if(item._cardPID == cardsData[index].printed_id){
                cardIndex = index;
                break;
            }
        }
        return cardIndex;
    }

    getFareCodeTextForThisWallet(cardData, terminalConfig){

        let fareCodeText = "Unknown"
        let fareCodes = terminalConfig.Farecodes;
        for(let index = 0; index < fareCodes.length; index++){
            if (cardData.user_profile == fareCodes[index].FareCodeId) {
                fareCodeText = fareCodes[index].Description;
                break;
            }
        }         
        return fareCodeText;
    }
}
