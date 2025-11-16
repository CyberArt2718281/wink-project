import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CeilRequest {
  job_id: string;
  row: number;
  column: string;
  value: string;
}

export interface UpdatedCell {
  row: number;
  column: string;
  value: string;
}

export interface CeilSuccessResponse {
  status: 'success';
  updated_cell: UpdatedCell;
  error: null;
}

export interface CeilErrorResponse {
  detail: string;
}

@Injectable({ providedIn: 'root' })
export class CeilService {
  private readonly baseUrl: string = environment.apiUrl || '';

  constructor(private http: HttpClient) {}

  // Отправляет PATCH запрос на /cell с полными данными в теле
  updateCell(payload: CeilRequest): Observable<UpdatedCell> {
    const url = this.baseUrl ? `${this.baseUrl.replace(/\/+$/, '')}/cell` : `/cell`;


    return this.http.patch<CeilSuccessResponse | CeilErrorResponse>(url, payload).pipe(
      map((res: any) => {
        // Если сервер вернул объект с полем updated_cell и статус success — возвращаем updated_cell
        if (res && res.status === 'success' && res.updated_cell) {
          return res.updated_cell as UpdatedCell;
        }

        // Если сервер вернул { detail: string } — бросаем ошибку с деталью
        if (res && typeof res.detail === 'string') {
          throw new Error(res.detail);
        }

        // Иначе — неизвестный формат
        throw new Error('Unexpected response from ceil API');
      }),
      catchError((err: HttpErrorResponse | Error) => {
        // Нормализуем ошибку в человекочитаемое сообщение
        let msg = 'Unknown error';

        if (err instanceof HttpErrorResponse) {
          try {
            const body = err.error;
            if (body) {
              if (typeof body === 'string') {
                msg = body;
              } else if (body.detail) {
                msg = body.detail;
              } else if (body.error) {
                msg = body.error;
              } else if (body.message) {
                msg = body.message;
              } else {
                msg = `HTTP ${err.status} ${err.statusText}`;
              }
            } else {
              msg = `HTTP ${err.status} ${err.statusText}`;
            }
          } catch (e) {
            msg = `HTTP ${err.status} ${err.statusText}`;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }

        return throwError(() => ({ status: 'error', message: msg }));
      })
    );
  }
}
