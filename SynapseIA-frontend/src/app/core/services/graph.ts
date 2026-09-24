import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(
    private http: HttpClient
  ) {}

  getSourceGraph(
    sourceId: number,
    token: string
  ): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(
      `${this.apiUrl}/graph/source/${sourceId}`,
      { headers }
    );
  }
}