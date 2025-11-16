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

    return this.http.get<ResultResponse>(`${environment.apiUrl}/results?job_id=${job_id}`).pipe(
      map((response: ResultResponse) => {
        // Обработка обработки (processing)
        if ('status' in response && response.status === 'processing') {
          const processingResponse = response as ProcessingResultResponse;
       
          return processingResponse;
        }

        // Успешный результат (completed)
        const successResponse = response as SuccessResultResponse;
    
        return successResponse;
      })
    );
  }
}
