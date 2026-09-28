import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface AnalysisResult {

  id: number;

  source_id: number;

  status: string;

  entities: any[];

  relations: any[];

  patterns: any[];

  hypotheses: any[];

  created_at: string;

}


@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  private apiUrl =
    'http://127.0.0.1:8000';


  constructor(
    private http: HttpClient
  ) {}


  analyzeSource(
    sourceId: number,
    token: string
  ): Observable<AnalysisResult> {

    const headers =
      this.createHeaders(token);

    return this.http.post<AnalysisResult>(
      `${this.apiUrl}/analysis/source/${sourceId}`,
      {},
      {
        headers
      }
    );

  }


  getSourceAnalysis(
    sourceId: number,
    token: string
  ): Observable<AnalysisResult[]> {

    const headers =
      this.createHeaders(token);

    return this.http.get<AnalysisResult[]>(
      `${this.apiUrl}/analysis/source/${sourceId}`,
      {
        headers
      }
    );

  }


  private createHeaders(
    token: string
  ): HttpHeaders {

    return new HttpHeaders({
      Authorization:
        `Bearer ${token}`
    });

  }

}