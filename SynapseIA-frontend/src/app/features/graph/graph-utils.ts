import {
  GraphNodeProperties,
  GraphNodeType
} from '../../core/models/graph.models';

/** Entity types produced by the rules engine or by the AI extractor. */
const ENTITY_TYPES = new Set<GraphNodeType>([
  'PERSON',
  'ORGANIZATION',
  'LOCATION',
  'DATE',
  'EVENT',
  'PRODUCT',
  'CONCEPT',
  'NUMBER',
  'YEAR',
  'METRIC',
  'CATEGORY'
]);

function isDocument(
  properties: GraphNodeProperties
): boolean {
  return (
    properties.source_id !== undefined &&
    properties.name !== undefined &&
    properties.title === undefined
  );
}

function isHypothesis(
  properties: GraphNodeProperties
): boolean {
  return (
    properties.source_id !== undefined &&
    properties.title !== undefined
  );
}

function isPattern(
  properties: GraphNodeProperties
): boolean {
  return (
    properties.type !== undefined &&
    properties.description !== undefined &&
    properties.name === undefined
  );
}

/** Stable Cytoscape id for a node, shared by nodes and edges. */
export function getNodeId(
  properties: GraphNodeProperties | null | undefined
): string {

  if (!properties) {
    return '';
  }

  if (isDocument(properties)) {
    return `document-${properties.source_id}`;
  }

  if (isHypothesis(properties)) {
    return `hypothesis-${properties.source_id}-${properties.title}`;
  }

  if (properties.name && properties.type) {
    return `entity-${properties.name}-${properties.type}`;
  }

  if (isPattern(properties)) {
    return `pattern-${properties.type}-${properties.description}`;
  }

  return JSON.stringify(properties);
}

/** Human readable label of a node. */
export function getNodeLabel(
  properties: GraphNodeProperties | null | undefined,
  labels: string[] = []
): string {

  if (!properties) {
    return 'Nodo';
  }

  const label =
    properties.name ??
    properties.title ??
    properties.type ??
    labels[0];

  return label ? String(label) : 'Nodo';
}

/** Category used to color, size and filter a node. */
export function getNodeType(
  properties: GraphNodeProperties | null | undefined,
  labels: string[] = []
): GraphNodeType {

  if (!properties) {
    return 'ENTITY';
  }

  if (isDocument(properties) || labels.includes('Document')) {
    return 'DOCUMENT';
  }

  if (isHypothesis(properties) || labels.includes('Hypothesis')) {
    return 'HYPOTHESIS';
  }

  if (isPattern(properties) || labels.includes('Pattern')) {
    return 'PATTERN';
  }

  const type = String(properties.type ?? '').toUpperCase() as GraphNodeType;

  if (ENTITY_TYPES.has(type)) {
    return type;
  }

  return 'ENTITY';
}

/** Visual settings of every node category. */
export interface NodeTypeStyle {
  label: string;
  color: string;
  size: number;
}

export const NODE_TYPE_STYLES: Record<GraphNodeType, NodeTypeStyle> = {
  DOCUMENT: { label: 'Documento', color: '#7c3aed', size: 65 },
  HYPOTHESIS: { label: 'Hipótesis', color: '#f97316', size: 58 },
  PATTERN: { label: 'Patrón', color: '#16a34a', size: 52 },
  PERSON: { label: 'Persona', color: '#db2777', size: 46 },
  ORGANIZATION: { label: 'Organización', color: '#2563eb', size: 46 },
  LOCATION: { label: 'Lugar', color: '#0d9488', size: 44 },
  EVENT: { label: 'Evento', color: '#ca8a04', size: 44 },
  PRODUCT: { label: 'Producto', color: '#9333ea', size: 44 },
  CONCEPT: { label: 'Concepto', color: '#4f46e5', size: 42 },
  DATE: { label: 'Fecha', color: '#475569', size: 38 },
  METRIC: { label: 'Métrica', color: '#0891b2', size: 48 },
  CATEGORY: { label: 'Categoría', color: '#65a30d', size: 42 },
  YEAR: { label: 'Año', color: '#64748b', size: 36 },
  NUMBER: { label: 'Número', color: '#94a3b8', size: 34 },
  ENTITY: { label: 'Entidad', color: '#6366f1', size: 42 }
};

/** Relations that only describe structure (where something was found). */
const STRUCTURAL_RELATIONS = new Set([
  'MENTIONED_IN',
  'DETECTED_IN',
  'GENERATED_FROM'
]);

export function isStructuralRelation(
  relation: string | null | undefined
): boolean {
  return STRUCTURAL_RELATIONS.has(String(relation ?? '').toUpperCase());
}

/** `COMPITE_CON` -> `compite con`. */
export function formatRelationLabel(
  relation: string | null | undefined
): string {
  return String(relation ?? '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();
}
