import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PostPreset} from '../../../types/Preset/presetType.type';
import {AnalyzeReponseType, AnalyzeSuccessResponse} from '../../../types/analyzeReponse.type';
import {Observable, of, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {catchError, switchMap} from 'rxjs/operators';

export interface AnalyzeError {
  status: 'error';
  detail: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileAnalyze {
  constructor(private http: HttpClient) {}

  analyzeFile(file: File, config: PostPreset): Observable<AnalyzeSuccessResponse> {
    // Создаем FormData для multipart/form-data
    const formData = new FormData();
    formData.append('file', file);
    // config должен быть отправлен как JSON строка
    formData.append('config', JSON.stringify(config));

    
    
    

    return this.http.post<AnalyzeReponseType>(
      `${environment.apiUrl}/analyze`,
      formData
      // HttpClient автоматически установит правильные headers для FormData
    ).pipe(
      switchMap((response: AnalyzeReponseType) => {
        const successResponse = response as AnalyzeSuccessResponse;
        console.log('✅ Файл успешно отправлен на анализ:', {
          job_id: successResponse.job_id,
          status: successResponse.status,
          preset: successResponse.preset,
          expected_columns: successResponse.expected_columns,
          message: successResponse.message
        });
        return of(successResponse);
      }),
      catchError((error) => {
        let errorMessage = 'Неизвестная ошибка при анализе файла';

        
        
        

        // Проверяем различные типы ошибок
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error.error && Array.isArray(error.error)) {
          // Если ошибка это массив (validation errors)
          
          errorMessage = error.error.map((e: any) => {
            return e.msg || e.message || e.detail || JSON.stringify(e);
          }).join('; ');
        } else if (error.error && typeof error.error === 'object') {
          
          if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = JSON.stringify(error.error);
          }
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        

        const analyzeError: AnalyzeError = {
          status: 'error',
          detail: errorMessage
        };

        return throwError(() => analyzeError);
      })
    );
  }
}
