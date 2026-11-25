import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { GraphResponse } from '../../core/models/graph.models';
import { GraphService } from '../../core/services/graph';
import { Graph } from './graph';

describe('Graph', () => {
  let fixture: ComponentFixture<Graph>;
  let component: Graph;
  let graphService: {
    getGraph: ReturnType<typeof vi.fn>;
    getProjectGraph: ReturnType<typeof vi.fn>;
    getSourceGraph: ReturnType<typeof vi.fn>;
  };

  const emptyGraph: GraphResponse = { source_ids: [], nodes: [], relationships: [] };

  async function setup(params: Record<string, string> = {}) {
    graphService = {
      getGraph: vi.fn(() => of(emptyGraph)),
      getProjectGraph: vi.fn(() => of(emptyGraph)),
      getSourceGraph: vi.fn(() => of(emptyGraph))
    };

    await TestBed.configureTestingModule({
      imports: [Graph],
      providers: [
        provideRouter([]),
        { provide: GraphService, useValue: graphService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(params) } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Graph);
    component = fixture.componentInstance;
    // Rendering is not needed to check which endpoint is used.
    (component as unknown as { renderGraph: () => void }).renderGraph = () => undefined;
    fixture.detectChanges();
  }

  it('loads the general graph without route params', async () => {
    await setup();
    expect(graphService.getGraph).toHaveBeenCalled();
    expect(component.graphContext).toBe('Todos tus proyectos');
  });

  it('loads the graph of a project', async () => {
    await setup({ projectId: '4' });
    expect(graphService.getProjectGraph).toHaveBeenCalledWith(4);
    expect(component.graphContext).toBe('Proyecto #4');
  });

  it('loads the graph of a source', async () => {
    await setup({ sourceId: '9' });
    expect(graphService.getSourceGraph).toHaveBeenCalledWith(9);
  });

  it('rejects an invalid project id without calling the API', async () => {
    await setup({ projectId: 'abc' });
    expect(graphService.getProjectGraph).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('no es válido');
  });

  it('shows a friendly error when the API fails', async () => {
    await setup();
    graphService.getGraph.mockReturnValueOnce(throwError(() => ({ status: 503 })));
    component.loadGraph();
    expect(component.errorMessage).toBe('No fue posible cargar el Knowledge Graph.');
  });

  it('toggles node categories from the legend', async () => {
    await setup();
    expect(component.isTypeVisible('NUMBER')).toBe(true);
    component.toggleType('NUMBER');
    expect(component.isTypeVisible('NUMBER')).toBe(false);
    component.toggleType('NUMBER');
    expect(component.isTypeVisible('NUMBER')).toBe(true);
  });
});
