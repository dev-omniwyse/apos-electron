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

    getWalletContentsForGivenUID(shoppingCart, activeUID) {
        let walletContents = null;        
        let walletLineItems = null == shoppingCart._walletLineItem ? [] : shoppingCart._walletLineItem;
        //refactor..
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

    /**
     * 
     * @param shoppingCart 
     * @param walletLineItem 
     * @param selectedItem 
     * @param isWallet this is a flag check to verify wallet Or Not
     */
    removeItem(shoppingCart, walletLineItem, selectedItem, isWallet){

        let index = -1;
        if(isWallet){
            index = this.getIndexOfWalletLineItem(shoppingCart, walletLineItem);
            shoppingCart._walletLineItem.splice(index, 1);
            
        } else {
            let walletContents = walletLineItem._walletContents;
            for(let indexOfOffering = 0; indexOfOffering < walletContents.length; indexOfOffering++) {
                if(walletContents[indexOfOffering].offering.OfferingId == selectedItem.offering.OfferingId){
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
        index = this.getWalletContentsForGivenUID(shoppingCart, item._cardUID);
        return index;
    }
    isGivenItemIsAWallet(item){

        if ( item instanceof WalletLineItem ) {
            return true;
        }
        return false;
    }

    getTax(){
        return 0;
    }
}