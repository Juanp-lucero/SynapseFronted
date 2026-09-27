import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface Project {

  id: number;

  name: string;

  description: string | null;

  user_id: number;

}


export interface ProjectCreate {

  name: string;

  description?: string;

}


@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl =
    'http://127.0.0.1:8000';


  constructor(
    private http: HttpClient
  ) {}


  getProjects(
    token: string
  ): Observable<Project[]> {

    const headers =
      this.createHeaders(token);

    return this.http.get<Project[]>(
      `${this.apiUrl}/projects/`,
      {
        headers
      }
    );

  }


  getProject(
    projectId: number,
    token: string
  ): Observable<Project> {

    const headers =
      this.createHeaders(token);

    return this.http.get<Project>(
      `${this.apiUrl}/projects/${projectId}`,
      {
        headers
      }
    );

  }


  createProject(
    project: ProjectCreate,
    token: string
  ): Observable<Project> {

    const headers =
      this.createHeaders(token);

    return this.http.post<Project>(
      `${this.apiUrl}/projects/`,
      project,
      {
        headers
      }
    );

  }


  updateProject(
    projectId: number,
    project: ProjectCreate,
    token: string
  ): Observable<Project> {

    const headers =
      this.createHeaders(token);

    return this.http.put<Project>(
      `${this.apiUrl}/projects/${projectId}`,
      project,
      {
        headers
      }
    );

  }


  deleteProject(
    projectId: number,
    token: string
  ): Observable<void> {

    const headers =
      this.createHeaders(token);

    return this.http.delete<void>(
      `${this.apiUrl}/projects/${projectId}`,
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