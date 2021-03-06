export class WalletContentItems {


    constructor(private transactionID?: number, private quantity?: number, private productIdentifier?: string,
        private ticketTypeId?: number, private ticketValue?: number, private status?: string,
        private slotNumber?: number, private startDate?: number, private expirationDate?: number,
        private balance?: number, private rechargesPending?: number, private IsMerchandise?: boolean,
        private IsBackendMerchandise?: boolean, private IsFareCard?: boolean, private unitPrice?: number,
        private totalCost?: number, private userID?: string, private shiftID?: number,
        private fareCode?: string, private offeringId?: number, private cardPID?: number,
        private cardUID?: number, private walletTypeId?: number, private shiftType?: number,
        private timestamp?: number
    ) {

    }




    /**
     * Getter $timestamp
     * @return {number}
     */
    public get $timestamp(): number {
        return this.timestamp;
    }

    /**
     * Setter $timestamp
     * @param {number} value
     */
    public set $timestamp(value: number) {
        this.timestamp = value;
    }



    /**
     * Getter $transactionID
     * @return {number}
     */
    public get $transactionID(): number {
        return this.transactionID;
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
     * @return {string}
     */
    public get $productIdentifier(): string {
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
     * Getter $status
     * @return {string}
     */
    public get $status(): string {
        return this.status;
    }

    /**
     * Getter $slotNumber
     * @return {number}
     */
    public get $slotNumber(): number {
        return this.slotNumber;
    }

    /**
     * Getter $startDate
     * @return {number}
     */
    public get $startDate(): number {
        return this.startDate;
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
     * Getter $rechargesPending
     * @return {number}
     */
    public get $rechargesPending(): number {
        return this.rechargesPending;
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
     * Getter $offeringId
     * @return {number}
     */
    public get $offeringId(): number {
        return this.offeringId;
    }

    /**
     * Getter $cardPID
     * @return {number}
     */
    public get $cardPID(): number {
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
     * Setter $transactionID
     * @param {number} value
     */
    public set $transactionID(value: number) {
        this.transactionID = value;
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
     * @param {string} value
     */
    public set $productIdentifier(value: string) {
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
     * Setter $status
     * @param {string} value
     */
    public set $status(value: string) {
        this.status = value;
    }

    /**
     * Setter $slotNumber
     * @param {number} value
     */
    public set $slotNumber(value: number) {
        this.slotNumber = value;
    }

    /**
     * Setter $startDate
     * @param {number} value
     */
    public set $startDate(value: number) {
        this.startDate = value;
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
     * Setter $rechargesPending
     * @param {number} value
     */
    public set $rechargesPending(value: number) {
        this.rechargesPending = value;
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
     * Setter $offeringId
     * @param {number} value
     */
    public set $offeringId(value: number) {
        this.offeringId = value;
    }

    /**
     * Setter $cardPID
     * @param {number} value
     */
    public set $cardPID(value: number) {
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

}