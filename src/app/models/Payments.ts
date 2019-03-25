
export class PaymentType {


    constructor(private paymentMethodId?: number, private amount?: number) {
        
    }

    /**
     * Getter $paymentMethodId
     * @return {number}
     */
    public get $paymentMethodId(): number {
        return this.paymentMethodId;
    }

    /**
     * Getter $amount
     * @return {number}
     */
    public get $amount(): number {
        return this.amount;
    }

    /**
     * Setter $paymentMethodId
     * @param {number} value
     */
    public set $paymentMethodId(value: number) {
        this.paymentMethodId = value;
    }

    /**
     * Setter $amount
     * @param {number} value
     */
    public set $amount(value: number) {
        this.amount = value;
    }

}