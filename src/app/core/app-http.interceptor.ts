import {Injectable} from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';

let lastHealthCheck = 0;
let lastHealthStatus = true;
const HEALTH_CHECK_INTERVAL = 5000; // 5 секунд

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  constructor(private router: Router, private httpClient: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Проверяем только запросы к API
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    // Не проверяем /health саму себя и другие системные эндпоинты
    if (req.url.includes('/health')) {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error);
        })
      );
    }

    const now = Date.now();
    // Если прошло меньше 5 секунд с последней проверки, используем кешированный статус
    if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
      if (!lastHealthStatus) {
        this.router.navigate(['/505']);
        return throwError(() => new HttpErrorResponse({
          status: 503,
          statusText: 'Server Unavailable',
          url: req.url
        }));
      }
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error);
        })
      );
    }

    // Проверяем /health
    return this.checkHealthWithoutInterceptor().pipe(
      switchMap((isHealthy) => {
        lastHealthCheck = Date.now();
        lastHealthStatus = isHealthy;
        if (!isHealthy) {
          this.router.navigate(['/505']);
          return throwError(() => new HttpErrorResponse({
            status: 503,
            statusText: 'Server Unavailable',
            url: req.url
          }));
        }
        return next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => {
            return this.handleError(error);
          })
        );
      }),
      catchError((err) => {
        this.router.navigate(['/505']);
        return throwError(() => new HttpErrorResponse({
          status: 503,
          statusText: 'Server Unavailable',
          url: req.url
        }));
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Обработка ошибки 404
    if (error.status === 404) {
      console.error('404 Not Found:', error.url);
      this.router.navigate(['/404']);
      return throwError(() => error);
    }

    // Обработка ошибки 503 (Server Unavailable)
    if (error.status === 503) {
      console.error('503 Service Unavailable:', error.url);
      this.router.navigate(['/505']);
      return throwError(() => error);
    }

    // Другие ошибки просто пробрасываем дальше
    return throwError(() => error);
  }

  private checkHealthWithoutInterceptor(): Observable<boolean> {
    // Используем native fetch для избежания рекурсии интерсептора
    return new Observable<boolean>((observer) => {
      const healthUrl = `${environment.apiUrl}/health`;

      fetch(healthUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json'
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          observer.next(data?.status === 'healthy');
          observer.complete();
        })
        .catch((error) => {
          console.error('Health check error:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }
}
