import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { GraphResponse } from '../models/graph.models';
import { GraphService } from './graph';

describe('GraphService', () => {
  let service: GraphService;
  let http: HttpTestingController;

  const emptyGraph: GraphResponse = {
    source_ids: [],
    nodes: [],
    relationships: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GraphService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the general graph with a trailing slash', () => {
    let response: GraphResponse | undefined;
    service.getGraph().subscribe(data => (response = data));

    const request = http.expectOne(`${environment.apiUrl}/graph/`);
    expect(request.request.method).toBe('GET');
    request.flush(emptyGraph);

    expect(response).toEqual(emptyGraph);
  });

  it('requests the graph of a project', () => {
    service.getProjectGraph(7).subscribe();
    http.expectOne(`${environment.apiUrl}/graph/project/7`).flush(emptyGraph);
  });

  it('requests the graph of a source', () => {
    service.getSourceGraph(3).subscribe();
    http.expectOne(`${environment.apiUrl}/graph/source/3`).flush(emptyGraph);
  });

  it('does not add authorization headers itself', () => {
    service.getGraph().subscribe();
    const request = http.expectOne(`${environment.apiUrl}/graph/`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(emptyGraph);
  });
});
