import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  ErrorResultResponse,
  ProcessingResultResponse,
  ResultResponse,
  SuccessResultResponse
} from '../../../types/resultResponse.type';
import {catchError, map} from 'rxjs/operators';

export interface ResultError {
  status: 'error';
  message: string;
  code?: string;
  job_id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Result {
  constructor(private http: HttpClient) {}

  getResult(job_id: string): Observable<SuccessResultResponse | ProcessingResultResponse> {
    return this.http.get<ResultResponse>(`${environment.apiUrl}/results?job_id=${job_id}`).pipe(
      map((response: ResultResponse) => {
        console.log('📦 Получен ответ от сервера:', response);

        // Обработка ошибки (error)
        if ('detail' in response && !('status' in response)) {
          const errorResponse = response as ErrorResultResponse;
          console.error('❌ Получена ошибка от сервера:', errorResponse.detail);

          const error = new Error(errorResponse.detail);
          (error as any).stage = 'retrieving';
          throw error;
        }

        // Обработка обработки (processing)
        if ('status' in response && response.status === 'processing') {
          const processingResponse = response as ProcessingResultResponse;
          console.log('⏳ Обработка ещё в процессе:', {
            job_id: processingResponse.job_id,
            status: processingResponse.status
          });
          return processingResponse;
        }

        // Успешный результат (completed)
        if ('status' in response && response.status === 'completed') {
          const successResponse = response as SuccessResultResponse;

          // Проверяем наличие ошибки в успешном ответе
          if (successResponse.error) {
            console.error('❌ Обнаружена ошибка в результате:', successResponse.error);
            const error = new Error(successResponse.error);
            (error as any).stage = 'retrieving';
            throw error;
          }

          console.log('✅ Результат успешно получен:', {
            job_id: successResponse.job_id,
            status: successResponse.status,
            preset: successResponse.preset,
            columns: successResponse.requested_columns.length,
            rows: successResponse.table.rows.length,
            processing_time: successResponse.metadata.processing_time_seconds
          });
          return successResponse;
        }

        // Неожиданный формат ответа
        console.error('❌ Неожиданный формат ответа:', response);
        const error = new Error('Неожиданный формат ответа от сервера');
        (error as any).stage = 'retrieving';
        throw error;
      }),
      catchError((error) => {
        console.error('❌ Ошибка при получении результата:', error);

        let errorMessage = 'Неизвестная ошибка при получении результата';
        let stage: 'analyzing' | 'retrieving' = 'retrieving';

        // Если это наш Error объект
        if (error instanceof Error) {
          errorMessage = error.message;
          if ((error as any).stage) {
            stage = (error as any).stage;
          }
        }
        // Если это HTTP ошибка
        else if (error.error) {
          if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (typeof error.error === 'object') {
            errorMessage = JSON.stringify(error.error);
          }
        }
        // Если это просто сообщение
        else if (typeof error === 'string') {
          errorMessage = error;
        }

        const resultError: ResultError = {
          status: 'error',
          message: errorMessage,
          code: error.status || 'UNKNOWN',
          job_id: undefined
        };

        console.error('📋 Финальная ошибка:', resultError);
        return throwError(() => resultError);
      })
    );
  }
}

