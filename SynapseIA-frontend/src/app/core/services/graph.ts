import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GraphResponse } from '../models/graph.models';

/**
 * Reads the Knowledge Graph. The auth interceptor adds the access token
 * and renews it when it expires.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  getGraph(): Observable<GraphResponse> {
    return this.http.get<GraphResponse>(
      `${this.apiUrl}/graph/`
    );
  }

  getProjectGraph(
    projectId: number
  ): Observable<GraphResponse> {
    return this.http.get<GraphResponse>(
      `${this.apiUrl}/graph/project/${projectId}`
    );
  }

  getSourceGraph(
    sourceId: number
  ): Observable<GraphResponse> {
    return this.http.get<GraphResponse>(
      `${this.apiUrl}/graph/source/${sourceId}`
    );
  }
}
