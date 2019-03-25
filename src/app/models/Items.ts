import { WalletContentItems } from './WalletContentItems';

export class Items {

    constructor(private transactionID?: number, private cardPID?: string, private cardUID?: number,
        private quantity?: number, private productIdentifier?: number, private ticketTypeId?: number,
        private ticketValue?: number, private slotNumber?: number, private expirationDate?: number,
        private balance?: number, private IsMerchandise?: boolean, private IsBackendMerchandise?: boolean,
        private IsFareCard?: boolean, private unitPrice?: number, private totalCost?: number,
        private userID?: string, private shiftID?: number, private fareCode?: string,
        private walletContentItems?: WalletContentItems[], private walletTypeId?: number, private shiftType?: number,
        private timestamp?: number, private tax?:number) {

    }


    /**
     * Getter $transactionID
     * @return {number}
     */
    public get $transactionID(): number {
        return this.transactionID;
    }

    /**
     * Getter $cardPID
     * @return {string}
     */
    public get $cardPID(): string {
        return this.cardPID;
    }

    /**
     * Getter $cardUID
     * @return {number}
     */
    public get $cardUID(): number {
        return this.cardUID;
    }

    /**
     * Getter $quantity
     * @return {number}
     */
    public get $quantity(): number {
        return this.quantity;
    }

    /**
     * Getter $productIdentifier
     * @return {number}
     */
    public get $productIdentifier(): number {
        return this.productIdentifier;
    }

    /**
     * Getter $ticketTypeId
     * @return {number}
     */
    public get $ticketTypeId(): number {
        return this.ticketTypeId;
    }

    /**
     * Getter $ticketValue
     * @return {number}
     */
    public get $ticketValue(): number {
        return this.ticketValue;
    }

    /**
     * Getter $slotNumber
     * @return {number}
     */
    public get $slotNumber(): number {
        return this.slotNumber;
    }

    /**
     * Getter $expirationDate
     * @return {number}
     */
    public get $expirationDate(): number {
        return this.expirationDate;
    }

    /**
     * Getter $balance
     * @return {number}
     */
    public get $balance(): number {
        return this.balance;
    }

    /**
     * Getter $IsMerchandise
     * @return {boolean}
     */
    public get $IsMerchandise(): boolean {
        return this.IsMerchandise;
    }

    /**
     * Getter $IsBackendMerchandise
     * @return {boolean}
     */
    public get $IsBackendMerchandise(): boolean {
        return this.IsBackendMerchandise;
    }

    /**
     * Getter $IsFareCard
     * @return {boolean}
     */
    public get $IsFareCard(): boolean {
        return this.IsFareCard;
    }

    /**
     * Getter $unitPrice
     * @return {number}
     */
    public get $unitPrice(): number {
        return this.unitPrice;
    }

    /**
     * Getter $totalCost
     * @return {number}
     */
    public get $totalCost(): number {
        return this.totalCost;
    }

    /**
     * Getter $userID
     * @return {string}
     */
    public get $userID(): string {
        return this.userID;
    }

    /**
     * Getter $shiftID
     * @return {number}
     */
    public get $shiftID(): number {
        return this.shiftID;
    }

    /**
     * Getter $fareCode
     * @return {string}
     */
    public get $fareCode(): string {
        return this.fareCode;
    }

    /**
     * Getter $walletContentItems
     * @return {WalletContentItems}
     */
    public get $walletContentItems(): WalletContentItems[] {
        return this.walletContentItems;
    }

    /**
     * Getter $walletTypeId
     * @return {number}
     */
    public get $walletTypeId(): number {
        return this.walletTypeId;
    }

    /**
     * Getter $shiftType
     * @return {number}
     */
    public get $shiftType(): number {
        return this.shiftType;
    }

    /**
     * Getter $timestamp
     * @return {number}
     */
    public get $timestamp(): number {
        return this.timestamp;
    }

    /**
     * Setter $transactionID
     * @param {number} value
     */
    public set $transactionID(value: number) {
        this.transactionID = value;
    }

    /**
     * Setter $cardPID
     * @param {string} value
     */
    public set $cardPID(value: string) {
        this.cardPID = value;
    }

    /**
     * Setter $cardUID
     * @param {number} value
     */
    public set $cardUID(value: number) {
        this.cardUID = value;
    }

    /**
     * Setter $quantity
     * @param {number} value
     */
    public set $quantity(value: number) {
        this.quantity = value;
    }

    /**
     * Setter $productIdentifier
     * @param {number} value
     */
    public set $productIdentifier(value: number) {
        this.productIdentifier = value;
    }

    /**
     * Setter $ticketTypeId
     * @param {number} value
     */
    public set $ticketTypeId(value: number) {
        this.ticketTypeId = value;
    }

    /**
     * Setter $ticketValue
     * @param {number} value
     */
    public set $ticketValue(value: number) {
        this.ticketValue = value;
    }

    /**
     * Setter $slotNumber
     * @param {number} value
     */
    public set $slotNumber(value: number) {
        this.slotNumber = value;
    }

    /**
     * Setter $expirationDate
     * @param {number} value
     */
    public set $expirationDate(value: number) {
        this.expirationDate = value;
    }

    /**
     * Setter $balance
     * @param {number} value
     */
    public set $balance(value: number) {
        this.balance = value;
    }

    /**
     * Setter $IsMerchandise
     * @param {boolean} value
     */
    public set $IsMerchandise(value: boolean) {
        this.IsMerchandise = value;
    }

    /**
     * Setter $IsBackendMerchandise
     * @param {boolean} value
     */
    public set $IsBackendMerchandise(value: boolean) {
        this.IsBackendMerchandise = value;
    }

    /**
     * Setter $IsFareCard
     * @param {boolean} value
     */
    public set $IsFareCard(value: boolean) {
        this.IsFareCard = value;
    }

    /**
     * Setter $unitPrice
     * @param {number} value
     */
    public set $unitPrice(value: number) {
        this.unitPrice = value;
    }

    /**
     * Setter $totalCost
     * @param {number} value
     */
    public set $totalCost(value: number) {
        this.totalCost = value;
    }

    /**
     * Setter $userID
     * @param {string} value
     */
    public set $userID(value: string) {
        this.userID = value;
    }

    /**
     * Setter $shiftID
     * @param {number} value
     */
    public set $shiftID(value: number) {
        this.shiftID = value;
    }

    /**
     * Setter $fareCode
     * @param {string} value
     */
    public set $fareCode(value: string) {
        this.fareCode = value;
    }

    /**
     * Setter $walletContentItems
     * @param {WalletContentItems} value
     */
    public set $walletContentItems(value: WalletContentItems[]) {
        this.walletContentItems = value;
    }

    /**
     * Setter $walletTypeId
     * @param {number} value
     */
    public set $walletTypeId(value: number) {
        this.walletTypeId = value;
    }

    /**
     * Setter $shiftType
     * @param {number} value
     */
    public set $shiftType(value: number) {
        this.shiftType = value;
    }

    /**
     * Setter $timestamp
     * @param {number} value
     */
    public set $timestamp(value: number) {
        this.timestamp = value;
    }

    /**
     * Getter $tax
     * @return {number}
     */
	public get $tax(): number {
		return this.tax;
	}

    /**
     * Setter $tax
     * @param {number} value
     */
	public set $tax(value: number) {
		this.tax = value;
	}

}