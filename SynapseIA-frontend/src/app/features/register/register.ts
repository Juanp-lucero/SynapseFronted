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
  RegisterRequest
} from '../../core/services/auth';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  user: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  };

  loading = false;

  errorMessage = '';

  successMessage = '';


  constructor(
    private auth: Auth,
    private router: Router
  ) {}


  register(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (
      !this.user.name ||
      !this.user.email ||
      !this.user.password
    ) {

      this.errorMessage =
        'Completa todos los campos.';

      return;

    }


    this.loading = true;


    this.auth
      .register(this.user)
      .subscribe({

        next: () => {

          this.loading = false;

          this.successMessage =
            'Cuenta creada correctamente.';

          setTimeout(
            () => {

              this.router.navigate([
                '/login'
              ]);

            },
            1000
          );

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error registrando usuario:',
            error
          );

          this.loading = false;

          if (
            error.status === 400
          ) {

            this.errorMessage =
              error.error?.detail ||
              'El correo ya está registrado.';

          } else {

            this.errorMessage =
              'No fue posible crear la cuenta.';

          }

        }

      });

  }


  goToLogin(): void {

    this.router.navigate([
      '/login'
    ]);

  }

}