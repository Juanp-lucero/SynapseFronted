import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild
} from '@angular/core';

import {
  KeyValuePipe
} from '@angular/common';

import cytoscape from 'cytoscape';

import { GraphService } from '../../core/services/graph';


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

  private cy: cytoscape.Core | null = null;

  private viewReady = false;

  constructor(
    private graphService: GraphService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {

    this.viewReady = true;

    this.loadGraph();
  }

  loadGraph(): void {

    const token = localStorage.getItem(
      'access_token'
    );

    if (!token) {

      console.error(
        'No existe un token de autenticación'
      );

      return;
    }

    const sourceId = 4;

    this.graphService
      .getSourceGraph(
        sourceId,
        token
      )
      .subscribe({

        next: (data: any) => {

          console.log(
            'Datos del grafo:',
            data
          );

          this.ngZone.run(() => {

            this.graphData = data;

            this.selectedNode = null;

            this.changeDetectorRef.detectChanges();

            if (this.viewReady) {

              this.renderGraph();

            }

          });

        },

        error: (error: any) => {

          console.error(
            'Error obteniendo el grafo:',
            error
          );

        }

      });
  }

  closeNodePanel(): void {

    this.ngZone.run(() => {

      this.selectedNode = null;

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

    for (const relationship of relationships) {

      const source =
        this.getNodeId(
          relationship.source
        );

      const target =
        this.getNodeId(
          relationship.target
        );

      if (!source || !target) {
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

    this.cy = cytoscape({

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

            this.selectedNode = null;

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