export class FareCode {

    constructor(private _fareCodeId ? : number,
        private _description ? : string) {

    }

    /**
     * Getter fareCodeId
     * @return {number}
     */
    public get fareCodeId(): number {
        return this._fareCodeId;
    }

    /**
     * Getter description
     * @return {string}
     */
    public get description(): string {
        return this._description;
    }

    /**
     * Setter fareCodeId
     * @param {number} value
     */
    public set fareCodeId(value: number) {
        this._fareCodeId = value;
    }

    /**
     * Setter description
     * @param {string} value
     */
    public set description(value: string) {
        this._description = value;
    }

}
