import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        router.navigate(['/unauthorized']);
      } else if (error.status === 429) {
        snackBar.open('Rate limit exceeded. Please wait a moment before making more requests.', 'Dismiss', {
          duration: 5000,
        });
      } else if (error.status === 500) {
        snackBar.open('An unexpected server error occurred. Please try again later.', 'Dismiss', {
          duration: 4000,
        });
      } else if (error.status === 400 || error.status === 422) {
        let msg = 'Request failed. Please verify your input.';
        if (typeof error.error === 'string' && error.error.length < 150) {
          msg = error.error;
        } else if (error.error?.message) {
          msg = error.error.message;
        } else if (error.error?.title) {
          msg = error.error.title;
        }
        snackBar.open(msg, 'Dismiss', { duration: 4500 });
      }

      return throwError(() => error);
    })
  );
};
