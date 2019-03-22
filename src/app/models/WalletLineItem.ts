import { Offering } from './Offering';
import { WalletContent } from './WalletContent';

export class WalletLineItem {

    
    constructor(private _sequenceNumber ?: number, private _offering?: Offering, private _cardPID?: string,
        private _cardUID?: string,
        private _walletTypeId?: number,
        private _fareCodeId?: number,
        private _unitPrice?: any,
        private _description?: string,
        private _walletContents ?: WalletContent[],
        private _cardExpiration?: number,
        private _encoded?: boolean) {

    } 


    /**
     * Getter sequenceNumber
     * @return {number}
     */
	public get sequenceNumber(): number {
		return this._sequenceNumber;
	}

    /**
     * Setter sequenceNumber
     * @param {number} value
     */
	public set sequenceNumber(value: number) {
		this._sequenceNumber = value;
	}


    /**
     * Getter offering  
     * @return {Offering}
     */
    public get offering(): Offering {
        return this._offering;
    }

    /**
     * Getter cardPID
     * @return {string}
     */
    public get cardPID(): string {
        return this._cardPID;
    }

    /**
     * Getter cardUID
     * @return {string}
     */
    public get cardUID(): string {
        return this._cardUID;
    }

    /**
     * Getter walletTypeId
     * @return {number}
     */
    public get walletTypeId(): number {
        return this._walletTypeId;
    }

    /**
     * Getter fareCodeId
     * @return {number}
     */
    public get fareCodeId(): number {
        return this._fareCodeId;
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
     * Getter cardExpiration
     * @return {number}
     */
    public get cardExpiration(): number {
        return this._cardExpiration;
    }

    /**
     * Getter encoded
     * @return {boolean}
     */
    public get encoded(): boolean {
        return this._encoded;
    }

    /**
     * Setter offering
     * @param {Offering} value
     */
    public set offering(value: Offering) {
        this._offering = value;
    }

    /**
     * Setter cardPID
     * @param {string} value
     */
    public set cardPID(value: string) {
        this._cardPID = value;
    }

    /**
     * Setter cardUID
     * @param {string} value
     */
    public set cardUID(value: string) {
        this._cardUID = value;
    }

    /**
     * Setter walletTypeId
     * @param {number} value
     */
    public set walletTypeId(value: number) {
        this._walletTypeId = value;
    }

    /**
     * Setter fareCodeId
     * @param {number} value
     */
    public set fareCodeId(value: number) {
        this._fareCodeId = value;
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
     * Setter cardExpiration
     * @param {number} value
     */
    public set cardExpiration(value: number) {
        this._cardExpiration = value;
    }

    /**
     * Setter encoded
     * @param {boolean} value
     */
    public set encoded(value: boolean) {
        this._encoded = value;
    }

    /**
     * Getter walletContents
     * @return {WalletContent[]}
     */
	public get walletContents(): WalletContent[] {
		return this._walletContents;
	}

    /**
     * Setter walletContents
     * @param {WalletContent[]} value
     */
	public set walletContents(value: WalletContent[]) {
		this._walletContents = value;
	}


}