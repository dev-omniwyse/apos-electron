import { MediaType, TICKET_GROUP, Constants, PRODUCT_NAME } from './MediaType';
import { DeviceInfo } from '../models/DeviceInfo';
import { CardSummary } from '../models/CardContetns';
import { SysytemConfig } from 'src/app/config';
import { Injectable } from '@angular/core';

@Injectable()
export class Utils {

    private static _utilService = new Utils();
    public static get getInstance() {
        return Utils._utilService;
    }

    constructor(private config?: SysytemConfig) {

        if (Utils._utilService) {
            throw new Error('Error: Instantiation failed: Use Utils.getInstance() instead of new.');
        }
        Utils._utilService = this;
    }

    /**
     * This method is used to generate/compare sequence number for walletLine items
     *
     * @param {*} shoppingCart
     * @returns
     * @memberof Utils
     */
    generateSequenceNumberForWalletLineItem(shoppingCart) {
        let currentMaxSequenceNumber = 0;
        const cart = shoppingCart;

        for (const item of cart._walletLineItem) {
            if (item._sequenceNumber && item._sequenceNumber > currentMaxSequenceNumber) {
                currentMaxSequenceNumber = item._sequenceNumber;
            }
        }
        const nextMaxSequenceNumber = currentMaxSequenceNumber + 1;

        return nextMaxSequenceNumber;
    }

    /**
     * This method is used to generate/compare sequence number for walletContent
     *
     * @param {*} walletLineItem
     * @returns
     * @memberof Utils
     */
    generateSequenceNumberForWalletContent(walletLineItem) {

        const walletContents = walletLineItem._walletContents;
        const seqNumber = walletContents.length + 1;
        return seqNumber;
    }

    /**
     * This method is used to get the payment types
     *
     * @param {*} paymentType
     * @returns
     * @memberof Utils
     */
    getPaymentTypeString(paymentType) {
        let paymentTypeText = null;

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
            default:
                break;
        }

