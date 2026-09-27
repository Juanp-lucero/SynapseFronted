import {
  Component,
  OnInit
} from '@angular/core';

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
    RouterLink
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements OnInit {

  projects: Project[] = [];

  loading = true;

  errorMessage = '';


  constructor(
    private projectService: ProjectService
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

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error eliminando proyecto:',
            error
          );

        }

      });

  }

}