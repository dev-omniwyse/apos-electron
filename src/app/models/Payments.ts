
export class PaymentType {


    private comment:string;
    constructor(private paymentMethodId?: number, private amount?: number) {
        
    }

/**
     * Getter $paymentMethodId
     * @return {string}
     */
    public get $comment(): string {
        return this.comment;
    }


    /**
     * Getter $paymentMethodId
     * @return {number}
     */
    public get $paymentMethodId(): number {
        return this.paymentMethodId;
    }


    /**
     * Setter $paymentMethodId
     * @param {string} comment
     */
    public set $comment(comment: string) {
        this.comment = comment;
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