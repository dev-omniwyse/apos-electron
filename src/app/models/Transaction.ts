import { PaymentType } from './Payments';
import { Items } from './Items';


export class Transaction {

    constructor(private userID?: string, private timestamp?: number, private transactionID?: number, private transactionType?: string,
        private transactionAmount?: number, private salesAmount?: number, private taxAmount?: number, private items?:Items [],
        private payments?: PaymentType[], private shiftType?: number){
            
    }


    /**
     * Getter $userID
     * @return {string}
     */
    public get $userID(): string {
        return this.userID;
    }

    /**
     * Getter $timestamp
     * @return {number}
     */
    public get $timestamp(): number {
        return this.timestamp;
    }

    /**
     * Getter $transactionID
     * @return {number}
     */
    public get $transactionID(): number {
        return this.transactionID;
    }

    /**
     * Getter $transactionType
     * @return {string}
     */
    public get $transactionType(): string {
        return this.transactionType;
    }

    /**
     * Getter $transactionAmount
     * @return {number}
     */
    public get $transactionAmount(): number {
        return this.transactionAmount;
    }

    /**
     * Getter $salesAmount
     * @return {number}
     */
    public get $salesAmount(): number {
        return this.salesAmount;
    }

    /**
     * Getter $taxAmount
     * @return {number}
     */
    public get $taxAmount(): number {
        return this.taxAmount;
    }

    /**
     * Getter $items
     * @return {[]}
     */
    public get $items(): Items[] {
        return this.items;
    }

    /**
     * Getter $payments
     * @return {[]}
     */
    public get $payments(): PaymentType[] {
        return this.payments;
    }

    /**
     * Setter $userID
     * @param {string} value
     */
    public set $userID(value: string) {
        this.userID = value;
    }

    /**
     * Setter $timestamp
     * @param {number} value
     */
    public set $timestamp(value: number) {
        this.timestamp = value;
    }

    /**
     * Setter $transactionID
     * @param {number} value
     */
    public set $transactionID(value: number) {
        this.transactionID = value;
    }

    /**
     * Setter $transactionType
     * @param {string} value
     */
    public set $transactionType(value: string) {
        this.transactionType = value;
    }

    /**
     * Setter $transactionAmount
     * @param {number} value
     */
    public set $transactionAmount(value: number) {
        this.transactionAmount = value;
    }

    /**
     * Setter $salesAmount
     * @param {number} value
     */
    public set $salesAmount(value: number) {
        this.salesAmount = value;
    }

    /**
     * Setter $taxAmount
     * @param {number} value
     */
    public set $taxAmount(value: number) {
        this.taxAmount = value;
    }

    /**
     * Setter $items
     * @param {[]} value
     */
    public set $items(value:Items []) {
        this.items = value;
    }

    /**
     * Setter $payments
     * @param {[]} value
     */
    public set $payments(value: PaymentType[]) {
        this.payments = value;
    }

    /**
     * Getter $shiftType
     * @return {number}
     */
    public get $shiftType(): number {
        return this.shiftType;
    }

    /**
     * Setter $shiftType
     * @param {number} value
     */
    public set $shiftType(value: number) {
        this.shiftType = value;
    }


}