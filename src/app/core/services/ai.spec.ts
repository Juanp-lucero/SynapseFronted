import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { AiService } from './ai';

describe('AiService', () => {
  let service: AiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads whether the AI is configured', () => {
    let configured: boolean | undefined;
    service.getStatus().subscribe(status => (configured = status.configured));

    http
      .expectOne(`${environment.apiUrl}/ai/status`)
      .flush({ provider: 'groq', configured: true, model: 'llama' });

    expect(configured).toBe(true);
  });

  it('requests a summary of a source', () => {
    let summary = '';
    service.summarizeSource(3).subscribe(response => (summary = response.summary));

    const request = http.expectOne(`${environment.apiUrl}/ai/source/3/summary`);
    expect(request.request.method).toBe('POST');
    request.flush({ source_id: 3, provider: 'groq', model: 'llama', summary: 'Resumen' });

    expect(summary).toBe('Resumen');
  });

  it('sends the question in the request body', () => {
    service.askSource(3, '¿Quién dirige la empresa?').subscribe();

    const request = http.expectOne(`${environment.apiUrl}/ai/source/3/ask`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ question: '¿Quién dirige la empresa?' });
    request.flush({ source_id: 3, provider: 'groq', model: 'llama', answer: 'x' });
  });
});
