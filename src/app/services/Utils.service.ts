import { ShoppingCartService } from "./ShoppingCart.service";
import { FareCardService } from "./Farecard.service";
import { MediaType, TICKET_GROUP } from "./MediaType";

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
        
        for(let item of cardJSON) {

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
        let lastCardPID = null ;
        debugger;
         for (let item of shoppingCart._walletLineItem) {
            if (item._walletTypeId == MediaType.MAGNETIC_ID) {
                lastCardPID = item._cardPID;
            }
        }
        let seq = null == lastCardPID ? 0 :lastCardPID.split(" ")[1];
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
}
