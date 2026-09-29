import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';


export interface LoginRequest {

  email: string;

  password: string;

}


export interface RegisterRequest {

  name: string;

  email: string;

  password: string;

}


export interface AuthResponse {

  access_token: string;

  refresh_token: string;

  token_type: string;

}


@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl =
    'http://127.0.0.1:8000';


  constructor(
    private http: HttpClient
  ) {}


  login(
    credentials: LoginRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/auth/login`,
        credentials
      )
      .pipe(

        tap(
          response => {

            this.saveSession(
              response
            );

          }
        )

      );

  }


  register(
    user: RegisterRequest
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/users/`,
      user
    );

  }


  refreshToken(): Observable<AuthResponse> {

    const refreshToken =
      localStorage.getItem(
        'refresh_token'
      );


    if (!refreshToken) {

      throw new Error(
        'No existe un refresh token'
      );

    }


    const params =
      new HttpParams()
        .set(
          'refresh_token',
          refreshToken
        );


    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/auth/refresh`,
        {},
        {
          params
        }
      )
      .pipe(

        tap(
          response => {

            localStorage.setItem(
              'access_token',
              response.access_token
            );

            localStorage.setItem(
              'refresh_token',
              response.refresh_token
            );

          }
        )

      );

  }


  logout(): Observable<any> {

    const refreshToken =
      localStorage.getItem(
        'refresh_token'
      );


    if (!refreshToken) {

      this.clearSession();

      return new Observable(
        subscriber => {

          subscriber.next({
            message:
              'Sesión cerrada localmente'
          });

          subscriber.complete();

        }
      );

    }


    const params =
      new HttpParams()
        .set(
          'refresh_token',
          refreshToken
        );


    const headers =
      new HttpHeaders({
        Authorization:
          `Bearer ${this.getAccessToken()}`
      });


    return this.http
      .post(
        `${this.apiUrl}/auth/logout`,
        {},
        {
          params,
          headers
        }
      )
      .pipe(

        tap(
          () => {

            this.clearSession();

          }
        )

      );

  }


  getAccessToken(): string | null {

    return localStorage.getItem(
      'access_token'
    );

  }


  getRefreshToken(): string | null {

    return localStorage.getItem(
      'refresh_token'
    );

  }


  isAuthenticated(): boolean {

    return !!this.getAccessToken();

  }


  clearSession(): void {

    localStorage.removeItem(
      'access_token'
    );

    localStorage.removeItem(
      'refresh_token'
    );

  }


  private saveSession(
    response: AuthResponse
  ): void {

    localStorage.setItem(
      'access_token',
      response.access_token
    );

    localStorage.setItem(
      'refresh_token',
      response.refresh_token
    );

  }

}