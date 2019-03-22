export class WalletType {
    
    constructor(private _walletTypeId ? :number, private _description ? :string,
        private _monthsToExpire ? :number){

    }

    /**
     * Getter walletTypeId
     * @return {number}
     */
	public get walletTypeId(): number {
		return this._walletTypeId;
	}

    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Getter monthsToExpire
     * @return {number}
     */
	public get monthsToExpire(): number {
		return this._monthsToExpire;
	}

    /**
     * Setter walletTypeId
     * @param {number} value
     */
	public set walletTypeId(value: number) {
		this._walletTypeId = value;
	}

    /**
     * Setter description
     * @param {string} value
     */
	public set description(value: string) {
		this._description = value;
	}

    /**
     * Setter monthsToExpire
     * @param {number} value
     */
	public set monthsToExpire(value: number) {
		this._monthsToExpire = value;
	}

}
