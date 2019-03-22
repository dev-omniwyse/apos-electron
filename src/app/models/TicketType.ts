export class TicketType {

    constructor(private _ticketTypeId?: number, private _description?: string) {

    }

    /**
     * Getter ticketTypeId
     * @return {number}
     */
    public get ticketTypeId(): number {
        return this._ticketTypeId;
    }

    /**
     * Getter description
     * @return {string}
     */
    public get description(): string {
        return this._description;
    }

    /**
     * Setter ticketTypeId
     * @param {number} value
     */
    public set ticketTypeId(value: number) {
        this._ticketTypeId = value;
    }

    /**
     * Setter description
     * @param {string} value
     */
    public set description(value: string) {
        this._description = value;
    }

}
