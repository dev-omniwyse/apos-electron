export class WalletContent {
    
    // Values returned from encoding
    //_slot, _balance, _startDate, _expirationDate, _rechargesPending

    constructor(private _cardUID ? : string, private _sequenceNumber ? : number, private _offering ? : any, private _unitPrice ? : any,
        private _description ? : string, private _quantity ? : number, private _status ? : string, private _slot ? : number,
        private _balance ? : any, private _startDate ? : number,private _expirationDate ? : number, private _rechargesPending ? : number){

    }

    /**
     * Getter cardUID
     * @return {string}
     */
	public get cardUID(): string {
		return this._cardUID;
	}

    /**
     * Getter sequenceNumber
     * @return {number}
     */
	public get sequenceNumber(): number {
		return this._sequenceNumber;
	}

    /**
     * Getter offering
     * @return {any}
     */
	public get offering(): any {
		return this._offering;
	}

    /**
     * Getter unitPrice
     * @return {any}
     */
	public get unitPrice(): any {
		return this._unitPrice;
	}

    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Getter quantity
     * @return {number}
     */
	public get quantity(): number {
		return this._quantity;
	}

    /**
     * Getter status
     * @return {string}
     */
	public get status(): string {
		return this._status;
	}

    /**
     * Getter slot
     * @return {number}
     */
	public get slot(): number {
		return this._slot;
	}

    /**
     * Getter balance
     * @return {any}
     */
	public get balance(): any {
		return this._balance;
	}

    /**
     * Getter startDate
     * @return {number}
     */
	public get startDate(): number {
		return this._startDate;
	}

    /**
     * Getter expirationDate
     * @return {number}
     */
	public get expirationDate(): number {
		return this._expirationDate;
	}

    /**
     * Getter rechargesPending
     * @return {number}
     */
	public get rechargesPending(): number {
		return this._rechargesPending;
	}

    /**
     * Setter cardUID
     * @param {string} value
     */
	public set cardUID(value: string) {
		this._cardUID = value;
	}

    /**
     * Setter sequenceNumber
     * @param {number} value
     */
	public set sequenceNumber(value: number) {
		this._sequenceNumber = value;
	}

    /**
     * Setter offering
     * @param {any} value
     */
	public set offering(value: any) {
		this._offering = value;
	}

    /**
     * Setter unitPrice
     * @param {any} value
     */
	public set unitPrice(value: any) {
		this._unitPrice = value;
	}

    /**
     * Setter description
     * @param {string} value
     */
	public set description(value: string) {
		this._description = value;
	}

    /**
     * Setter quantity
     * @param {number} value
     */
	public set quantity(value: number) {
		this._quantity = value;
	}

    /**
     * Setter status
     * @param {string} value
     */
	public set status(value: string) {
		this._status = value;
	}

    /**
     * Setter slot
     * @param {number} value
     */
	public set slot(value: number) {
		this._slot = value;
	}

    /**
     * Setter balance
     * @param {any} value
     */
	public set balance(value: any) {
		this._balance = value;
	}

    /**
     * Setter startDate
     * @param {number} value
     */
	public set startDate(value: number) {
		this._startDate = value;
	}

    /**
     * Setter expirationDate
     * @param {number} value
     */
	public set expirationDate(value: number) {
		this._expirationDate = value;
	}

    /**
     * Setter rechargesPending
     * @param {number} value
     */
	public set rechargesPending(value: number) {
		this._rechargesPending = value;
	}

    
}
