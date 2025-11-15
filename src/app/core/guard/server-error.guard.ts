import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HealthResponse } from '../../../types/health.type';

let cachedHealthCheck: Observable<boolean> | null = null;
let lastCheckTime = 0;
const CACHE_DURATION_MS = 30000; // 30 секунд

export const serverErrorGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const now = Date.now();

  // Используем кэшированный результат если он свежий
  if (cachedHealthCheck && now - lastCheckTime < CACHE_DURATION_MS) {
    return cachedHealthCheck;
  }

  cachedHealthCheck = http
    .get<HealthResponse>(`${environment.apiUrl}/health`)
    .pipe(
      timeout(5000), // Timeout 5 секунд
      map((response) => {
        if (response.status === 'healthy') {
          router.navigate(['/']);
          return false;
        }
        return true;
      }),
      catchError(() => of(true)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  lastCheckTime = now;
  return cachedHealthCheck;
};

