import {
  Component
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  userName = 'Investigador';

  statistics = {
    projects: 0,
    sources: 0,
    analyses: 0,
    hypotheses: 0
  };

}