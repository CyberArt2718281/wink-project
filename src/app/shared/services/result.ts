import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ProcessingResultResponse, ResultResponse, SuccessResultResponse} from '../../../types/resultResponse.type';
import {map} from 'rxjs/operators';

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
    console.log(`⏳ Запрашиваем результат для job_id: ${job_id}`);

    return this.http.get<ResultResponse>(`${environment.apiUrl}/results?job_id=${job_id}`).pipe(
      map((response: ResultResponse) => {
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
        const successResponse = response as SuccessResultResponse;
        console.log('✅ Результат успешно получен:', {
          job_id: successResponse.job_id,
          status: successResponse.status,
          preset: successResponse.preset,
          columns: successResponse.requested_columns.length,
          rows: successResponse.table.rows.length,
          processing_time: successResponse.metadata.processing_time_seconds
        });
        return successResponse;
      })
    );
  }
}
