import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ErrorConfig {
  status: number | number[];
  severity: 'error' | 'warn';
  summary: string;
  detail: (error: HttpErrorResponse) => string;
  navigateTo?: string;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly errorConfigs: ErrorConfig[] = [
    {
      status: 404,
      severity: 'error',
      summary: 'Ошибка 404',
      detail: () => 'Ресурс не найден',
    },
    {
      status: [500, 505],
      severity: 'error',
      summary: 'Ошибка сервера',
      detail: (error) => `Ошибка ${error.status}: ${error.statusText || 'Internal Server Error'}`,
      navigateTo: '/error/505',
    },
    {
      status: 0,
      severity: 'error',
      summary: 'Ошибка соединения',
      detail: () => 'Проверьте ваше интернет-соединение',
    },
    {
      status: [401, 403],
      severity: 'warn',
      summary: 'Доступ запрещён',
      detail: () => 'У вас нет прав доступа к этому ресурсу',
    },
  ];

  constructor(private router: Router, private messageService: MessageService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const config = this.findErrorConfig(error.status);

        if (config) {
          this.messageService.add({
            severity: config.severity,
            summary: config.summary,
            detail: config.detail(error),
            life: config.severity === 'error' ? 4000 : 3000,
          });

          if (config.navigateTo) {
            this.router.navigate([config.navigateTo]);
          }
        }

        return throwError(() => error);
      })
    );
  }

  private findErrorConfig(status: number): ErrorConfig | undefined {
    return this.errorConfigs.find((config) =>
      Array.isArray(config.status) ? config.status.includes(status) : config.status === status
    );
  }
}
