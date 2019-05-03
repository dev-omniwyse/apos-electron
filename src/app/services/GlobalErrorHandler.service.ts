import { ErrorHandler, Injectable, Injector } from '@angular/core';
import * as fs from 'fs';
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private injector: Injector) {
    }
    handleError(error) {
        // let fs = require('fs-extra')
        const fs = require('fs');
        let filepath = 'clientLog.properties';
        let message = error.message ? error.message : error.toString() + '*$$$$$$*';
        // fs.writeFile(filepath, message, err => {
        //     console.log(err) // => null

        //     if (err) {
        //         alert('An error ocurred updating the file' + err.message);
        //         console.log(err);
        //         return;
        //     }
        //     alert('The file has been succesfully saved');
        // });
    }
}
