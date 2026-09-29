import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  Project,
  ProjectService
} from '../../core/services/project';


@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements OnInit {

  projects: Project[] = [];

  loading = true;

  creatingProject = false;

  errorMessage = '';

  showCreateForm = false;

  projectName = '';

  projectDescription = '';


  constructor(
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
            'Proyectos:',
            data
          );

          this.projects = data;

          this.loading = false;

          this.changeDetectorRef.detectChanges();

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


  openCreateForm(): void {

    this.projectName = '';

    this.projectDescription = '';

    this.errorMessage = '';

    this.showCreateForm = true;

    this.changeDetectorRef.detectChanges();

  }


  closeCreateForm(): void {

    if (this.creatingProject) {
      return;
    }

    this.showCreateForm = false;

    this.projectName = '';

    this.projectDescription = '';

    this.changeDetectorRef.detectChanges();

  }


  createProject(): void {

    const token =
      localStorage.getItem(
        'access_token'
      );


    if (!token) {

      this.errorMessage =
        'No existe una sesión activa.';

      return;

    }


    const name =
      this.projectName.trim();


    const description =
      this.projectDescription.trim();


    if (!name) {

      this.errorMessage =
        'El nombre del proyecto es obligatorio.';

      return;

    }


    this.creatingProject = true;

    this.errorMessage = '';


    this.projectService
      .createProject(
        {
          name,
          description
        },
        token
      )
      .subscribe({

        next: (
          project: Project
        ) => {

          console.log(
            'Proyecto creado:',
            project
          );

          this.projects = [
            project,
            ...this.projects
          ];

          this.projectName = '';

          this.projectDescription = '';

          this.showCreateForm = false;

          this.creatingProject = false;

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error creando proyecto:',
            error
          );

          this.errorMessage =
            error?.error?.detail ||
            'No fue posible crear el proyecto.';

          this.creatingProject = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  deleteProject(
    project: Project
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
        `¿Eliminar el proyecto "${project.name}"?`
      );


    if (!confirmed) {
      return;
    }


    this.projectService
      .deleteProject(
        project.id,
        token
      )
      .subscribe({

        next: () => {

          this.projects =
            this.projects.filter(
              item =>
                item.id !== project.id
            );

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error eliminando proyecto:',
            error
          );

          this.errorMessage =
            error?.error?.detail ||
            'No fue posible eliminar el proyecto.';

          this.changeDetectorRef.detectChanges();

        }

      });

  }

}