import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { ProjectService } from './project';

describe('ProjectService', () => {
  let service: ProjectService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProjectService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the projects of the user', () => {
    let names: string[] = [];
    service
      .getProjects('token-123')
      .subscribe(projects => (names = projects.map(project => project.name)));

    const request = http.expectOne(`${environment.apiUrl}/projects/`);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');
    request.flush([{ id: 1, name: 'Investigación' }]);

    expect(names).toEqual(['Investigación']);
  });

  it('reads a single project', () => {
    service.getProject(4, 'token-123').subscribe();
    http.expectOne(`${environment.apiUrl}/projects/4`).flush({ id: 4 });
  });
});
