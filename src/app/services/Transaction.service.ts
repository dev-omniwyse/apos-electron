import { Transaction } from '../models/Transaction';

export class TransactionService {
    private static _transactionService = new TransactionService();


    public static get getInstance() {
        return TransactionService._transactionService;
    }

    constructor() {

        if (TransactionService._transactionService) {
            throw new Error("Error: Instantiation failed: Use ShoppingCartService.getInstance() instead of new.");
        }
        TransactionService._transactionService = this;
    }

    saveTransaction(shoppingCart) {

        let walletLineItem = shoppingCart._walletLineItem;
        for (let wallet of walletLineItem) {
            let transactionItem = new Transaction();

            transactionItem.$transactionID = new Date().getTime().toString();
            // transactionItem.tra
        }


    }
}