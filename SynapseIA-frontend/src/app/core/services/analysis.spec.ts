import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { AnalysisService } from './analysis';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AnalysisService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts the analysis of a source with a POST', () => {
    service.analyzeSource(5).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/analysis/source/5`);
    expect(request.request.method).toBe('POST');
    request.flush({});
  });

  it('reads the analyses of a source', () => {
    let count = 0;
    service.getSourceAnalysis(5).subscribe(data => (count = data.length));

    const request = http.expectOne(`${environment.apiUrl}/analysis/source/5`);
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 2 }, { id: 1 }]);

    expect(count).toBe(2);
  });
});
