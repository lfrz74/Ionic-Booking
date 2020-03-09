import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpXsrfTokenExtractor } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap, map } from 'rxjs/operators';
import { BehaviorSubject, from } from 'rxjs';
import { Plugins } from '@capacitor/core';

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
export class AuthService  implements OnDestroy {
  // tslint:disable-next-line: variable-name
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

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

  get token() {
    return this._user.asObservable().pipe(
      map(us => {
        if (us) {
          return us.token;
        } else {
          return null;
        }
      }));
  }

  constructor(private http: HttpClient) {
  }

  autoLogin() {
    return from(Plugins.Storage.get({key: 'authData'})).pipe(
      map(storeData => {
        if (!storeData || !storeData.value) {
          return null;
        }
        const parsedData = JSON.parse(storeData.value) as {
          user: string;
          tok: string;
          tokenExp: string;
          email: string
        };
        const expirationTime = new Date(parsedData.tokenExp);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.user,
          parsedData.email,
          parsedData.tok,
          expirationTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
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
     password: pwd,
     returnSecureToken: true
    }).pipe(tap( this.setUserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({key: 'authData' });
  }

  ngOnDestroy(): void {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer =  setTimeout(() => {
      this.logout();
    }, duration);
  }
  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    const us = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this._user.next(us);
    this.autoLogout(us.tokenDuration);
    this.storeAuthData(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email);
  }

  private storeAuthData(userId: string, token: string, tokenExpirationDate: string, mail: string) {
    const data = JSON.stringify({
      user: userId,
      tok: token,
      tokenExp: tokenExpirationDate,
      email: mail
    });
    Plugins.Storage.set({key: 'authData', value: data});
  }
}
