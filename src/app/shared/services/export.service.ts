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
  private baseUrl: string = (environment as any)?.apiUrl || (environment as any)?.apiBase || '';

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

  /**
   * Экспортирует данные в формате CSV или XLSX
   * @param jobId - ID задачи
   * @param format - Формат экспорта ('csv' или 'xlsx')
   */
  exportData(jobId: string, format: 'csv' | 'xlsx'): Observable<Blob> {
    const url = this.baseUrl ? `${this.baseUrl.replace(/\/+$/, '')}/export` : `/export`;

    const params = {
      job_id: jobId,
      format: format,
    };

    console.log('📤 [ExportService] Отправка GET запроса на экспорт');
    console.log('🔗 [ExportService] URL:', url);
    console.log('⚙️ [ExportService] Параметры:', params);

    // Запрашиваем ответ как arraybuffer и наблюдаем за response целиком
    return (
      this.http.get(url, {
        params,
        responseType: 'arraybuffer',
        observe: 'response',
      } as any) as unknown as Observable<HttpResponse<ArrayBuffer>>
    ).pipe(
      map((response: HttpResponse<ArrayBuffer>) => {
        console.log('📋 [ExportService] Статус ответа:', response.status);
        console.log('📝 [ExportService] Content-Type:', response.headers.get('content-type'));
        console.log(
          '📎 [ExportService] Content-Disposition:',
          response.headers.get('content-disposition')
        );

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

        console.log('✅ [ExportService] Файл получен успешно');
        console.log('📦 [ExportService] Размер:', blob.size, 'байт');
        console.log('📝 [ExportService] Type:', blob.type);

        return blob;
      }),
      catchError((err: any) => {
        console.error('❌ [ExportService] HTTP ошибка при экспорте');
        console.error('📋 [ExportService] Статус:', err?.status);
        console.error('📝 [ExportService] StatusText:', err?.statusText);
        console.error('📋 [ExportService] Message:', err?.message);

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

        console.error('❌ [ExportService] Финальная ошибка:', msg);
        return throwError(() => ({ status: 'error', message: msg }));
      })
    );
  }

  /**
   * Загружает файл экспорта
   * @param jobId - ID задачи
   * @param format - Формат экспорта ('csv' или 'xlsx')
   * @returns Observable для отслеживания статуса
   */
  downloadExport(jobId: string, format: 'csv' | 'xlsx'): Observable<void> {
    console.log('🚀 [ExportService] Инициирование загрузки файла:', { jobId, format });

    return this.exportData(jobId, format).pipe(
      // Проверяем на HTML ошибки перед сохранением
      map((blob) => {
        console.log('🔍 [ExportService] Проверка содержимого blob...');
        return blob;
      }),
      map((blob: Blob) => {
        console.log('✅ [ExportService] Blob готов к скачиванию');
        console.log('📦 [ExportService] Размер Blob:', blob.size, 'байт');
        console.log('📝 [ExportService] Type Blob:', blob.type);

        // Дополнительная проверка: если размер слишком мал для XLSX, это может быть ошибка
        if (format === 'xlsx' && blob.size < 100) {
          console.warn(
            '⚠️ [ExportService] ВНИМАНИЕ: XLSX файл слишком маленький, может быть ошибка'
          );
        }

        // Генерируем имя файла с временной меткой
        const timestamp = new Date().toISOString().replace(/[:.]/g, '');
        const filename = `export_${jobId.substring(0, 8)}_${timestamp}.${format}`;

        console.log('📥 [ExportService] Инициирование скачивания файла:', filename);

        // ВАЖНО: saveAs должен быть вызван синхронно в обработчике map
        try {
          saveAs(blob, filename);
          console.log('✅ [ExportService] Файл успешно инициирован для скачивания:', filename);
        } catch (err) {
          console.error('❌ [ExportService] Ошибка при вызове saveAs:', err);
          throw new Error(`Ошибка при сохранении файла: ${err}`);
        }

        return void 0;
      }),
      catchError((err: any) => {
        console.error('❌ [ExportService] Ошибка при получении файла:', err);
        return throwError(() => err);
      }),
      finalize(() => {
        console.log('📤 [ExportService] Запрос завершен');
      })
    );
  }
}