        return paymentTypeText;
    }

    /**
     * This method is used to generate/compare sequence number for Magnetic
     *
     * @param {*} shoppingCart
     * @returns
     * @memberof Utils
     */
    genearateMagneticSequenceNumber(shoppingCart) {
        let currentSequence = 0;
        let lastCardPID = null;
        for (const item of shoppingCart._walletLineItem) {
            if (item._walletTypeId == MediaType.MAGNETIC_ID) {
                lastCardPID = item._cardPID;
            }
        }
        const seq = null == lastCardPID ? 0 : lastCardPID.split(' ')[1];
        currentSequence = +seq;
        return (currentSequence + 1);
    }

    /**
     * This method will check the payment method exist or not.
     *
     * @param {*} paymentMethodId
     * @param {*} shoppingcart
     * @returns
     * @memberof Utils
     */
    checkIsPaymentMethodExists(paymentMethodId, shoppingcart) {
        let indexOfPayment = -1;
        const payments = shoppingcart._payments;
        for (let index = 0; index < payments.length; index++) {
            if (paymentMethodId == payments[index].paymentMethodId) {
                indexOfPayment = index;
                break;
            }
        }
        return indexOfPayment;
    }

    getActiveWalletLineItem(cart) {

        const lastIndex = cart._walletLineItem.length - 1;

        return cart[lastIndex];
    }

    isNew(cardObj) {
        // let isCardExpired = this.isCardExpired(cardObj);
        let isCardNew = true;
        if (cardObj.products.length === 0) {
            console.log('Smart card doesn\'t have expected fixed value product.');
            isCardNew = false;
        } else if (cardObj.is_card_bad_listed === true) {
            console.log('Smart card is badlisted, cannot encode.');
            isCardNew = false;
        } else {
            if (cardObj.products.length > 1) {
                console.log('Smart card has more than 1 product, ' +
                    'does not match expected blank.');
                isCardNew = false;
            } else {
                if (cardObj.products[0].product_type === TICKET_GROUP.VALUE) {
                    if (cardObj.products[0].remaining_value === 0) {
                    } else {
                        console.log('Smart card stored value product not $0, ' +
                            'does not match expected blank.');
                        isCardNew = false;
                    }
                } else {
                    console.log('Smart card product not expected fixed value product, ' +
                        'does not match expected blank.');
                    isCardNew = false;
                }
            }
        }
        return isCardNew;
    }

    /**
     * This method will get count for bonus rides
     *
     * @param {*} cardData
     * @returns
     * @memberof Utils
     */
    getBonusRideCount(cardData) {
        let bonus_rides = 0;
        let bonusRideStatusText = 'Bonus Ride(s): ' + bonus_rides;
        if ((cardData.num_bonus_passes != null) &&
            (cardData.num_bonus_passes > 0)) {

            if (cardData.bonus_pass) {
                bonus_rides = cardData.bonus_pass.ride_count;
            }
            bonusRideStatusText = 'Bonus Ride(s): ' + bonus_rides;
            console.log('Bonus ride set!');
        }
        return bonusRideStatusText;
    }

    getNextBonusRidesCount(cardData, terminalConfig, cardTypeDetected) {
        const bonusRideThreshold = terminalConfig.BonusRideThreshold;
        let bonus_ride_counter = 0;
        if (cardTypeDetected == MediaType.LUCC) {
            cardData.products.forEach(fItem => {
                if (fItem.product_type == TICKET_GROUP.VALUE) {
                    bonus_ride_counter = fItem.bonus_ride_count;
                }
            });
            // if (cardData.product.product_type == TICKET_GROUP.VALUE) {
            //     bonus_ride_counter = cardData.product.bonus_ride_count;
            // }
        } else {
            // cardStore.products.forEach(cardElement => {
            cardData.products.forEach(fItem => {
                if (fItem.product_type == TICKET_GROUP.VALUE) {
                    bonus_ride_counter = fItem.bonus_ride_count;
                }
            });
        }
        const text = 'Next Bonus: ' + bonus_ride_counter + '/' + bonusRideThreshold;
        return text;
    }
    /**
     * checking is there any empty products for magnetic.
     *
     * @param {*} shoppingCart
     * @returns
     * @memberof Utils
     */
    isAnyEmptyMagnetics(shoppingCart) {
        let isEmpty = false;
        const walletLineItems = shoppingCart._walletLineItem;
        for (let itemIndex = 0; itemIndex < walletLineItems.length; itemIndex++) {
            if (walletLineItems[itemIndex]._walletTypeId == MediaType.MAGNETIC_ID
                && (0 == walletLineItems[itemIndex]._walletContents.length)) {
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

        const walletLineItems = shoppingcart._walletLineItem;
        let isEmpty = false;
        if (0 == walletLineItems.length) {
            isEmpty = true;
        } else if (1 == walletLineItems.length && !this.isValidMerchandise(walletLineItems[0])) {
            isEmpty = true;
        }
        return isEmpty;
    }
    createDeviceInfoDefaultRecord() {
        const deviceInfo = new DeviceInfo();
        deviceInfo.$CURRENT_UNSYNCED_TRANSACTION_NUMBER = 0;
        deviceInfo.$CURRENT_UNSYNCED_TRANSACTION_VALUE = 0;
        deviceInfo.$LIFETIME_TRANSACTION_COUNT = 0;
        deviceInfo.$LIFETIME_TRANSACTION_VALUE = 0;
        deviceInfo.$terminalID = '0';
        deviceInfo.$failedLoginCount = 0;
        deviceInfo.$PRESHARE = '';
        deviceInfo.$operatingMode = '0';
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

        let fareCodeText = 'Unknown';
        const fareCodes = terminalConfig.Farecodes;
        for (let index = 0; index < fareCodes.length; index++) {
            if (cardData.user_profile == fareCodes[index].FareCodeId) {
                fareCodeText = fareCodes[index].Description;
                break;
            }
        }
        return fareCodeText;
    }

    getStatusOfWallet(readCardJson) {

        let cardStatus = '';
        const isCardExpired = this.isCardExpired(readCardJson);
        const isCardBadListed = readCardJson.is_card_bad_listed;

        if (isCardExpired === true) {
            cardStatus = 'EXPIRED';
        } else if (isCardBadListed === true) {
            cardStatus = 'INACTIVE';
        } else {
            cardStatus = 'Active';
        }

        return cardStatus;
    }
    /**
     * Checking the card is expired ot not.
     *
     * @param {*} data
     * @returns
     * @memberof Utils
     */
    isCardExpired(data) {

        const currentEpochDays = this.getCurrentEpochDays();
        let isExpired = false;
        if (data.card_expiration_date > 0 && data.card_expiration_date < currentEpochDays) {
            isExpired = true;
        } else if (data.user_profile_expiration_date > 0 && data.user_profile_expiration_date < currentEpochDays) {
            isExpired = true;
        }

        return isExpired;
    }

    getCurrentEpochDays() {
        const startDate = Date.parse('1970-01-01');
        const endDate = Date.parse(new Date().toString());
        const timeDiff = endDate - startDate;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return daysDiff;
    }

    getWalletProducts(carddata, ticketMap) {

        const prodcts = [];
        carddata.products.forEach(product => {
            const cardSummary = new CardSummary();
            const productType = product.product_type;

            cardSummary.$product = this.getProductTypeBasedOnProductTypeID(productType);


            const days = product.days;
            const recharges_pending = product.recharges_pending;
            const remainingRides = product.remaining_rides;
            const start_date_epoch_days = product.start_date_epoch_days;
            const exp_date_epoch_days = product.exp_date_epoch_days;
            let addTime = 0;
            let productStatus = '';
            const currentEpochDays = this.getCurrentEpochDays();
            if (null != product.add_time) {
                addTime = product.add_time;
            }

            if (true == product.is_prod_bad_listed) {
                productStatus = 'Inactive';
            } else if (exp_date_epoch_days > 1 && exp_date_epoch_days < currentEpochDays && TICKET_GROUP.PERIOD_PASS != productType) {
                productStatus = 'Expired';
            } else if (start_date_epoch_days == 65535) {
                // rolling start
                productStatus = 'Active';
            } else {
                productStatus = 'Active';
            }
            if (0 == remainingRides) {
                productStatus = product.status;
            }
            let cardBalance = '';

            const d = new Date();
            const currentMinutesInDay = (d.getHours() * 60) + d.getMinutes();
            let productDescription = '';
            switch (productType) {
                case TICKET_GROUP.PERIOD_PASS:
                    if (exp_date_epoch_days > 0) {

                        const exp = new Date(product.exp_date_str);
                        exp.setTime(exp.getTime() + addTime);
                        cardBalance = 'Exp: ' + this.getProductExpirationDate(exp_date_epoch_days, addTime)
                            + ' ' + this.getProductExpirationTime(addTime);

                    } else {

                        cardBalance = (days + 1) + ' Days';
                    }
                    productDescription = (days + 1) + ' Day Pass';
                    if (0 != exp_date_epoch_days && 65535 != exp_date_epoch_days) {
                        // exp date on the card is essentially the day BEFORE the expiration...but at midnight.
                        if ((exp_date_epoch_days) < currentEpochDays) {
                            productStatus = 'Expired';
                        } else if ((exp_date_epoch_days) == currentEpochDays) {
                            if (addTime <= currentMinutesInDay) {
                                productStatus = 'Expired';
                            }
                        }
                    } else {
                        if (start_date_epoch_days != 65535) {
                            if ((start_date_epoch_days + days + 1) < currentEpochDays) {
                                productStatus = 'Expired';
                            } else if ((start_date_epoch_days + days + 1) == currentEpochDays) {

                                if (addTime <= currentMinutesInDay) {
                                    productStatus = 'Expired';
                                }
                            }
                        }
                    }
                    if (recharges_pending) {
                        productStatus += ' (' + recharges_pending + ' Pending)';
                    }

                    break;
                case TICKET_GROUP.RIDE:
                    if (1 == remainingRides) {
                        cardBalance = remainingRides + ' Ride';
                    } else {
                        cardBalance = remainingRides + ' Rides';
                    }
                    productDescription = PRODUCT_NAME.STORED_RIDE;
                    break;
                case TICKET_GROUP.VALUE:

                    let remaining_value = 0;

                    if (product.remaining_value && product.remaining_value > 0) {
                        remaining_value = product.remaining_value / 100;
                    }

                    cardBalance = '$ ' + remaining_value.toFixed(2);
                    productDescription = PRODUCT_NAME.STORED_VALUE;
                    break;
                default:
                    break;
            }
            cardSummary.$balance = cardBalance;
            const description = this.getProductDescription(product, ticketMap);
            if (description != undefined) {
                productDescription = description;
            }
            cardSummary.$status = productStatus;
            cardSummary.$description = productDescription;
            prodcts.push(cardSummary);
        });
        return prodcts;
    }

    /**
     * This method will get the expiration time for products
     *
     * @param {*} addTime
     * @returns
     * @memberof Utils
     */
    getProductExpirationTime(addTime) {
        let d = new Date();

        if (addTime === 0) {
            d.setHours(23, 59, 59, 0);
        } else {
            // set your hour to midnight
            d.setHours(0, 0, 0, 0);
            d = new Date(d.getTime() + (addTime * 60000));
        }

        let hours = d.getHours();
        const minutes = d.getMinutes();
        // tslint:disable-next-line:prefer-const
        let amORpm = hours > 12 ? 'PM' : 'AM';
        if (hours > 12) {
            hours -= 12;
        }
        const expirationTime = hours + ':' + (minutes == 0 ? '00' : minutes) + ' ' + amORpm;

        return expirationTime;
    }
    /**
     * This method will get the description for product
     *
     * @param {*} product
     * @param {*} ticketMap
     * @returns
     * @memberof Utils
     */
    getProductDescription(product, ticketMap) {
        let description = undefined;

        const ticketKey = product.product_type + '_' + product.designator;
        if (ticketMap.size != 0 && ticketMap.get(ticketKey) != undefined) {
            description = ticketMap.get(ticketKey);
        }
        return description;
    }

    pushTicketToMap(element, ticketMap) {

        if (element.Ticket != null) {
            const ticket = element.Ticket;

            if (ticket.Group != null && ticket.Designator != null) {
                const ticketKey = ticket.Group + '_' + ticket.Designator;
                ticketMap.set(ticketKey, ticket.Description);
            }
        }
        return ticketMap;
    }
    /**
     * This method will help us to get the product type based on productTypeID
     *
     * @param {*} product_typeId
     * @returns
     * @memberof Utils
     */
    getProductTypeBasedOnProductTypeID(product_typeId) {

        let productName = 'Unknown';

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

    /**
     * This method will get the expiration date for products
     *
     * @param {*} exp_date_epoch_days
     * @param {*} addTime
     * @returns
     * @memberof Utils
     */
    getProductExpirationDate(exp_date_epoch_days, addTime) {
        const expDate = new Date(1970, 0, 1, 0, 0, 0);

        const expDateDays = exp_date_epoch_days;

        expDate.setDate(expDate.getDate() + expDateDays);
        const y = expDate.getFullYear().toString();
        let m = (expDate.getMonth() + 1).toString();
        let d = expDate.getDate().toString();


        if (m.length == 1) {
            m = '0' + m;
        }
        if (d.length == 1) {
            d = '0' + d;
        }
        return m + '/' + d + '/' + y;

    }

    /**
     *
     *
     * @param {*} exp_date_epoch_days
     * @param {*} addTime
     * @returns
     * @memberof Utils
     */
    isProductExpiredDesfire(exp_date_epoch_days, addTime) {
        let isExpired = false;
        const currentEpochDays = this.getCurrentEpochDays();

        if (0 != exp_date_epoch_days && 65535 != exp_date_epoch_days) {
            // exp date on the card is essentially the day BEFORE the expiration...but at midnight.
            if (exp_date_epoch_days < currentEpochDays) {
                isExpired = true;
                // product expires TODAY, check the time against addTime on the card
            } else if (exp_date_epoch_days == currentEpochDays) {

                const d = new Date();
                const currentMinutesInDay = (d.getHours() * 60) + d.getMinutes();

                if (addTime <= currentMinutesInDay) {
                    isExpired = true;
                }
            }
        }

        return isExpired;
    }

    /**
   *
   * This function resturns userdetails based on UserID
   * @param {*} userID
   * @returns
   * @memberof CarddataComponent
   */

    getUserByUserID(userID) {
        let userData = null;
        const userJSON = JSON.parse(localStorage.getItem('shiftReport'));
        for (const user of userJSON) {
            if (user.userID == userID) {
                userData = user;
                break;
            }
        }
        return userData;
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
            console.log('Number of unsynced transactions ' + currentNumber + ' is high, limit is ' + maxNumber);
            if (currentNumber >= (maxNumber)) {
                return true;
            }
        } else if ((currentValue != null) && (maxValue != null) && (currentValue >= (maxValue * .75))) {
            if (currentValue >= (maxValue)) {
                return true;
            }
        }
        return false;

    }

    populateDummyCard() {
        const cardData = {'uid': 1154851244231552, 'printed_id': '0000000988', 'user_profile': 1, 'card_expiration_date': 18190,
        'user_profile_expiration_date': 0, 'card_expiration_date_str': 'Oct 21, 2019', 'user_profile_expiration_date_str': 'Jan 01, 1970',
        'is_card_bad_listed': false, 'is_card_registered': false, 'preferred_language': 0, 'accessibility_flags': 0, 'products': [],
        'journals': null, 'is_tpb_locked': true, 'tpb_code': 0, 'manufacturer_id': 0, 'equipment_type': 0, 'equipment_id': 0,
        'num_products': 0, 'cardPropertiesFileVersion': 1 , 'printedIDFileVersion': 1, 'productListFileVersion': 0,
        'prioritiesAndConfigurationType': 1, 'individualLoadSeqNo': 0, 'rangeLoadSeqNo': 0, 'agency': 194, 'security_code': 0,
        'account_flag': true, 'account_load_sequence': 0, 'group': 1, 'designator': 43, 'account_fulfillment': false,
        'num_transfers': 0, 'num_bonus_passes': 0, 'num_pay_as_you_go_passes': 0, 'transfer': null,
        'bonus_pass': null, 'pay_as_you_go_pass': null };
        return cardData;
    }

    isFromAccountBasedCard() {
        const isFromAccountCardBased: Boolean = localStorage.getItem('addCardForAccount') == 'true' ? true : false;
        return isFromAccountCardBased;
      }

}
