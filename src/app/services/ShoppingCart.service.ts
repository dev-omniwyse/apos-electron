import { ShoppingCart } from '../models/ShoppingCart';
import { WalletLineItem } from '../models/WalletLineItem';
import { MediaType } from './MediaType';

export class ShoppingCartService {

    private static _shoppingCartService = new ShoppingCartService();

    private _shoppingCart: ShoppingCart;

    public static get getInstance() {
        return ShoppingCartService._shoppingCartService;
    }

    constructor() {

        if (ShoppingCartService._shoppingCartService) {
            throw new Error('Error: Instantiation failed: Use ShoppingCartService.getInstance() instead of new.');
        }
        ShoppingCartService._shoppingCartService = this;
    }

    /**
     * Getter shoppingCart
     * @return {ShoppingCart}
     */
    public get shoppingCart(): ShoppingCart {
        return this._shoppingCart;
    }

    /**
     * Setter shoppingCart
     * @param {ShoppingCart} value
     */
    public set shoppingCart(value: ShoppingCart) {
        this._shoppingCart = value;
    }


    createLocalStoreForShoppingCart() {

        const shoppingCart = new ShoppingCart();
        shoppingCart.walletLineItem = [];
        shoppingCart.transactionID = new Date().getTime();
        shoppingCart.payments = [];
        shoppingCart.activeCardUID = '';

        return shoppingCart;
        // localStorage.setItem('shoppingCart', JSON.stringify(this._shoppingCart));
    }

    getWalletContentsForGivenUID(shoppingCart, activeUID) {
        let walletContents = null;
        const walletLineItems = null == shoppingCart._walletLineItem ? [] : shoppingCart._walletLineItem;
        for (let i = 0; i < walletLineItems.length; i++) {
            if (walletLineItems[i]._cardUID == activeUID) {
                walletContents = walletLineItems[i]._walletContents;
                break;
            }
        }
        return walletContents;
    }

    getWalletLineItemForCardPID(shoppingCart, cardPID) {
        let walletLineItem = null;
        for (let i = 0; i < shoppingCart._walletLineItem.length; i++) {
            if (shoppingCart._walletLineItem[i]._cardUID == cardPID) {
                walletLineItem = shoppingCart._walletLineItem[i];
                break;
            }
        }
        return walletLineItem;
    }


    getSubTotalForCardUID(walletLineItem) {
        let subTotal = 0;
        subTotal += walletLineItem._unitPrice;
        for (let item of walletLineItem._walletContents) {
            subTotal += (item._unitPrice * item._quantity);
        }

        return subTotal;
    }
    getNonFareTotalTax(walletLineItem) {
        let taxTotal = 0;
        if (MediaType.MERCHANDISE_ID == walletLineItem._walletTypeId) {
            const walletContents = walletLineItem._walletContents;
            for (const item of walletContents) {
                taxTotal += item._quantity * item._taxAmount;
            }
        }
        return taxTotal;
    }

    getGrandTotal(shoppingCart) {

        let total = 0;
        for (const item of shoppingCart._walletLineItem) {
            total += this.getSubTotalForCardUID(item);
            if (MediaType.MERCHANDISE_ID == item._walletTypeId) {
                total += this.getNonFareTotalTax(item);
            }
        }
        return total;
    }

    /**
     *
     * @param shoppingCart
     * @param walletLineItem
     * @param selectedItem
     * @param isWallet this is a flag check to verify wallet Or Not
     */
    removeItem(shoppingCart, walletLineItem, selectedItem, isWallet) {

        let index = -1;
        if (isWallet) {
            index = this.getIndexOfWalletLineItem(shoppingCart, walletLineItem);
            shoppingCart._walletLineItem.splice(index, 1);

        } else {
            const walletContents = walletLineItem._walletContents;
            for (let indexOfOffering = 0; indexOfOffering < walletContents.length; indexOfOffering++) {
                if (walletContents[indexOfOffering].offering.OfferingId == selectedItem.offering.OfferingId) {
                    index = indexOfOffering;
                    break;
                }
            }
            walletContents.splice(index, 1);
            walletLineItem._walletContents = walletContents;
            walletLineItem = shoppingCart._walletLineItem;
        }
        return shoppingCart;
    }

    getIndexOfWalletLineItem(shoppingCart, item) {
        let index = -1;
        const wallet = shoppingCart._walletLineItem;
        for (let i = 0; i < wallet.length; i++) {
            if (wallet[i]._cardPID == item._cardPID) {
                index = i;
                break;
            }
        }
        return index;
    }

    getIndexOfWalletContent(shoppingCart, item) {

        let index = -1;
        index = this.getWalletContentsForGivenUID(shoppingCart, item._cardUID);
        return index;
    }
    isGivenItemIsAWallet(item) {

        if (item instanceof WalletLineItem) {
            return true;
        }
        return false;
    }

    getTax() {
        return 0;
    }
}
