import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, of, shareReplay, timeout } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from '../../shared/services/result';

let cachedValidation: Map<string, { result: boolean; timestamp: number }> = new Map();
const CACHE_DURATION_MS = 60000; // 1 минута

export const TableDataGuard: CanActivateFn = (route, state) => {
  const result = inject(Result);
  const router = inject(Router);

  // Минимизируем обращения к localStorage - одно обращение
  const storedJobId = localStorage.getItem('jobId');

  if (!storedJobId) {
    router.navigate(['/error/404']);
    return false;
  }

  // Проверяем кэш перед API запросом
  const cachedEntry = cachedValidation.get(storedJobId);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS) {
    return cachedEntry.result;
  }

  // Валидируем данные через API с timeout
  return result.getResult(storedJobId).pipe(
    timeout(5000),
    map((response: any) => {
      const isValid = response?.status === 'completed';

      // Кэшируем результат валидации
      cachedValidation.set(storedJobId, {
        result: isValid,
        timestamp: Date.now(),
      });

      if (!isValid) {
        router.navigate(['/error/404']);
      }

      return isValid;
    }),
    catchError((error: any) => {
      // Маршрутизация по типам ошибок
      const errorRoute =
        error?.status === 500 || error?.status === 505 ? '/error/500' : '/error/404';
      router.navigate([errorRoute]);
      return of(false);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
};
