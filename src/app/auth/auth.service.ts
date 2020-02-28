import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import { User } from './user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // tslint:disable-next-line: variable-name
  private _user = new BehaviorSubject<User>(null);

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map(us => {
        if (us) {
          return !!us.token;
        } else {
          return false;
        }
      }));
  }

  get userId() {
    return this._user.asObservable().pipe(
      map(us => {
        if (us) {
          return us.id;
        } else {
          return null;
        }
      }));
  }

  constructor(private http: HttpClient) {
  }

  signup(mail: string, pwd: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
    {email: mail,
     password: pwd,
     returnSecureToken: true
    }).pipe(tap( this.setUserData.bind(this))); // refers to our auth service class and not to the tap function
  }

  login(mail: string, pwd: string) {
    // tslint:disable-next-line: max-line-length
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
    {email: mail,
     password: pwd
    }).pipe(tap( this.setUserData.bind(this)));
  }

  logout() {
    this._user.next(null);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    this._user.next(
      new User(
        userData.localId,
        userData.email,
        userData.idToken,
        expirationTime
      )
    );
  }
}
