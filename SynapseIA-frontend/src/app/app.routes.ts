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


export const routes: Routes = [

  {
    path: '',
    component: Layout,

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
        path: 'graph/source/:sourceId',
        component: Graph
      }

    ]

  }

];