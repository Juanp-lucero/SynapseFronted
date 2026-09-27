import {
  Component,
  OnInit
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  DashboardService,
  DashboardStats
} from '../../core/services/dashboard';


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

  userName =
    'Investigador';


  statistics: DashboardStats = {

    projects: 0,

    sources: 0,

    analyses: 0,

    hypotheses: 0

  };


  loading = true;


  constructor(
    private dashboardService: DashboardService
  ) {}


  ngOnInit(): void {

    this.loadStatistics();

  }


  loadStatistics(): void {

    const token =
      localStorage.getItem(
        'access_token'
      );


    if (!token) {

      console.error(
        'No existe un token de autenticación'
      );

      this.loading = false;

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


          this.statistics = data;

          this.loading = false;

        },


        error: (
          error: any
        ) => {

          console.error(
            'Error obteniendo estadísticas:',
            error
          );


          this.loading = false;

        }

      });

  }

}