import { Injectable } from '@angular/core';
import { Observable, of, throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
// import { product_log } from '../assets/data/'
const httpOptions = {
  headers: new HttpHeaders(
    {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json'

    }

  )
};

const apiUrl = "https://api.qe.gfcp.io/services/data-api/v1/wpf/id_card/updateExisting?tenant=CDTA&access_token=6294ffc6-1189-4803-8ddf-6a99f039f37a"

@Injectable({
  providedIn: 'root'
})


export class CdtaService {

  constructor(private http: HttpClient) { }

  public getJSON(): Observable<any> {
    return this.http.get("assets/data/product_catalog.json")
}
public getsalesJson(): Observable<any> {
  return this.http.get("assets/data/sales_summary.json")
}
public getsalesPaymentJson(): Observable<any> {
  return this.http.get("assets/data/sales_payment.json")
}
// Observable string sources
private headerShowHideSource = new Subject<string>();
 
// Observable string streams
headerShowHide$ = this.headerShowHideSource.asObservable();

// Service message commands
announceHeaderShowHide(mission: string) {
  this.headerShowHideSource.next(mission);
}

private terminalNumberSrc = new Subject<string>();
 
// Observable string streams
terminalNumber$ = this.terminalNumberSrc.asObservable();

// Service message commands
setterminalNumber(mission: string) {
  this.terminalNumberSrc.next(mission);
}


  login(username: string, password: string): Observable<any> {
    let userInfo = { username: username, password: password }
    return this.http.post('https://cdta-qe.gfcp.io/login', JSON.stringify(userInfo), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "accept": "application/json"
      },
      responseType: 'json'

    })
      .pipe(
        map((result: any) => {
          console.log('user data', result)
          return result
        }
        ),
        catchError(this.handleError)
      );
  }

  jsonData(): Observable<any> {

    return this.http.post('https://api.staging.gfcp.io/services/device/v5/auth?tenant=CDTA&type=apos&serialNumber=APOS289&password=08e0668a-4226-4d0f-9f9e-79edb3e4b3b4', '', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "accept": "application/json"
      },
      responseType: 'json'

    })
      .pipe(
        map((result: any) => {
          console.log('user data', result)
          return result
        }
        ),
        catchError(this.handleError)
      );
  }

  uploadImage(data: any): Observable<Object> {

    return this.http.post(apiUrl, data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "accept": "application/json"
        },
        responseType: 'text'
      })
      .pipe(
        map((result: any) => {
          return result
        }
        ),
        catchError(this.handleError)
      );
  }



  cardData() {
    return this
      .http
      .get(`${apiUrl}`);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };

  private extractData(res: Response) {
    let body = res;
    return body || {};
  }
}


