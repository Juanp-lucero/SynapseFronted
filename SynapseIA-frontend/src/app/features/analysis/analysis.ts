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


  constructor(
    private route: ActivatedRoute,
    private analysisService: AnalysisService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

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
        this.sourceId,
        token
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

          if (data.length > 0) {

            this.currentAnalysis =
              data[data.length - 1];

          }

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