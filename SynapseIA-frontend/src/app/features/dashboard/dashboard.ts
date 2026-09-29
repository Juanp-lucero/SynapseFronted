import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  DashboardService,
  DashboardStats,
  CurrentUser
} from '../../core/services/dashboard';

import {
  Auth
} from '../../core/services/auth';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  userName = 'Investigador';


  statistics: DashboardStats = {

    projects: 0,

    sources: 0,

    analyses: 0,

    hypotheses: 0

  };


  loading = true;

  loadingUser = true;


  constructor(
    private dashboardService: DashboardService,
    private auth: Auth,
    private changeDetectorRef: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadUser();

    this.loadStatistics();

  }


  loadUser(): void {

    const token =
      this.auth.getAccessToken();


    if (!token) {

      this.loadingUser = false;

      this.changeDetectorRef.detectChanges();

      return;

    }


    this.dashboardService
      .getCurrentUser(token)
      .subscribe({

        next: (
          user: CurrentUser
        ) => {

          this.userName =
            user.name;

          this.loadingUser = false;

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error obteniendo usuario:',
            error
          );

          this.loadingUser = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  loadStatistics(): void {

    const token =
      this.auth.getAccessToken();


    if (!token) {

      console.error(
        'No existe un token de autenticación'
      );

      this.loading = false;

      this.changeDetectorRef.detectChanges();

      return;

    }


    this.dashboardService
      .getStats(token)
      .subscribe({

        next: (
          data: DashboardStats
        ) => {

          console.log(
            'Estadísticas del Dashboard:',
            data
          );

          this.statistics =
            data;

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error obteniendo estadísticas:',
            error
          );

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }

}