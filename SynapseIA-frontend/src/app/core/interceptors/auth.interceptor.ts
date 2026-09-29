import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import {
  Auth
} from '../services/auth';


export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const auth =
    inject(Auth);

  const accessToken =
    auth.getAccessToken();


  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout') ||
    req.url.includes('/users/');


  let request = req;


  if (
    accessToken &&
    !isAuthRequest
  ) {

    request =
      req.clone({
        setHeaders: {
          Authorization:
            `Bearer ${accessToken}`
        }
      });

  }


  return next(request).pipe(

    catchError(
      (error: HttpErrorResponse) => {

        if (
          error.status !== 401 ||
          isAuthRequest
        ) {

          return throwError(
            () => error
          );

        }


        return auth
          .refreshToken()
          .pipe(

            switchMap(
              response => {

                const retryRequest =
                  req.clone({
                    setHeaders: {
                      Authorization:
                        `Bearer ${response.access_token}`
                    }
                  });

                return next(
                  retryRequest
                );

              }
            ),

            catchError(
              refreshError => {

                auth.clearSession();

                return throwError(
                  () => refreshError
                );

              }
            )

          );

      }
    )

  );

};