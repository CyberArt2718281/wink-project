import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withPreloading, PreloadAllModules, withInMemoryScrolling } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    provideAnimationsAsync(),
    provideAnimations(),
    // HttpClient с поддержкой интерсепторов
    provideHttpClient(),
    // Регистрируем интерсептор для обработки ошибок
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'ru',
      lang: 'ru',
    }),
  ],
};
