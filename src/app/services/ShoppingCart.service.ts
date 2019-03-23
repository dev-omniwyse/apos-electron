import { ShoppingCart } from "../models/ShoppingCart";
import { WalletLineItem } from '../models/WalletLineItem';

export class ShoppingCartService {

    private static _shoppingCartService = new ShoppingCartService();

    private _shoppingCart : ShoppingCart;

    public static get getInstance() {
        return ShoppingCartService._shoppingCartService;
    }

    constructor() {

        if (ShoppingCartService._shoppingCartService) {
            throw new Error("Error: Instantiation failed: Use ShoppingCartService.getInstance() instead of new.");
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

        let shoppingCart = new ShoppingCart();
        shoppingCart.walletLineItem = [];
        shoppingCart.activeCardUID = "";

        return shoppingCart;
        // localStorage.setItem('shoppingCart', JSON.stringify(this._shoppingCart));
    }

    getWalletContentsForGivenUID(shoppingCart, activePID) {
        let walletContents = null;
        let walletLineItems = null == shoppingCart._walletLineItem ? [] : shoppingCart._walletLineItem;
        //refactor..
        for (let i = 0; i < walletLineItems.length; i++) {
            if (walletLineItems[i].cardPID == activePID) {
                walletContents = walletLineItems[i].walletContents;
                break;
            }
        }
        return walletContents;
    }

    getWalletLineItemForCardPID(shoppingCart, cardPID) {
        let walletLineItem = null;
        for (let i = 0; i < shoppingCart._walletLineItem.length; i++) {
            if (shoppingCart._walletLineItem[i].cardUID == cardPID) {
                walletLineItem = shoppingCart._walletLineItem[i];
                break;
            }
        }
        return walletLineItem;
    }

    
    getSubTotalForCardUID(walletLineItem) {
        let subTotal = 0;
        subTotal += walletLineItem._unitPrice;
        for(let item of walletLineItem._walletContents){
            subTotal += item._unitPrice;      
        }

        return subTotal;
    }

    getGrandTotal(shoppingCart){

        let total = 0;
        for(let item of shoppingCart._walletLineItem) {
            total += this.getSubTotalForCardUID(item);
        }
        return total;
    }

    removeProduct(shoppingCart, selectedItem){

        let flag = this.isGivenItemIsAWallet(selectedItem);
        let index = -1;
        if(flag){
            index = this.getIndexOfWalletLineItem(shoppingCart, selectedItem);
            shoppingCart.splice();
        } else {
            index = this.getIndexOfWalletContent(shoppingCart, selectedItem);
        }
        // array.splic0e(index, 1);
    }

    getIndexOfWalletLineItem(shoppingCart, item){
        let index = -1;
        let wallet = shoppingCart._walletLineItem;
        for(let i=0; i<wallet.length;i++){
            if(wallet[i]._cardPID == item._cardPID){
                index = i;
                break;
            }
        }
        return index;
    }

    getIndexOfWalletContent(shoppingCart, item){

        let index = -1;
        // this.getWalletContentsForGivenUID();
        return index;
    }
    isGivenItemIsAWallet(item){

        if ( item instanceof WalletLineItem ) {
            return true;
        }
        return false;
    }
}