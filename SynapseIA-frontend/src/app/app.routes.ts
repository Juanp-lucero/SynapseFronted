import { Routes } from '@angular/router';

import { Graph } from './features/graph/graph';

import { Dashboard } from './features/dashboard/dashboard';

import { Projects } from './features/projects/projects';


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
    path: 'projects',
    component: Projects
  },

  {
    path: 'graph',
    component: Graph
  }

];