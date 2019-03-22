import { WalletType } from './WalletType';
import { Ticket } from './Ticket';
export class Offering {
    
    constructor(private _offeringId?: number, private _productIdentifier?: string, private _description?: string,
        private _unitPrice?: any, private _taxRate?: any, private _isMerchandise?: boolean, private _isTaxable?: boolean,
        private _quantityMax?: number, private _dateEffective?: number, private _dateExpires?: number, private _ticket?: Ticket,
        private _walletType ? : WalletType, private _isAccountBased ? : boolean, private _isCardBased ? : boolean) {
    }

    /**
     * Getter offeringId
     * @return {number}
     */
	public get offeringId(): number {
		return this._offeringId;
	}

    /**
     * Getter productIdentifier
     * @return {string}
     */
	public get productIdentifier(): string {
		return this._productIdentifier;
	}

    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Getter unitPrice
     * @return {any}
     */
	public get unitPrice(): any {
		return this._unitPrice;
	}

    /**
     * Getter taxRate
     * @return {any}
     */
	public get taxRate(): any {
		return this._taxRate;
	}

    /**
     * Getter isMerchandise
     * @return {boolean}
     */
	public get isMerchandise(): boolean {
		return this._isMerchandise;
	}

    /**
     * Getter isTaxable
     * @return {boolean}
     */
	public get isTaxable(): boolean {
		return this._isTaxable;
	}

    /**
     * Getter quantityMax
     * @return {number}
     */
	public get quantityMax(): number {
		return this._quantityMax;
	}

    /**
     * Getter dateEffective
     * @return {number}
     */
	public get dateEffective(): number {
		return this._dateEffective;
	}

    /**
     * Getter dateExpires
     * @return {number}
     */
	public get dateExpires(): number {
		return this._dateExpires;
	}

    /**
     * Getter ticket
     * @return {Ticket}
     */
	public get ticket(): Ticket {
		return this._ticket;
	}

    /**
     * Getter walletType
     * @return {WalletType}
     */
	public get walletType(): WalletType {
		return this._walletType;
	}

    /**
     * Getter isAccountBased
     * @return {boolean}
     */
	public get isAccountBased(): boolean {
		return this._isAccountBased;
	}

    /**
     * Getter isCardBased
     * @return {boolean}
     */
	public get isCardBased(): boolean {
		return this._isCardBased;
	}

    /**
     * Setter offeringId
     * @param {number} value
     */
	public set offeringId(value: number) {
		this._offeringId = value;
	}

    /**
     * Setter productIdentifier
     * @param {string} value
     */
	public set productIdentifier(value: string) {
		this._productIdentifier = value;
	}

    /**
     * Setter description
     * @param {string} value
     */
	public set description(value: string) {
		this._description = value;
	}

    /**
     * Setter unitPrice
     * @param {any} value
     */
	public set unitPrice(value: any) {
		this._unitPrice = value;
	}

    /**
     * Setter taxRate
     * @param {any} value
     */
	public set taxRate(value: any) {
		this._taxRate = value;
	}

    /**
     * Setter isMerchandise
     * @param {boolean} value
     */
	public set isMerchandise(value: boolean) {
		this._isMerchandise = value;
	}

    /**
     * Setter isTaxable
     * @param {boolean} value
     */
	public set isTaxable(value: boolean) {
		this._isTaxable = value;
	}

    /**
     * Setter quantityMax
     * @param {number} value
     */
	public set quantityMax(value: number) {
		this._quantityMax = value;
	}

    /**
     * Setter dateEffective
     * @param {number} value
     */
	public set dateEffective(value: number) {
		this._dateEffective = value;
	}

    /**
     * Setter dateExpires
     * @param {number} value
     */
	public set dateExpires(value: number) {
		this._dateExpires = value;
	}

    /**
     * Setter ticket
     * @param {Ticket} value
     */
	public set ticket(value: Ticket) {
		this._ticket = value;
	}

    /**
     * Setter walletType
     * @param {WalletType} value
     */
	public set walletType(value: WalletType) {
		this._walletType = value;
	}

    /**
     * Setter isAccountBased
     * @param {boolean} value
     */
	public set isAccountBased(value: boolean) {
		this._isAccountBased = value;
	}

    /**
     * Setter isCardBased
     * @param {boolean} value
     */
	public set isCardBased(value: boolean) {
		this._isCardBased = value;
	}

    
}
