/** Node returned by the Knowledge Graph API. */
export interface GraphNode {
  labels: string[];
  properties: GraphNodeProperties;
}

/** Properties of a graph node. Which ones exist depends on the node label. */
export interface GraphNodeProperties {
  source_id?: number;
  name?: string;
  type?: string;
  title?: string;
  description?: string;
  confidence?: number;
  [key: string]: unknown;
}

/** Relationship between two nodes of the Knowledge Graph. */
export interface GraphRelationship {
  source: GraphNodeProperties;
  relation: string;
  target: GraphNodeProperties;
  properties?: {
    shared_entities?: string[];
    count?: number;
    [key: string]: unknown;
  };
}

/** Response of `/graph`, `/graph/project/:id` and `/graph/source/:id`. */
export interface GraphResponse {
  source_ids: number[];
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

/** Node categories used to color and filter the graph. */
export type GraphNodeType =
  | 'DOCUMENT'
  | 'ENTITY'
  | 'PERSON'
  | 'ORGANIZATION'
  | 'LOCATION'
  | 'DATE'
  | 'EVENT'
  | 'PRODUCT'
  | 'CONCEPT'
  | 'PATTERN'
  | 'HYPOTHESIS'
  | 'NUMBER'
  | 'YEAR'
  | 'METRIC'
  | 'CATEGORY';
