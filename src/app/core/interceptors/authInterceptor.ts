import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('refresh-token')) {
        
        // لو في refresh جاري، استنى التوكن الجديد
        if (isRefreshing) {
          return refreshDone$.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(newToken => {
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            })
          );
        }

        isRefreshing = true;
        refreshDone$.next(null);

        return authService.refreshToken().pipe(
          switchMap((response) => {
            isRefreshing = false;
            refreshDone$.next(response.accessToken);

            return next(req.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` },
            }));
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshDone$.next(null);
            // بس هنا نعمل navigate للـ login لو الـ refresh فشل فعلاً
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};