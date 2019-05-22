export enum MediaType {
    SMART_CARD_ID = 3,
    MAGNETIC_ID = 10,
    MERCHANDISE_ID = 99
}

export enum Constants {
    MERCHANDISE_TEXT = 'Merch*',
    MAGNETICS_TEXT = 'Magnetic ',
    CHARGE = 'Charge',
    INACTIVE = 'INACTIVE',
    FREQUENT_RIDE = 'Frequent Ride',
    STORED_RIDE = 'Stored Ride',
    STORED_VALUE = 'Pay As You Go'
}

export enum PRODUCT_NAME {
    STORED_RIDE = 'Stored Ride Pass',
    STORED_VALUE = 'Pay As You Go',
    PERIOD_PASS = 'Frequent Rider'
}

export enum TICKET_GROUP {
    PERIOD_PASS = 1,
    RIDE = 2,
    VALUE = 3
}

export enum TICKET_TYPE {
    STORED_FIXED_VALUE= 1,
    RIDE= 2,
    PERIOD= 3,
    STORED_VARIABLE_VALUE= 4
}
