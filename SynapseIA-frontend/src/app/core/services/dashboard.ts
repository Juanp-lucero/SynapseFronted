import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface DashboardStats {

  projects: number;

  sources: number;

  analyses: number;

  hypotheses: number;

}


export interface CurrentUser {

  id: number;

  name: string;

  email: string;

}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl =
    'http://127.0.0.1:8000';


  constructor(
    private http: HttpClient
  ) {}


  getStats(
    token: string
  ): Observable<DashboardStats> {

    const headers =
      new HttpHeaders({
        Authorization:
          `Bearer ${token}`
      });


    return this.http.get<DashboardStats>(
      `${this.apiUrl}/dashboard/stats`,
      {
        headers
      }
    );

  }


  getCurrentUser(
    token: string
  ): Observable<CurrentUser> {

    const headers =
      new HttpHeaders({
        Authorization:
          `Bearer ${token}`
      });


    return this.http.get<CurrentUser>(
      `${this.apiUrl}/users/me`,
      {
        headers
      }
    );

  }

}