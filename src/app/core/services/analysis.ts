import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AnalysisResult } from '../models/analysis.models';

export type { AnalysisResult } from '../models/analysis.models';

/**
 * Runs and reads source analyses. The auth interceptor adds the
 * access token and renews it when it expires.
 */
@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  analyzeSource(
    sourceId: number
  ): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>(
      `${this.apiUrl}/analysis/source/${sourceId}`,
      {}
    );
  }

  /** Analyses of a source, newest first. */
  getSourceAnalysis(
    sourceId: number
  ): Observable<AnalysisResult[]> {
    return this.http.get<AnalysisResult[]>(
      `${this.apiUrl}/analysis/source/${sourceId}`
    );
  }
}
