import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { SourceService } from './source';

describe('SourceService', () => {
  let service: SourceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SourceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the sources of a project', () => {
    service.getSources(9, 'token-123').subscribe();
    const request = http.expectOne(
      `${environment.apiUrl}/sources/?project_id=9`
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('uploads a file as multipart form data', () => {
    const file = new File(['hola'], 'nota.txt', { type: 'text/plain' });
    service.uploadSource(file, 9, 'token-123').subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/sources/upload?project_id=9`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body instanceof FormData).toBe(true);
    expect((request.request.body as FormData).get('file')).toBe(file);
    request.flush({ id: 1 });
  });
});
