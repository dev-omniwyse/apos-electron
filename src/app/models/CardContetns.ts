
export class CardSummary {

    private product : string;
    private description : string;
    private status : string;
    private balance : string;

    /**
     * Getter $product
     * @return {string}
     */
	public get $product(): string {
		return this.product;
	}

    /**
     * ;Getter $description
     * @return {string}
     */
	public get $description(): string {
		return this.description;
	}

    /**
     * Getter $status
     * @return {string}
     */
	public get $status(): string {
		return this.status;
	}

    /**
     * Getter $balance
     * @return {string}
     */
	public get $balance(): string {
		return this.balance;
	}

    /**
     * Setter $product
     * @param {string} value
     */
	public set $product(value: string) {
		this.product = value;
	}

    /**
     * Setter $description
     * @param {string} value
     */
	public set $description(value: string) {
		this.description = value;
	}

    /**
     * Setter $status
     * @param {string} value
     */
	public set $status(value: string) {
		this.status = value;
	}

    /**
     * Setter $balance
     * @param {string} value
     */
	public set $balance(value: string) {
		this.balance = value;
	}

}