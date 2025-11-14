import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {HealthResponse} from '../../../types/health.type';


export const serverErrorGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<HealthResponse>(`${environment.apiUrl}/health`).pipe(
    map((response) => {
      if (response.status === 'healthy') {
        // Если сервер здоров, перенаправляем на главную страницу
        router.navigate(['/']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      // Если ошибка при проверке здоровья - показываем 505
      console.error('Server Error');
      return of(true);
    })
  );
};

