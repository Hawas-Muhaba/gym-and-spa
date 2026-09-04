import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const token = authStore.accessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only attempt refresh on a 401, and never for the refresh endpoint itself (avoids infinite loops)
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        const refreshToken = authStore.refreshToken();
        if (!refreshToken || !token) {
          authStore.logout();
          return throwError(() => error);
        }

        return authService.refresh(token, refreshToken).pipe(
          switchMap((response) => {
            const user = authService.decodeToken(response.accessToken);
            authStore.setSession(response.accessToken, response.refreshToken, user);

            // Retry the ORIGINAL failed request, now with the new token
            const retriedReq = req.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` } });
            return next(retriedReq);
          }),
          catchError((refreshError) => {
            authStore.logout(); // refresh itself failed — genuinely expired, force real re-login
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};