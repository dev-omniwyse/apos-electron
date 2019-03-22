import { TicketType } from './TicketType';
import { Zone } from './Zone';
import {FareCode} from './FareCode';
import {WalletType} from './WalletType';

export class Ticket {

    constructor(private _ticketId ? : number, private _description ? : string, private _descriptionLong ? : string, private _price ? : any,
        private _value ? : any, private _group ? : number, private _designator ? : number, private _dateStart ? : number, private _dateStartEpochDays ? : number, private _dateExpires ? : number,
        private _dateExpiresEpochDays ? : number, private _isSubcribable ? : boolean, private _expirationTypeId ?: number, private _expirationTime ? : number,
        private _replenishValue ? : any, private _replenishThreshold ? : any, private _ticketType ? : TicketType, private _zone ? : Zone,
        private _fareCode ? : FareCode, private _walletType ?: WalletType[]) {

    }

    /**
     * Getter ticketId
     * @return {number}
     */
    public get ticketId(): number {
        return this._ticketId;
    }

    /**
     * Getter description
     * @return {string}
     */
    public get description(): string {
        return this._description;
    }

    /**
     * Getter descriptionLong
     * @return {string}
     */
    public get descriptionLong(): string {
        return this._descriptionLong;
    }

    /**
     * Getter price
     * @return {any}
     */
    public get price(): any {
        return this._price;
    }

    /**
     * Getter value
     * @return {any}
     */
    public get value(): any {
        return this._value;
    }

    /**
     * Getter group
     * @return {number}
     */
    public get group(): number {
        return this._group;
    }

    /**
     * Getter designator
     * @return {number}
     */
    public get designator(): number {
        return this._designator;
    }

    /**
     * Getter dateStart
     * @return {number}
     */
    public get dateStart(): number {
        return this._dateStart;
    }

    /**
     * Getter dateStartEpochDays
     * @return {number}
     */
    public get dateStartEpochDays(): number {
        return this._dateStartEpochDays;
    }

    /**
     * Getter dateExpires
     * @return {number}
     */
    public get dateExpires(): number {
        return this._dateExpires;
    }

    /**
     * Getter dateExpiresEpochDays
     * @return {number}
     */
    public get dateExpiresEpochDays(): number {
        return this._dateExpiresEpochDays;
    }

    /**
     * Getter isSubcribable
     * @return {boolean}
     */
    public get isSubcribable(): boolean {
        return this._isSubcribable;
    }

    /**
     * Getter expirationTypeId
     * @return {number}
     */
    public get expirationTypeId(): number {
        return this._expirationTypeId;
    }

    /**
     * Getter expirationTime
     * @return {number}
     */
    public get expirationTime(): number {
        return this._expirationTime;
    }

    /**
     * Getter replenishValue
     * @return {any}
     */
    public get replenishValue(): any {
        return this._replenishValue;
    }

    /**
     * Getter replenishThreshold
     * @return {any}
     */
    public get replenishThreshold(): any {
        return this._replenishThreshold;
    }

    /**
     * Getter ticketType
     * @return {TicketType}
     */
    public get ticketType(): TicketType {
        return this._ticketType;
    }

    /**
     * Getter zone
     * @return {Zone}
     */
    public get zone(): Zone {
        return this._zone;
    }

    /**
     * Getter fareCode
     * @return {FareCode}
     */
    public get fareCode(): FareCode {
        return this._fareCode;
    }

    /**
     * Setter ticketId
     * @param {number} value
     */
    public set ticketId(value: number) {
        this._ticketId = value;
    }

    /**
     * Setter description
     * @param {string} value
     */
    public set description(value: string) {
        this._description = value;
    }

    /**
     * Setter descriptionLong
     * @param {string} value
     */
    public set descriptionLong(value: string) {
        this._descriptionLong = value;
    }

    /**
     * Setter price
     * @param {any} value
     */
    public set price(value: any) {
        this._price = value;
    }

    /**
     * Setter value
     * @param {any} value
     */
    public set value(value: any) {
        this._value = value;
    }

    /**
     * Setter group
     * @param {number} value
     */
    public set group(value: number) {
        this._group = value;
    }

    /**
     * Setter designator
     * @param {number} value
     */
    public set designator(value: number) {
        this._designator = value;
    }

    /**
     * Setter dateStart
     * @param {number} value
     */
    public set dateStart(value: number) {
        this._dateStart = value;
    }

    /**
     * Setter dateStartEpochDays
     * @param {number} value
     */
    public set dateStartEpochDays(value: number) {
        this._dateStartEpochDays = value;
    }

    /**
     * Setter dateExpires
     * @param {number} value
     */
    public set dateExpires(value: number) {
        this._dateExpires = value;
    }

    /**
     * Setter dateExpiresEpochDays
     * @param {number} value
     */
    public set dateExpiresEpochDays(value: number) {
        this._dateExpiresEpochDays = value;
    }

    /**
     * Setter isSubcribable
     * @param {boolean} value
     */
    public set isSubcribable(value: boolean) {
        this._isSubcribable = value;
    }

    /**
     * Setter expirationTypeId
     * @param {number} value
     */
    public set expirationTypeId(value: number) {
        this._expirationTypeId = value;
    }

    /**
     * Setter expirationTime
     * @param {number} value
     */
    public set expirationTime(value: number) {
        this._expirationTime = value;
    }

    /**
     * Setter replenishValue
     * @param {any} value
     */
    public set replenishValue(value: any) {
        this._replenishValue = value;
    }

    /**
     * Setter replenishThreshold
     * @param {any} value
     */
    public set replenishThreshold(value: any) {
        this._replenishThreshold = value;
    }

    /**
     * Setter ticketType
     * @param {TicketType} value
     */
    public set ticketType(value: TicketType) {
        this._ticketType = value;
    }

    /**
     * Setter zone
     * @param {Zone} value
     */
    public set zone(value: Zone) {
        this._zone = value;
    }

    /**
     * Setter fareCode
     * @param {FareCode} value
     */
    public set fareCode(value: FareCode) {
        this._fareCode = value;
    }

    /**
     * Getter walletType
     * @return {WalletType[]}
     */
	public get walletType(): WalletType[] {
		return this._walletType;
	}

    /**
     * Setter walletType
     * @param {WalletType[]} value
     */
	public set walletType(value: WalletType[]) {
		this._walletType = value;
	}
    

}