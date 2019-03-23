
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

    saveTransaction(shoppingCart){
        
    }
}