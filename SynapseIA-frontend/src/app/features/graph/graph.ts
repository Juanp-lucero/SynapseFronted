import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  KeyValuePipe
} from '@angular/common';

import cytoscape from 'cytoscape';

import {
  GraphService
} from '../../core/services/graph';

import {
  GraphNodeType
} from '../../core/models/graph.models';

import {
  getNodeId,
  getNodeLabel,
  getNodeType,
  formatRelationLabel,
  isStructuralRelation,
  NODE_TYPE_STYLES,
  NOISY_NODE_TYPES
} from './graph-utils';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    KeyValuePipe,
    RouterLink
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

  /** Node categories present in the current graph, for the legend. */
  legend: {
    type: GraphNodeType;
    label: string;
    color: string;
    count: number;
  }[] = [];

  searchTerm = '';

  searchMessage = '';

  /** Node categories hidden by the user from the legend. */
  hiddenTypes = new Set<GraphNodeType>();

  /** Defaults are applied once, so later user choices are respected. */
  private noisyDefaultsApplied = false;

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

    // Load on the next tick so the first change detection pass is not
    // modified while it runs (NG0100).
    setTimeout(() => this.loadGraph());

  }

  loadGraph(): void {

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
          sourceId
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
          projectId
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
      .getGraph()
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

  /** Spanish name of a node category, e.g. `ORGANIZATION` -> `Organización`. */
  typeLabel(
    type: string
  ): string {

    return (
      NODE_TYPE_STYLES[type as GraphNodeType]?.label ??
      type
    );

  }


  updateSearch(
    value: string
  ): void {

    this.searchTerm = value;

    this.searchMessage = '';

  }


  /** Select and center the first visible node whose label matches. */
  searchNode(): void {

    const term =
      this.searchTerm.trim().toLowerCase();

    if (!this.cy || !term) {
      return;
    }

    const match =
      this.cy
        .nodes()
        .filter(node => node.style('display') !== 'none')
        .filter(node =>
          String(node.data('label') ?? '')
            .toLowerCase()
            .includes(term)
        )
        .first();

    if (match.empty()) {

      this.searchMessage =
        'No se encontró ningún nodo con ese nombre.';

      this.changeDetectorRef.detectChanges();

      return;

    }

    this.cy.elements().unselect();

    match.select();

    this.cy.animate({
      center: { eles: match },
      zoom: Math.max(this.cy.zoom(), 1.2),
      duration: 400
    });

    match.emit('tap');

  }


  /** Zoom so that every visible node fits in the canvas. */
  fitGraph(): void {

    this.cy?.animate({
      fit: {
        eles: this.cy.elements(':visible'),
        padding: 60
      },
      duration: 400
    });

  }


  /** Run the force-directed layout again on the visible nodes. */
  relayoutGraph(): void {

    this.cy
      ?.elements(':visible')
      .layout({
        name: 'cose',
        animate: true,
        padding: 60,
        nodeRepulsion: () => 12000,
        idealEdgeLength: () => 140,
        gravity: 0.25
      })
      .run();

  }


  /** Download the current view of the graph as a PNG image. */
  exportPng(): void {

    if (!this.cy) {
      return;
    }

    const dataUrl =
      this.cy.png({
        full: true,
        scale: 2,
        bg: '#ffffff'
      });

    const link =
      document.createElement('a');

    link.href = dataUrl;

    link.download =
      `synapse-grafo-${this.graphContext
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}.png`;

    link.click();

  }


  isTypeVisible(
    type: GraphNodeType
  ): boolean {

    return !this.hiddenTypes.has(type);

  }


  toggleType(
    type: GraphNodeType
  ): void {

    if (this.hiddenTypes.has(type)) {
      this.hiddenTypes.delete(type);
    } else {
      this.hiddenTypes.add(type);
    }

    this.applyTypeFilter();

  }


  private applyTypeFilter(): void {

    if (!this.cy) {
      return;
    }

    this.cy.batch(() => {

      this.cy!.nodes().forEach(node => {

        const hidden =
          this.hiddenTypes.has(
            node.data('nodeType')
          );

        node.style(
          'display',
          hidden ? 'none' : 'element'
        );

      });

    });

  }


  closeNodePanel(): void {

    this.ngZone.run(() => {

      this.selectedNode =
        null;

      this.changeDetectorRef.detectChanges();

      this.resizeCanvas();

    });

  }


  /**
   * Loose numbers can be hundreds of nodes and hide the real connections.
   * Start with them hidden when the graph has other entities; the legend
   * still lets the user show them.
   */
  private hideNoisyTypesByDefault(): void {

    if (this.noisyDefaultsApplied) {
      return;
    }

    const types = new Set(this.legend.map(item => item.type));

    const hasMeaningfulEntities =
      [...types].some(type => !NOISY_NODE_TYPES.includes(type) && type !== 'DOCUMENT');

    if (hasMeaningfulEntities) {
      NOISY_NODE_TYPES
        .filter(type => types.has(type))
        .forEach(type => this.hiddenTypes.add(type));
    }

    this.noisyDefaultsApplied = true;

  }


  /**
   * Opening or closing the side panel changes the canvas width; Cytoscape
   * must recompute its size or taps land on the wrong coordinates.
   */
  private resizeCanvas(): void {

    setTimeout(() => this.cy?.resize(), 300);

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
        getNodeId(
          properties
        );

      const label =
        getNodeLabel(
          properties,
          node.labels
        );

      const nodeType =
        getNodeType(
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
        getNodeId(
          relationship.source
        );

      const target =
        getNodeId(
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

          relation:
            relationship.relation,

          label:
            isStructuralRelation(relationship.relation)
              ? ''
              : formatRelationLabel(relationship.relation),

          details:
            relationship.properties || {}

        }

      });

    }

    this.legend =
      this.buildLegend(
        elements
      );

    this.hideNoisyTypesByDefault();

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

          ...this.buildNodeTypeStyles(),

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
                'bezier',

              'label':
                'data(label)',

              'font-size':
                8,

              'color':
                '#475569',

              'text-rotation':
                'autorotate',

              'text-background-color':
                '#ffffff',

              'text-background-opacity':
                0.85,

              'text-background-padding':
                '2px'

            }

          },

          {

            selector:
              'edge[relation="SHARES_ENTITIES_WITH"]',

            style: {

              'width':
                3,

              'line-color':
                '#a855f7',

              'line-style':
                'dashed',

              'target-arrow-shape':
                'none',

              'label':
                'comparten entidades',

              'color':
                '#7e22ce'

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

    this.applyTypeFilter();

    // The legend is built after the view was checked: render it now.
    this.changeDetectorRef.detectChanges();

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


        this.ngZone.run(() => {

          this.selectedNode =
            selectedNode;

          this.changeDetectorRef.detectChanges();

          this.resizeCanvas();

        });

      }
    );

    this.cy.on(
      'tap',
      'edge',
      (event) => {

        const data =
          event.target.data();

        const sourceLabel =
          event.target.source().data('label');

        const targetLabel =
          event.target.target().data('label');

        const details =
          data.details || {};

        const properties: Record<string, unknown> = {
          relación: formatRelationLabel(data.relation),
          origen: sourceLabel,
          destino: targetLabel
        };

        if (Array.isArray(details.shared_entities)) {
          properties['entidades compartidas'] =
            details.shared_entities.join(', ');
        }

        this.ngZone.run(() => {

          this.selectedNode = {
            id: data.id,
            label: `${sourceLabel} → ${targetLabel}`,
            type: 'RELACIÓN',
            properties
          };

          this.changeDetectorRef.detectChanges();

          this.resizeCanvas();

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

            this.resizeCanvas();

          });

        }

      }
    );

  }


  /** One Cytoscape style per node category (color and size). */
  private buildNodeTypeStyles(): cytoscape.StylesheetJson {

    return Object.entries(NODE_TYPE_STYLES).map(
      ([type, style]) => ({
        selector: `node[nodeType="${type}"]`,
        style: {
          'background-color': style.color,
          'width': style.size,
          'height': style.size
        }
      })
    );

  }


  private buildLegend(
    elements: cytoscape.ElementDefinition[]
  ): typeof this.legend {

    const counts = new Map<GraphNodeType, number>();

    for (const element of elements) {
      const type = element.data['nodeType'] as GraphNodeType | undefined;
      if (type) {
        counts.set(type, (counts.get(type) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([type, count]) => ({
        type,
        count,
        label: NODE_TYPE_STYLES[type].label,
        color: NODE_TYPE_STYLES[type].color
      }))
      .sort((first, second) => second.count - first.count);

  }

}
