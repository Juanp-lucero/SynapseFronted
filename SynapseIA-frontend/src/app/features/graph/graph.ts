import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  KeyValuePipe
} from '@angular/common';

import cytoscape from 'cytoscape';

import {
  GraphService
} from '../../core/services/graph';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    KeyValuePipe
  ],
  templateUrl: './graph.html',
  styleUrl: './graph.scss'
})
export class Graph implements AfterViewInit {

  @ViewChild('graphContainer')
  graphContainer!: ElementRef;

  graphData: any = null;

  selectedNode: any = null;

  loading = false;

  errorMessage = '';

  graphTitle = 'Knowledge Graph';

  graphDescription =
    'Explora las conexiones descubiertas por Synapse IA.';

  graphContext = 'Explorador general';

  private cy: cytoscape.Core | null = null;

  private viewReady = false;

  constructor(
    private graphService: GraphService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit(): void {

    this.viewReady = true;

    this.loadGraph();

  }

  loadGraph(): void {

    const token =
      localStorage.getItem(
        'access_token'
      );

    if (!token) {

      this.errorMessage =
        'No existe un token de autenticación.';

      this.changeDetectorRef.detectChanges();

      return;

    }

    const sourceIdParam =
      this.route.snapshot.paramMap.get(
        'sourceId'
      );

    const projectIdParam =
      this.route.snapshot.paramMap.get(
        'projectId'
      );

    this.loading = true;

    this.errorMessage = '';

    this.selectedNode = null;

    if (sourceIdParam) {

      const sourceId =
        Number(sourceIdParam);

      if (Number.isNaN(sourceId)) {

        this.loading = false;

        this.errorMessage =
          'El ID de la fuente no es válido.';

        this.changeDetectorRef.detectChanges();

        return;
      }

      this.graphTitle =
        'Knowledge Graph de la fuente';

      this.graphDescription =
        'Conexiones encontradas en esta fuente.';

      this.graphContext =
        `Fuente #${sourceId}`;

      this.graphService
        .getSourceGraph(
          sourceId,
          token
        )
        .subscribe({

          next: (data: any) => {

            this.handleGraphData(data);

          },

          error: (error: any) => {

            this.handleGraphError(
              error
            );

          }

        });

      return;
    }

    if (projectIdParam) {

      const projectId =
        Number(projectIdParam);

      if (Number.isNaN(projectId)) {

        this.loading = false;

        this.errorMessage =
          'El ID del proyecto no es válido.';

        this.changeDetectorRef.detectChanges();

        return;
      }

      this.graphTitle =
        'Knowledge Graph del proyecto';

      this.graphDescription =
        'Conexiones encontradas dentro de este proyecto.';

      this.graphContext =
        `Proyecto #${projectId}`;

      this.graphService
        .getProjectGraph(
          projectId,
          token
        )
        .subscribe({

          next: (data: any) => {

            this.handleGraphData(data);

          },

          error: (error: any) => {

            this.handleGraphError(
              error
            );

          }

        });

      return;
    }

    this.graphTitle =
      'Knowledge Graph';

    this.graphDescription =
      'Explora las conexiones descubiertas por Synapse IA.';

    this.graphContext =
      'Todos tus proyectos';

    this.graphService
      .getGraph(
        token
      )
      .subscribe({

        next: (data: any) => {

          this.handleGraphData(data);

        },

        error: (error: any) => {

          this.handleGraphError(
            error
          );

        }

      });

  }

  private handleGraphData(
    data: any
  ): void {

    console.log(
      'Datos del grafo:',
      data
    );

    this.ngZone.run(() => {

      this.graphData =
        data;

      this.loading = false;

      this.selectedNode =
        null;

      this.errorMessage =
        '';

      this.changeDetectorRef.detectChanges();

      if (this.viewReady) {

        this.renderGraph();

      }

    });

  }

  private handleGraphError(
    error: any
  ): void {

    console.error(
      'Error obteniendo el grafo:',
      error
    );

    this.ngZone.run(() => {

      this.loading = false;

      if (error.status === 404) {

        this.errorMessage =
          'No se encontró información para construir este grafo.';

      } else if (error.status === 403) {

        this.errorMessage =
          'No tienes permiso para consultar este grafo.';

      } else {

        this.errorMessage =
          'No fue posible cargar el Knowledge Graph.';

      }

      this.changeDetectorRef.detectChanges();

    });

  }

  closeNodePanel(): void {

    this.ngZone.run(() => {

      this.selectedNode =
        null;

      this.changeDetectorRef.detectChanges();

    });

  }

  private renderGraph(): void {

    if (!this.graphContainer) {

      return;

    }

    if (!this.graphData) {

      return;

    }

    if (this.cy) {

      this.cy.destroy();

      this.cy = null;

    }

    const nodes =
      this.graphData.nodes || [];

    const relationships =
      this.graphData.relationships || [];

    const elements:
      cytoscape.ElementDefinition[] = [];

    for (const node of nodes) {

      const properties =
        node.properties || {};

      const id =
        this.getNodeId(
          properties
        );

      const label =
        this.getNodeLabel(
          properties,
          node.labels
        );

      const nodeType =
        this.getNodeType(
          properties,
          node.labels
        );

      if (!id) {

        continue;

      }

      elements.push({

        data: {

          id,

          label,

          nodeType,

          properties

        }

      });

    }

    for (
      const relationship
      of relationships
    ) {

      const source =
        this.getNodeId(
          relationship.source
        );

      const target =
        this.getNodeId(
          relationship.target
        );

      if (
        !source ||
        !target
      ) {

        continue;

      }

      elements.push({

        data: {

          id:
            `${source}-${relationship.relation}-${target}`,

          source,

          target,

          label:
            relationship.relation

        }

      });

    }

    this.cy =
      cytoscape({

        container:
          this.graphContainer.nativeElement,

        elements,

        layout: {

          name: 'cose',

          animate: true,

          padding: 60,

          nodeRepulsion: 12000,

          idealEdgeLength: 140,

          gravity: 0.25

        },

        style: [

          {

            selector: 'node',

            style: {

              'background-color':
                '#6366f1',

              'label':
                'data(label)',

              'color':
                '#ffffff',

              'text-valign':
                'center',

              'text-halign':
                'center',

              'font-size':
                10,

              'font-weight':
                'bold',

              'text-wrap':
                'wrap',

              'text-max-width':
                '85px',

              'width':
                42,

              'height':
                42,

              'border-width':
                2,

              'border-color':
                '#ffffff'

            }

          },

          {

            selector:
              'node[nodeType="DOCUMENT"]',

            style: {

              'background-color':
                '#7c3aed',

              'width':
                65,

              'height':
                65,

              'font-size':
                11

            }

          },

          {

            selector:
              'node[nodeType="ENTITY"]',

            style: {

              'background-color':
                '#2563eb'

            }

          },

          {

            selector:
              'node[nodeType="PATTERN"]',

            style: {

              'background-color':
                '#16a34a',

              'width':
                52,

              'height':
                52

            }

          },

          {

            selector:
              'node[nodeType="HYPOTHESIS"]',

            style: {

              'background-color':
                '#f97316',

              'width':
                58,

              'height':
                58

            }

          },

          {

            selector:
              'node[nodeType="NUMBER"]',

            style: {

              'background-color':
                '#64748b',

              'width':
                35,

              'height':
                35,

              'font-size':
                9

            }

          },

          {

            selector:
              'node[nodeType="METRIC"]',

            style: {

              'background-color':
                '#0891b2',

              'width':
                48,

              'height':
                48

            }

          },

          {

            selector: 'edge',

            style: {

              'width':
                1.5,

              'line-color':
                '#cbd5e1',

              'target-arrow-color':
                '#94a3b8',

              'target-arrow-shape':
                'triangle',

              'curve-style':
                'bezier'

            }

          },

          {

            selector:
              'node:selected',

            style: {

              'background-color':
                '#ec4899',

              'border-width':
                4,

              'border-color':
                '#ffffff',

              'width':
                62,

              'height':
                62

            }

          }

        ]

      });

    this.cy.on(
      'tap',
      'node',
      (event) => {

        const node =
          event.target;

        const data =
          node.data();

        const selectedNode = {

          id:
            data.id,

          label:
            data.label,

          type:
            data.nodeType,

          properties:
            data.properties || {}

        };

        console.log(
          'Nodo seleccionado:',
          selectedNode
        );

        this.ngZone.run(() => {

          this.selectedNode =
            selectedNode;

          this.changeDetectorRef.detectChanges();

        });

      }
    );

    this.cy.on(
      'tap',
      (event) => {

        if (
          event.target === this.cy
        ) {

          this.ngZone.run(() => {

            this.selectedNode =
              null;

            this.changeDetectorRef.detectChanges();

          });

        }

      }
    );

  }

  private getNodeId(
    properties: any
  ): string {

    if (!properties) {

      return '';

    }

    if (
      properties.source_id !== undefined &&
      properties.name
    ) {

      return `document-${properties.source_id}`;

    }

    if (
      properties.source_id !== undefined &&
      properties.title
    ) {

      return (
        `hypothesis-${properties.source_id}-${properties.title}`
      );

    }

    if (
      properties.name &&
      properties.type
    ) {

      return (
        `entity-${properties.name}-${properties.type}`
      );

    }

    if (
      properties.type &&
      properties.description
    ) {

      return (
        `pattern-${properties.type}-${properties.description}`
      );

    }

    return JSON.stringify(
      properties
    );

  }

  private getNodeLabel(
    properties: any,
    labels: string[]
  ): string {

    if (!properties) {

      return 'Nodo';

    }

    if (properties.name) {

      return properties.name;

    }

    if (properties.title) {

      return properties.title;

    }

    if (properties.type) {

      return properties.type;

    }

    if (
      labels &&
      labels.length > 0
    ) {

      return labels[0];

    }

    return 'Nodo';

  }

  private getNodeType(
    properties: any,
    labels: string[]
  ): string {

    if (!properties) {

      return 'ENTITY';

    }

    if (
      properties.source_id !== undefined &&
      properties.name
    ) {

      return 'DOCUMENT';

    }

    if (
      properties.source_id !== undefined &&
      properties.title
    ) {

      return 'HYPOTHESIS';

    }

    if (
      properties.type &&
      properties.description
    ) {

      return 'PATTERN';

    }

    if (
      properties.type === 'NUMBER'
    ) {

      return 'NUMBER';

    }

    if (
      properties.type === 'METRIC'
    ) {

      return 'METRIC';

    }

    if (
      properties.name &&
      properties.type
    ) {

      return 'ENTITY';

    }

    if (
      labels &&
      labels.includes('Document')
    ) {

      return 'DOCUMENT';

    }

    if (
      labels &&
      labels.includes('Hypothesis')
    ) {

      return 'HYPOTHESIS';

    }

    if (
      labels &&
      labels.includes('Pattern')
    ) {

      return 'PATTERN';

    }

    return 'ENTITY';

  }

}