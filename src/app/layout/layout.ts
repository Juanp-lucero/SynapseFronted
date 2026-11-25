import {
  Component
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import {
  Auth
} from '../core/services/auth';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {

  loggingOut = false;


  constructor(
    private auth: Auth,
    private router: Router
  ) {}


  logout(): void {

    if (this.loggingOut) {
      return;
    }


    this.loggingOut = true;


    this.auth
      .logout()
      .subscribe({

        next: () => {

          this.router.navigate([
            '/login'
          ]);

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error cerrando sesión:',
            error
          );

          this.auth.clearSession();

          this.router.navigate([
            '/login'
          ]);

        }

      });

  }

}