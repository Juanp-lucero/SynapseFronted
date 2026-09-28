import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface Source {

  id: number;

  name: string;

  type: string;

  description: string | null;

  file_path: string | null;

  extracted_text: string | null;

  project_id: number;

}


@Injectable({
  providedIn: 'root'
})
export class SourceService {

  private apiUrl =
    'http://127.0.0.1:8000';


  constructor(
    private http: HttpClient
  ) {}


  getSources(
    projectId: number,
    token: string
  ): Observable<Source[]> {

    const headers =
      this.createHeaders(token);

    return this.http.get<Source[]>(
      `${this.apiUrl}/sources/?project_id=${projectId}`,
      {
        headers
      }
    );

  }


  getSource(
    sourceId: number,
    token: string
  ): Observable<Source> {

    const headers =
      this.createHeaders(token);

    return this.http.get<Source>(
      `${this.apiUrl}/sources/${sourceId}`,
      {
        headers
      }
    );

  }


  uploadSource(
    file: File,
    projectId: number,
    token: string
  ): Observable<Source> {

    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    formData.append(
      'project_id',
      projectId.toString()
    );


    const headers =
      new HttpHeaders({
        Authorization:
          `Bearer ${token}`
      });


    return this.http.post<Source>(
      `${this.apiUrl}/sources/upload`,
      formData,
      {
        headers
      }
    );

  }


  deleteSource(
    sourceId: number,
    token: string
  ): Observable<void> {

    const headers =
      this.createHeaders(token);

    return this.http.delete<void>(
      `${this.apiUrl}/sources/${sourceId}`,
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