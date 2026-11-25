import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AiAnswerResponse,
  AiStatus,
  AiSummaryResponse
} from '../models/analysis.models';

/**
 * Talks to the Synapse AI endpoints. Every answer is grounded on the
 * evidence extracted from the source, so the AI never sees other users'
 * documents.
 */
@Injectable({
  providedIn: 'root'
})
export class AiService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  /** Whether the backend has an AI provider configured. */
  getStatus(): Observable<AiStatus> {
    return this.http.get<AiStatus>(
      `${this.apiUrl}/ai/status`
    );
  }

  /** Executive summary of the latest analysis of a source. */
  summarizeSource(
    sourceId: number
  ): Observable<AiSummaryResponse> {
    return this.http.post<AiSummaryResponse>(
      `${this.apiUrl}/ai/source/${sourceId}/summary`,
      {}
    );
  }

  /** Answer a question using only the evidence of a source. */
  askSource(
    sourceId: number,
    question: string
  ): Observable<AiAnswerResponse> {
    return this.http.post<AiAnswerResponse>(
      `${this.apiUrl}/ai/source/${sourceId}/ask`,
      { question }
    );
  }
}
