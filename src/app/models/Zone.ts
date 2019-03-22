export class Zone {

    constructor(private _zoneId ? : number, private _description ? : string){

    }

    /**
     * Getter zoneId
     * @return {number}
     */
	public get zoneId(): number {
		return this._zoneId;
	}

    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Setter zoneId
     * @param {number} value
     */
	public set zoneId(value: number) {
		this._zoneId = value;
	}

    /**
     * Setter description
     * @param {string} value
     */
	public set description(value: string) {
		this._description = value;
	}

}

