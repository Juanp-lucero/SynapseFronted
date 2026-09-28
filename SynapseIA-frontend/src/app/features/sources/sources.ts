import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Source,
  SourceService
} from '../../core/services/source';

import {
  Project,
  ProjectService
} from '../../core/services/project';


@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './sources.html',
  styleUrl: './sources.scss'
})
export class Sources implements OnInit {

  sources: Source[] = [];

  projects: Project[] = [];

  selectedProjectId: number | null = null;

  selectedFile: File | null = null;

  loading = true;

  uploading = false;

  errorMessage = '';

  successMessage = '';


  constructor(
    private sourceService: SourceService,
    private projectService: ProjectService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadProjects();

  }


  loadProjects(): void {

    const token =
      localStorage.getItem(
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
      .getProjects(token)
      .subscribe({

        next: (
          data: Project[]
        ) => {

          console.log(
            'Proyectos disponibles:',
            data
          );

          this.projects = data;

          if (data.length > 0) {

            this.selectedProjectId =
              data[0].id;

            this.changeDetectorRef.detectChanges();

            this.loadSources();

          } else {

            this.loading = false;

            this.changeDetectorRef.detectChanges();

          }

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error obteniendo proyectos:',
            error
          );

          this.errorMessage =
            'No fue posible cargar los proyectos.';

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  loadSources(): void {

    const token =
      localStorage.getItem(
        'access_token'
      );


    if (
      !token ||
      this.selectedProjectId === null
    ) {

      this.loading = false;

      this.changeDetectorRef.detectChanges();

      return;

    }


    this.loading = true;

    this.changeDetectorRef.detectChanges();


    this.sourceService
      .getSources(
        this.selectedProjectId,
        token
      )
      .subscribe({

        next: (
          data: Source[]
        ) => {

          console.log(
            'Fuentes:',
            data
          );

          this.sources = data;

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error obteniendo fuentes:',
            error
          );

          this.errorMessage =
            'No fue posible cargar las fuentes.';

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  onProjectChange(): void {

    this.successMessage = '';

    this.errorMessage = '';

    this.loadSources();

  }


  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedFile = null;

      return;

    }


    this.selectedFile =
      input.files[0];

  }


  uploadFile(): void {

    const token =
      localStorage.getItem(
        'access_token'
      );


    if (!token) {

      this.errorMessage =
        'No existe una sesión activa.';

      return;

    }


    if (this.selectedProjectId === null) {

      this.errorMessage =
        'Selecciona un proyecto.';

      return;

    }


    if (!this.selectedFile) {

      this.errorMessage =
        'Selecciona un archivo.';

      return;

    }


    this.uploading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.changeDetectorRef.detectChanges();


    this.sourceService
      .uploadSource(
        this.selectedFile,
        this.selectedProjectId,
        token
      )
      .subscribe({

        next: (
          source: Source
        ) => {

          console.log(
            'Fuente creada:',
            source
          );

          this.sources = [
            source,
            ...this.sources
          ];

          this.selectedFile = null;

          this.uploading = false;

          this.successMessage =
            'Fuente cargada correctamente.';

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error subiendo fuente:',
            error
          );

          this.uploading = false;

          this.errorMessage =
            'No fue posible cargar el archivo.';

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  deleteSource(
    source: Source
  ): void {

    const token =
      localStorage.getItem(
        'access_token'
      );


    if (!token) {
      return;
    }


    const confirmed =
      window.confirm(
        `¿Eliminar la fuente "${source.name}"?`
      );


    if (!confirmed) {
      return;
    }


    this.sourceService
      .deleteSource(
        source.id,
        token
      )
      .subscribe({

        next: () => {

          this.sources =
            this.sources.filter(
              item =>
                item.id !== source.id
            );

          this.successMessage =
            'Fuente eliminada correctamente.';

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error eliminando fuente:',
            error
          );

          this.errorMessage =
            'No fue posible eliminar la fuente.';

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  getFileType(
    source: Source
  ): string {

    return source.type
      .toUpperCase();

  }

}