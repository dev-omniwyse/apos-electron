import { WalletLineItem } from './WalletLineItem';
import { NonFareLineItem } from './NonFareLineItem';
import { PaymentType } from './Payments';

export class ShoppingCart {
    
    constructor(private _walletLineItem?: WalletLineItem[],
        private _activeCardUID?: string, private _transactionID ?:number,
        private _payments ?: PaymentType[] ){

    }

    /**
     * Getter transactionID
     * @return {number}
     */
	public get transactionID(): number {
		return this._transactionID;
	}

    /**
     * Setter transactionID
     * @param {number} value
     */
	public set transactionID(value: number) {
		this._transactionID = value;
	}

    /**
     * Getter walletLineItem
     * @return {WalletLineItem[]}
     */
    public get walletLineItem(): WalletLineItem[] {
        return this._walletLineItem;
    }

    /**
     * Setter walletLineItem
     * @param {WalletLineItem[]} value
     */
    public set walletLineItem(value: WalletLineItem[]) {
        this._walletLineItem = value;
    }

    /**
     * Getter activeCardUID
     * @return {string}
     */
    public get activeCardUID(): string {
        return this._activeCardUID;
    }

    /**
     * Setter activeCardUID
     * @param {string} value
     */
    public set activeCardUID(value: string) {
        this._activeCardUID = value;
    }

    /**
     * Getter walletLineItem
     * @return {PaymentType[]}
     */
    public get payments(): PaymentType[] {
        return this._payments;
    }

    /**
     * Setter activeCardUID
     * @param {payments} value
     */
    public set payments(payments: PaymentType[]) {
        this._payments = payments;
    }

}