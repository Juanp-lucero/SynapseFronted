/** Where an extracted item came from. */
export type ExtractionOrigin = 'ai' | 'rules';

export interface AnalysisEntity {
  type: string;
  value: string;
  origin?: ExtractionOrigin;
}

export interface AnalysisRelation {
  source: string;
  relation: string;
  target: string;
  evidence?: string;
  origin?: ExtractionOrigin;
}

export interface AnalysisPattern {
  type: string;
  description: string;
  [key: string]: unknown;
}

export interface AnalysisHypothesis {
  title: string;
  description?: string;
  confidence?: number;
  evidence?: string[];
  entities?: string[];
  type?: string;
  origin?: ExtractionOrigin;
  [key: string]: unknown;
}

/** Response of `/analysis/source/:id`. */
export interface AnalysisResult {
  id: number;
  source_id: number;
  status: string;
  entities: AnalysisEntity[];
  relations: AnalysisRelation[];
  patterns: AnalysisPattern[];
  hypotheses: AnalysisHypothesis[];
  created_at: string;
  ai_summary?: string | null;
  ai_provider?: string | null;
}

/** Response of `/ai/status`. */
export interface AiStatus {
  provider: string;
  configured: boolean;
  model: string;
}

/** Response of `/ai/source/:id/summary`. */
export interface AiSummaryResponse {
  source_id: number;
  provider: string;
  model: string;
  summary: string;
}

/** Response of `/ai/source/:id/ask`. */
export interface AiAnswerResponse {
  source_id: number;
  provider: string;
  model: string;
  answer: string;
}
