import {
  Routes
} from '@angular/router';

import {
  Layout
} from './layout/layout';

import {
  Dashboard
} from './features/dashboard/dashboard';

import {
  Projects
} from './features/projects/projects';

import {
  Sources
} from './features/sources/sources';

import {
  Analysis
} from './features/analysis/analysis';

import {
  Graph
} from './features/graph/graph';

import {
  authGuard
} from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    component: Layout,

    canActivate: [
      authGuard
    ],

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: Dashboard
      },

      {
        path: 'projects',
        component: Projects
      },

      {
        path: 'projects/:projectId',
        loadComponent: () =>
          import(
            './features/project-detail/project-detail'
          ).then(
            module => module.ProjectDetail
          )
      },

      {
        path: 'sources',
        component: Sources
      },

      {
        path: 'analysis',
        component: Analysis
      },

      {
        path: 'analysis/source/:sourceId',
        component: Analysis
      },

      {
        path: 'graph',
        component: Graph
      },

      {
        path: 'graph/project/:projectId',
        component: Graph
      },

      {
        path: 'graph/source/:sourceId',
        component: Graph
      }

    ]

  },

  {
    path: 'login',
    loadComponent: () =>
      import(
        './features/login/login'
      ).then(
        module => module.Login
      )
  },

  {
    path: 'register',
    loadComponent: () =>
      import(
        './features/register/register'
      ).then(
        module => module.Register
      )
  }

];