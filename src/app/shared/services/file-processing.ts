import { Injectable } from '@angular/core';
import { from, Observable, Subject, throwError, timer } from 'rxjs';
import { catchError, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { PostPreset } from '../../../types/Preset/presetType.type';
import { SuccessResultResponse } from '../../../types/resultResponse.type';
import { FileAnalyze } from './file-analyze';
import { Result } from './result';

export interface FileProcessingProgress {
  stage: 'analyzing' | 'waiting' | 'retrieving' | 'completed';
  progress: number;
  message: string;
  retryCount?: number;
  totalRetries?: number;
  estimatedTime?: number;
}

export interface FileProcessingError {
  status: 'error';
  stage: 'analyzing' | 'retrieving';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileProcessing {
  private readonly MAX_RETRIES = 30;
  private readonly RETRY_DELAY = 2000;
  private readonly TOTAL_TIMEOUT = 5 * 60 * 1000; // 5 минут

  constructor(private fileAnalyze: FileAnalyze, private result: Result) {}

  /**
   * Полный процесс обработки файла
   * 1. Анализирует файл
   * 2. Получает job_id
   * 3. Опрашивает результат до получения завершенного результата
   */
  processFile(
    file: File,
    config: PostPreset,
    onProgress?: (progress: FileProcessingProgress) => void,
    cancel$?: Subject<void>
  ): Observable<SuccessResultResponse> {
    return this.fileAnalyze.analyzeFile(file, config).pipe(
      tap((analyzeResponse) => {
        console.log('✓ Файл успешно отправлен на анализ:', analyzeResponse.job_id);
        onProgress?.({
          stage: 'analyzing',
          progress: 30,
          message: 'Файл отправлен на обработку',
        });
      }),
      switchMap((analyzeResponse) => {
        const job_id = analyzeResponse.job_id;
        onProgress?.({
          stage: 'waiting',
          progress: 40,
          message: 'Инициализация обработки...',
          estimatedTime: Math.round((this.MAX_RETRIES * this.RETRY_DELAY) / 1000),
        });
        return this.pollResult(job_id, onProgress, cancel$);
      }),
      tap((successResponse) => {
        console.log('✓ Обработка файла завершена:', {
          job_id: successResponse.job_id,
          rows: successResponse.table.rows.length,
          processing_time: successResponse.metadata.processing_time_seconds,
        });

        onProgress?.({
          stage: 'completed',
          progress: 100,
          message: 'Обработка завершена',
        });
      }),
      catchError((error) => {
        console.error('✗ Ошибка при обработке файла:', error);

        // Если это отмена пользователем, пробросим её как есть
        if (error && error.isCancelled) {
          return throwError(() => error);
        }

        const processingError: FileProcessingError = {
          status: 'error',
          stage: error.stage || 'analyzing',
          message: error.message || error.detail || 'Неизвестная ошибка',
        };

        return throwError(() => processingError);
      })
    );
  }

  /**
   * Опрашивает результат обработки с логикой повтора
   */
  private pollResult(
    job_id: string,
    onProgress?: (progress: FileProcessingProgress) => void,
    cancel$?: Subject<void>,
    retryCount: number = 0
  ): Observable<SuccessResultResponse> {
    return this.result.getResult(job_id).pipe(
      // Если поступил сигнал отмены, прерываем цепочку
      takeUntil(cancel$ || new Subject<void>()),
      switchMap((response) => {
        // Если это SuccessResultResponse (status === 'completed')
        if ('status' in response && response.status === 'completed') {
          console.log('✓ Результат готов:', response.job_id);
          return from(Promise.resolve(response as SuccessResultResponse));
        }

        // Если это ProcessingResultResponse (status === 'processing')
        if ('status' in response && response.status === 'processing') {
          retryCount++;
          // Логарифмический рост вместо линейного для более реалистичного отображения
          const progress = Math.round(
            40 + (Math.log(retryCount + 1) / Math.log(this.MAX_RETRIES + 1)) * 50
          );

          console.log(`⏳ Обработка... попытка ${retryCount}/${this.MAX_RETRIES}`);

          // Расчет примерного оставшегося времени
          const estimatedRemainingTime = Math.max(
            0,
            Math.round((this.MAX_RETRIES - retryCount) * (this.RETRY_DELAY / 1000))
          );

          onProgress?.({
            stage: 'waiting',
            progress: Math.min(progress, 90),
            message: `Обработка файла... ${estimatedRemainingTime}с`,
            retryCount,
            totalRetries: this.MAX_RETRIES,
            estimatedTime: estimatedRemainingTime,
          });

          if (retryCount >= this.MAX_RETRIES) {
            const error = new Error(
              'Превышено максимальное время ожидания обработки файла (5 минут)'
            );
            (error as any).stage = 'retrieving';
            throw error;
          }

          return timer(this.RETRY_DELAY).pipe(
            switchMap(() => this.pollResult(job_id, onProgress, cancel$, retryCount))
          );
        }

        const error = new Error('Неожиданный статус ответа от сервера');
        (error as any).stage = 'retrieving';
        throw error;
      }),
      catchError((error) => {
        // Если это ошибка от takeUntil (отмена), создаем объект отмены
        if (!error || (error && !error.message && !error.stage)) {
          const cancelError: any = {
            status: 'error',
            stage: 'retrieving',
            message: 'Операция отменена пользователем',
            isCancelled: true,
          };
          return throwError(() => cancelError);
        }

        let errorMessage = 'Неизвестная ошибка';
        let stage: 'analyzing' | 'retrieving' = 'retrieving';

        if (error.stage) {
          stage = error.stage;
          errorMessage = error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error.error) {
          if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        const processingError: FileProcessingError = {
          status: 'error',
          stage: stage,
          message: errorMessage,
        };

        console.error('Ошибка при опрашивании результата:', processingError);
        return throwError(() => processingError);
      }),
      take(1)
    );
  }
}
