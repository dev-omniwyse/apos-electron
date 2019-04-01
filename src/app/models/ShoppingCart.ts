import { WalletLineItem } from './WalletLineItem';
import { NonFareLineItem } from './NonFareLineItem';

export class ShoppingCart {
    constructor(private _walletLineItem ?: WalletLineItem[],
        private _activeCardUID?: string) {
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

}