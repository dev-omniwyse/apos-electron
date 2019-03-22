import { Offering } from "./Offering";

export class NonFareLineItem {
    
    constructor (private _sequenceNumber ? : number, private _offering ?: Offering, private _unitPrice ? : any,
                private _description ? : string, private _quantity ?: number){

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
     * @return {Offering}
     */
	public get offering(): Offering {
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
     * Setter sequenceNumber
     * @param {number} value
     */
	public set sequenceNumber(value: number) {
		this._sequenceNumber = value;
	}

    /**
     * Setter offering
     * @param {Offering} value
     */
	public set offering(value: Offering) {
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


}
