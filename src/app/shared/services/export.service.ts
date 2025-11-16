import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver-es';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ExportErrorResponse {
  detail: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private readonly baseUrl: string = environment.apiUrl || '';

  constructor(private http: HttpClient) {}

  /**
   * Проверка, является ли содержимое HTML ошибкой
   */
  private isHtmlError(blob: Blob): Observable<boolean> {
    return new Observable((observer) => {
      if (blob.type.includes('text/html') || blob.type.includes('application/json')) {
        observer.next(true);
        observer.complete();
        return;
      }

      if (blob.size > 0) {
        // Читаем первые килобайты для проверки
        const slice = blob.slice(0, 1024);
        const reader = new FileReader();

        reader.onload = () => {
          const text = reader.result as string;
          const isHtml =
            text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('<?xml');
          observer.next(isHtml);
          observer.complete();
        };

        reader.onerror = () => {
          observer.next(false);
          observer.complete();
        };

        reader.readAsText(slice);
      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }


  exportData(jobId: string, format: 'csv' | 'xlsx'): Observable<Blob> {
    const url = this.baseUrl ? `${this.baseUrl.replace(/\/+$/, '')}/export` : `/export`;

    const params = {
      job_id: jobId,
      format: format,
    };


    // Запрашиваем ответ как arraybuffer и наблюдаем за response целиком
    return (
      this.http.get(url, {
        params,
        responseType: 'arraybuffer',
        observe: 'response',
      } as any) as unknown as Observable<HttpResponse<ArrayBuffer>>
    ).pipe(
      map((response: HttpResponse<ArrayBuffer>) => {

        const contentType = response.headers.get('content-type') || '';
        const arrayBuffer = response.body;

        // Проверяем Content-Type
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
          console.error('❌ [ExportService] ОШИБКА: Неожиданный Content-Type:', contentType);

          // Пытаемся прочитать ошибку из тела ответа
          try {
            if (arrayBuffer) {
              const decoder = new TextDecoder();
              const text = decoder.decode(arrayBuffer);
              console.error('📋 [ExportService] Содержимое ответа:', text);

              if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                throw new Error(
                  'Сервер вернул HTML ошибку вместо файла. Проверьте консоль сервера.'
                );
              } else if (contentType.includes('application/json')) {
                const errorObj = JSON.parse(text);
                throw new Error(errorObj.detail || 'Ошибка на сервере при экспорте');
              }
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON.parse')) {
              throw e;
            }
            throw new Error(`Сервер вернул ${contentType} вместо файла`);
          }
        }

        // Проверяем размер данных
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          console.error('❌ [ExportService] ОШИБКА: Получены пустые данные');
          throw new Error('Сервер вернул пустой файл');
        }

        // Преобразуем ArrayBuffer в Blob с правильным типом
        let mimeType = 'application/octet-stream';
        if (format === 'csv') {
          mimeType = 'text/csv; charset=utf-8';
        } else if (format === 'xlsx') {
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }

        // Если сервер прислал Content-Type, используем его (но только если не HTML)
        if (contentType && !contentType.includes('text/html')) {
          mimeType = contentType.split(';')[0].trim();
        }

        const blob = new Blob([arrayBuffer], { type: mimeType });

        return blob;
      }),
      catchError((err: any) => {


        let msg = 'Неизвестная ошибка при экспорте';

        if (err instanceof HttpErrorResponse) {
          if (err.status === 0) {
            msg = 'Ошибка соединения. Проверьте подключение к серверу.';
          } else if (err.status === 404) {
            msg = 'Задача экспорта не найдена на сервере';
          } else if (err.status === 500) {
            msg = 'Ошибка сервера при экспорте';
          } else {
            msg = `HTTP ${err.status} ${err.statusText}`;
          }
        } else if (err && err.message) {
          msg = err.message;
        }
        return throwError(() => ({ status: 'error', message: msg }));
      })
    );
  }


  downloadExport(jobId: string, format: 'csv' | 'xlsx'): Observable<void> {

    return this.exportData(jobId, format).pipe(
      // Проверяем на HTML ошибки перед сохранением
      map((blob) => {
        return blob;
      }),
      map((blob: Blob) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '');
        const filename = `export_${jobId.substring(0, 8)}_${timestamp}.${format}`;


        try {
          saveAs(blob, filename);
        } catch (err) {
          throw new Error(`Ошибка при сохранении файла: ${err}`);
        }

        return void 0;
      }),
      catchError((err: any) => {
        return throwError(() => err);
      }),
    );
  }
}
