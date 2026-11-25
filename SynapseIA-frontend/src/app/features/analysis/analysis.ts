import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  AnalysisResult,
  AnalysisService
} from '../../core/services/analysis';

import {
  AiService
} from '../../core/services/ai';


@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './analysis.html',
  styleUrl: './analysis.scss'
})
export class Analysis implements OnInit {

  sourceId: number | null = null;

  analyses: AnalysisResult[] = [];

  currentAnalysis: AnalysisResult | null = null;

  loading = true;

  errorMessage = '';

  /** `null` while the AI status is unknown. */
  aiConfigured: boolean | null = null;

  aiSummary = '';

  summaryLoading = false;

  summaryError = '';


  constructor(
    private route: ActivatedRoute,
    private analysisService: AnalysisService,
    private aiService: AiService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadAiStatus();

    this.route.paramMap.subscribe(
      params => {

        const id =
          params.get('sourceId');

        if (id) {

          this.sourceId =
            Number(id);

          this.loadAnalysis();

        } else {

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        }

      }
    );

  }


  loadAnalysis(): void {

    const token =
      localStorage.getItem(
        'access_token'
      );


    if (!token || this.sourceId === null) {

      this.loading = false;

      return;

    }


    this.loading = true;

    this.errorMessage = '';


    this.analysisService
      .getSourceAnalysis(
        this.sourceId
      )
      .subscribe({

        next: (
          data: AnalysisResult[]
        ) => {

          console.log(
            'Resultados del análisis:',
            data
          );

          this.analyses = data;

          // The API returns analyses newest first.
          this.currentAnalysis =
            data.length > 0
              ? data[0]
              : null;

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error obteniendo análisis:',
            error
          );

          this.errorMessage =
            'No fue posible obtener el análisis.';

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  loadAiStatus(): void {

    this.aiService
      .getStatus()
      .subscribe({

        next: status => {

          this.aiConfigured =
            status.configured;

          this.changeDetectorRef.detectChanges();

        },

        error: () => {

          this.aiConfigured = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  generateSummary(): void {

    if (
      this.sourceId === null ||
      this.summaryLoading
    ) {

      return;

    }

    this.summaryLoading = true;

    this.summaryError = '';

    this.aiService
      .summarizeSource(
        this.sourceId
      )
      .subscribe({

        next: response => {

          this.aiSummary =
            response.summary;

          this.summaryLoading = false;

          this.changeDetectorRef.detectChanges();

        },

        error: error => {

          this.summaryLoading = false;

          this.summaryError =
            error?.status === 503
              ? 'La IA no está disponible en este momento. Intenta más tarde.'
              : 'No fue posible generar el resumen con IA.';

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  getEntityCount(): number {

    return this.currentAnalysis?.entities?.length || 0;

  }


  getRelationCount(): number {

    return this.currentAnalysis?.relations?.length || 0;

  }


  getPatternCount(): number {

    return this.currentAnalysis?.patterns?.length || 0;

  }


  getHypothesisCount(): number {

    return this.currentAnalysis?.hypotheses?.length || 0;

  }


  /** Confidence (0-1) as a whole percentage between 0 and 100. */
  confidencePercent(
    confidence: number | undefined
  ): number {

    const value = Number(confidence) || 0;

    return Math.round(
      Math.min(Math.max(value, 0), 1) * 100
    );

  }


  /** Turns `COMPITE_CON` into `compite con` for display. */
  formatRelation(
    relation: string
  ): string {

    return (relation || 'RELATED_TO')
      .replace(/_/g, ' ')
      .toLowerCase();

  }


  formatValue(
    value: any
  ): string {

    if (
      value === null ||
      value === undefined
    ) {

      return 'Sin información';

    }


    if (typeof value === 'object') {

      return JSON.stringify(
        value,
        null,
        2
      );

    }


    return String(value);

  }

}