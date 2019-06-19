import { Injectable } from '@angular/core';

declare var pcsc: any;
declare var pcsc: any;
let pcs = pcsc();
let cardName: any = '';
pcs.on('reader', function (reader) {

    console.log('reader', reader);
    console.log('New reader detected', reader.name);

    reader.on('error', function (err) {
        console.log('Error(', this.name, '):', err.message);
    });

    reader.on('status', function (status) {
        console.log('Status(', this.name, '):', status);
        /* check what has changed */
        // tslint:disable-next-line:no-bitwise
        const changes = this.state ^ status.state;
        if (changes) {
            // tslint:disable-next-line:no-bitwise
            if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                console.log('card removed'); /* card removed */
                reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Disconnected');
                    }
                });
                // tslint:disable-next-line:no-bitwise
            } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                cardName = reader.name;
                console.log('sample', cardName);
                console.log('card inserted'); /* card inserted */
                reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, function (err, protocol) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Protocol(', reader.name, '):', protocol);
                        reader.transmit(new Buffer([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol,
                            // tslint:disable-next-line:no-shadowed-variable
                            function (err: any, data: { toString: (arg0: string) => void; }) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Data received', data);
                                    console.log('Data base64', data.toString('base64'));
                                    // reader.close();
                                    // pcs.close();
                                }
                            });
                    }
                });
            }
        }
    });


    reader.on('end', function () {
        console.log('Reader', this.name, 'removed');
    });
});

pcs.on('error', function (err) {
    console.log('PCSC error', err.message);
});


@Injectable()
export class CardService  {
    private static _cardService = new CardService();
    public static get getInstance() {
        return CardService._cardService;
    }
    getCardName(){
        return cardName;
    }
}



