import { ShoppingCart } from "../models/ShoppingCart";

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

    // setCart(data){
    //     localStorage.setItem('shoppingCart', JSON.stringify(data));
    // }

    // getCart() {

    //     let item =  JSON.parse(localStorage.getItem('shoppingCart'));
        
    //     return item;
    // }
    
    // clearCart() {
    //     localStorage.removeItem('shoppingCart');
    //     this.emptyCart();
    // }

    // emptyCart(){
    //     this._shoppingCart = null;
    // }



    

}