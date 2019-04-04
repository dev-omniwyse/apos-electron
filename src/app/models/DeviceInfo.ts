export class DeviceInfo {

    private terminalID: string;
    private operatingMode: string;

    //Fields for Max Unsynced Transaction Values
    private CURRENT_UNSYNCED_TRANSACTION_NUMBER: number;
    private CURRENT_UNSYNCED_TRANSACTION_VALUE: number;
    private LIFETIME_TRANSACTION_COUNT: number;
    private LIFETIME_TRANSACTION_VALUE: number;

    // TODO: Put these in sqlite
    // you get 5 tries, then you get locked out
    private PRESHARE: string;
    private failedLoginCount: number;

    constructor(){
        
    }


    /**
     * Getter $terminalID
     * @return {string}
     */
	public get $terminalID(): string {
		return this.terminalID;
	}

    /**
     * Getter $operatingMode
     * @return {string}
     */
	public get $operatingMode(): string {
		return this.operatingMode;
	}

    /**
     * Getter $CURRENT_UNSYNCED_TRANSACTION_NUMBER
     * @return {number}
     */
	public get $CURRENT_UNSYNCED_TRANSACTION_NUMBER(): number {
		return this.CURRENT_UNSYNCED_TRANSACTION_NUMBER;
	}

    /**
     * Getter $CURRENT_UNSYNCED_TRANSACTION_VALUE
     * @return {number}
     */
	public get $CURRENT_UNSYNCED_TRANSACTION_VALUE(): number {
		return this.CURRENT_UNSYNCED_TRANSACTION_VALUE;
	}

    /**
     * Getter $LIFETIME_TRANSACTION_COUNT
     * @return {number}
     */
	public get $LIFETIME_TRANSACTION_COUNT(): number {
		return this.LIFETIME_TRANSACTION_COUNT;
	}

    /**
     * Getter $LIFETIME_TRANSACTION_VALUE
     * @return {number}
     */
	public get $LIFETIME_TRANSACTION_VALUE(): number {
		return this.LIFETIME_TRANSACTION_VALUE;
	}

    /**
     * Getter $PRESHARE
     * @return {string}
     */
	public get $PRESHARE(): string {
		return this.PRESHARE;
	}

    /**
     * Getter $failedLoginCount
     * @return {number}
     */
	public get $failedLoginCount(): number {
		return this.failedLoginCount;
	}

    /**
     * Setter $terminalID
     * @param {string} value
     */
	public set $terminalID(value: string) {
		this.terminalID = value;
	}

    /**
     * Setter $operatingMode
     * @param {string} value
     */
	public set $operatingMode(value: string) {
		this.operatingMode = value;
	}

    /**
     * Setter $CURRENT_UNSYNCED_TRANSACTION_NUMBER
     * @param {number} value
     */
	public set $CURRENT_UNSYNCED_TRANSACTION_NUMBER(value: number) {
		this.CURRENT_UNSYNCED_TRANSACTION_NUMBER = value;
	}

    /**
     * Setter $CURRENT_UNSYNCED_TRANSACTION_VALUE
     * @param {number} value
     */
	public set $CURRENT_UNSYNCED_TRANSACTION_VALUE(value: number) {
		this.CURRENT_UNSYNCED_TRANSACTION_VALUE = value;
	}

    /**
     * Setter $LIFETIME_TRANSACTION_COUNT
     * @param {number} value
     */
	public set $LIFETIME_TRANSACTION_COUNT(value: number) {
		this.LIFETIME_TRANSACTION_COUNT = value;
	}

    /**
     * Setter $LIFETIME_TRANSACTION_VALUE
     * @param {number} value
     */
	public set $LIFETIME_TRANSACTION_VALUE(value: number) {
		this.LIFETIME_TRANSACTION_VALUE = value;
	}

    /**
     * Setter $PRESHARE
     * @param {string} value
     */
	public set $PRESHARE(value: string) {
		this.PRESHARE = value;
	}

    /**
     * Setter $failedLoginCount
     * @param {number} value
     */
	public set $failedLoginCount(value: number) {
		this.failedLoginCount = value;
	}

}