import { Routes } from '@angular/router';

import { Graph } from './features/graph/graph';
import { Dashboard } from './features/dashboard/dashboard';

export const routes: Routes = [

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
    path: 'graph',
    component: Graph
  }

];