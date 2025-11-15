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

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private messageService: MessageService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);

        // Обработка ошибок 404
        if (error.status === 404) {
          console.warn('404 Not Found');
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка 404',
            detail: 'Ресурс не найден',
            life: 3000,
          });
        }

        // Обработка ошибок 500 и 505
        if (error.status === 500 || error.status === 505) {
          console.error('Server Error:', error.status);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка сервера',
            detail: `Ошибка ${error.status}: ${error.statusText || 'Internal Server Error'}`,
            life: 4000,
          });
          // Перенаправляем на страницу ошибки сервера
          setTimeout(() => {
            this.router.navigate(['/error/500']);
          }, 1000);
        }

        // Обработка ошибок сети (0 статус)
        if (error.status === 0) {
          console.error('Network Error or CORS issue');
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка соединения',
            detail: 'Проверьте ваше интернет-соединение',
            life: 3000,
          });
        }

        // Обработка ошибок 401, 403
        if (error.status === 401 || error.status === 403) {
          console.warn('Unauthorized or Forbidden');
          this.messageService.add({
            severity: 'warn',
            summary: 'Доступ запрещён',
            detail: 'У вас нет прав доступа к этому ресурсу',
            life: 3000,
          });
        }

        return throwError(() => error);
      })
    );
  }
}
