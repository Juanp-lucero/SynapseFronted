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
  Project,
  ProjectService
} from '../../core/services/project';

import {
  Source,
  SourceService
} from '../../core/services/source';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss'
})
export class ProjectDetail implements OnInit {

  project: Project | null = null;

  sources: Source[] = [];

  loading = true;

  loadingSources = true;

  errorMessage = '';

  sourcesErrorMessage = '';

  projectId = 0;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private sourceService: SourceService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('projectId')
    );

    if (!id) {

      this.errorMessage =
        'El proyecto solicitado no es válido.';

      this.loading = false;

      this.loadingSources = false;

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.projectId = id;

    this.loadProject();

    this.loadSources();
  }

  loadProject(): void {

    const token = localStorage.getItem(
      'access_token'
    );

    if (!token) {

      this.errorMessage =
        'No existe una sesión activa.';

      this.loading = false;

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.projectService
      .getProject(this.projectId, token)
      .subscribe({

        next: (project: Project) => {

          console.log(
            'Proyecto seleccionado:',
            project
          );

          this.project = project;

          this.loading = false;

          this.changeDetectorRef.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Error obteniendo proyecto:',
            error
          );

          if (error.status === 404) {

            this.errorMessage =
              'El proyecto no existe o no tienes acceso a él.';

          } else {

            this.errorMessage =
              'No fue posible cargar el proyecto.';
          }

          this.loading = false;

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  loadSources(): void {

    const token = localStorage.getItem(
      'access_token'
    );

    if (!token) {

      this.sourcesErrorMessage =
        'No existe una sesión activa.';

      this.loadingSources = false;

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.loadingSources = true;

    this.sourceService
      .getSources(this.projectId, token)
      .subscribe({

        next: (sources: Source[]) => {

          console.log(
            'Fuentes del proyecto:',
            sources
          );

          this.sources = sources;

          this.loadingSources = false;

          this.changeDetectorRef.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Error obteniendo fuentes:',
            error
          );

          this.sourcesErrorMessage =
            'No fue posible cargar las fuentes del proyecto.';

          this.loadingSources = false;

          this.changeDetectorRef.detectChanges();
        }
      });
  }
}