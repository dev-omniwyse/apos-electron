import { ShoppingCartService } from "./ShoppingCart.service";
import { FareCardService } from "./Farecard.service";
import { MediaType } from "./MediaType";

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
    
    generateSequenceNumberForWalletLineItem(shoppingCart) {
        let currentMaxSequenceNumber = 0;
        var cart = shoppingCart;

        for (let item of cart._walletLineItem) {
            if (item._sequenceNumber && item._sequenceNumber > currentMaxSequenceNumber) {
                currentMaxSequenceNumber = item._sequenceNumber;
            }
        }
        let nextMaxSequenceNumber = currentMaxSequenceNumber + 1;

        return nextMaxSequenceNumber;
    }

    generateSequenceNumberForWalletContent(shoppingCart, cardPID) {

        let walletContents = FareCardService.getInstance.getWalletContentsForGivenUID(shoppingCart, cardPID);
        let seqNumber = walletContents.length + 1;
        return seqNumber;
    }
   
    //product limits - 

    genearateMagneticSequenceNumber(shoppingCart){
        let currentSequence = 0;
        for(let item of shoppingCart._walletLineItem) {

            if(item._walletTypeId == MediaType.MAGNETIC_ID){
                currentSequence++;
            }
        }

        return  ( currentSequence + 1 );
    }

    getActiveWalletLineItem(cart){

        let lastIndex = cart._walletLineItem.length-1;
        
        return cart[lastIndex];
    }
}