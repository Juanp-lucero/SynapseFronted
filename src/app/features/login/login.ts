import {
  Component
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  Auth,
  LoginRequest
} from '../../core/services/auth';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  loading = false;

  errorMessage = '';


  constructor(
    private auth: Auth,
    private router: Router
  ) {}


  login(): void {

    this.errorMessage = '';

    if (
      !this.credentials.email ||
      !this.credentials.password
    ) {

      this.errorMessage =
        'Ingresa tu correo y contraseña.';

      return;

    }


    this.loading = true;


    this.auth
      .login(this.credentials)
      .subscribe({

        next: () => {

          this.loading = false;

          this.router.navigate([
            '/dashboard'
          ]);

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error iniciando sesión:',
            error
          );

          this.loading = false;

          if (
            error.status === 401
          ) {

            this.errorMessage =
              'Correo o contraseña incorrectos.';

          } else {

            this.errorMessage =
              'No fue posible iniciar sesión.';

          }

        }

      });

  }


  goToRegister(): void {

    this.router.navigate([
      '/register'
    ]);

  }

}