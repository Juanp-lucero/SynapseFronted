import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import { JsonPipe } from '@angular/common';

import cytoscape from 'cytoscape';

import { GraphService } from '../../core/services/graph';


@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './graph.html',
  styleUrl: './graph.scss'
})
export class Graph implements AfterViewInit {

  @ViewChild('graphContainer')
  graphContainer!: ElementRef;

  graphData: any = null;

  private cy: cytoscape.Core | null = null;

  private viewReady = false;

  constructor(
    private graphService: GraphService
  ) {}

  ngAfterViewInit(): void {

    this.viewReady = true;

    if (this.graphData) {
      this.renderGraph();
    }
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

          this.graphData = data;

          if (this.viewReady) {
            this.renderGraph();
          }
        },

        error: (error: any) => {

          console.error(
            'Error obteniendo el grafo:',
            error
          );
        }
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
    }

    const nodes = this.graphData.nodes || [];

    const relationships =
      this.graphData.relationships || [];

    const elements: cytoscape.ElementDefinition[] = [];

    for (const node of nodes) {

      const properties =
        node.properties || {};

      const id = this.getNodeId(
        properties
      );

      const label = this.getNodeLabel(
        properties,
        node.labels
      );

      elements.push({
        data: {
          id,
          label
        }
      });
    }

    for (const relationship of relationships) {

      const source = this.getNodeId(
        relationship.source
      );

      const target = this.getNodeId(
        relationship.target
      );

      if (!source || !target) {
        continue;
      }

      elements.push({
        data: {
          id: `${source}-${relationship.relation}-${target}`,
          source,
          target,
          label: relationship.relation
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
        padding: 40
      },

      style: [
        {
          selector: 'node',

          style: {
            'background-color': '#6366f1',
            'label': 'data(label)',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '11px',
            'width': '45px',
            'height': '45px'
          }
        },

        {
          selector: 'edge',

          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#475569',
            'text-rotation': 'autorotate'
          }
        },

        {
          selector: 'node:selected',

          style: {
            'background-color': '#ec4899',
            'border-width': 3,
            'border-color': '#ffffff'
          }
        }
      ]
    });
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

      return `hypothesis-${properties.source_id}-${properties.title}`;
    }

    if (
      properties.name &&
      properties.type
    ) {

      return `entity-${properties.name}-${properties.type}`;
    }

    if (
      properties.type &&
      properties.description
    ) {

      return `pattern-${properties.type}-${properties.description}`;
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

    if (labels && labels.length > 0) {
      return labels[0];
    }

    return 'Nodo';
  }
}