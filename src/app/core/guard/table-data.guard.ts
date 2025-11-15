import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {Result} from '../../shared/services/result';
import {catchError, of} from 'rxjs';
import {map} from 'rxjs/operators';

export const TableDataGuard: CanActivateFn = (route, state) => {
  const result = inject(Result);
  const router = inject(Router);

  // Проверяем наличие данных в localStorage
  const storedData = localStorage.getItem('processedTableData');
  const storedJobId = localStorage.getItem('jobId');

  console.log('🔐 TableDataGuard: Проверка доступа', {
    hasStoredData: !!storedData,
    hasJobId: !!storedJobId
  });

  // Если нет данных в localStorage, блокируем доступ
  if (!storedData || !storedJobId) {
    console.warn('❌ TableDataGuard: Нет данных в localStorage');
    router.navigate(['']);
    return false;
  }

  // Проверяем данные на валидность через API
  return result.getResult(storedJobId).pipe(
    map((response) => {
      console.log('✅ TableDataGuard: Результат получен:', {
        status: (response as any).status,
        job_id: (response as any).job_id
      });

      // Если статус 'completed', пропускаем
      if ((response as any).status === 'completed') {
        console.log('✅ TableDataGuard: Доступ разрешен');
        return true;
      }

      console.warn('❌ TableDataGuard: Неверный статус:', (response as any).status);
      router.navigate(['']);
      return false;
    }),
    catchError((error) => {
      console.error('❌ TableDataGuard: Ошибка при проверке результата:', error);
      router.navigate(['']);
      return of(false);
    })
  );
};
