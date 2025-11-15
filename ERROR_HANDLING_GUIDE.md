# Система обработки ошибок 404/505

## 📋 Обзор

Реализована полная система обработки ошибок в приложении с автоматическим перенаправлением на красиво оформленные страницы ошибок.

## 🏗️ Архитектура

### 1. **Маршруты (app.routes.ts)**

```typescript
{
  path: 'error/404',
  component: NotFoundComponent
},
{
  path: 'error/500',
  component: InternalServerErrorComponent
},
{
  path: '**',
  component: NotFoundComponent  // Ловушка для всех неизвестных маршрутов
}
```

### 2. **HTTP Перехватчик (error.interceptor.ts)**

Автоматически обрабатывает:

- ✅ HTTP 404 - Ресурс не найден
- ✅ HTTP 500/505 - Ошибки сервера
- ✅ HTTP 401/403 - Проблемы с доступом
- ✅ HTTP 0 - Ошибки соединения (CORS, сеть)

### 3. **Guard для таблицы (table-data.guard.ts)**

Проверяет:

- Наличие данных в localStorage
- Валидность job_id
- Статус обработки результата

При ошибке перенаправляет:

- 404 → `/error/404`
- 500/505 → `/error/500`

### 4. **Компоненты ошибок**

#### 404 Not Found Component

```
src/app/features/404/
├── not-found.component.ts
├── not-found.component.html
└── not-found.component.css
```

**Функции:**

- Go Home - Перейти на главную
- Go Back - Вернуться назад
- Ссылки на Upload и Table страницы

#### 505 Internal Server Error Component

```
src/app/features/505/
├── internal-server-error.component.ts
├── internal-server-error.component.html
└── internal-server-error.component.css
```

**Функции:**

- Reload Page - Перезагрузить страницу
- Go Home - Перейти на главную
- Contact Support - Связаться с поддержкой
- Auto-reload timer

## 🔄 Процесс обработки ошибок

### Сценарий 1: Несуществующий маршрут

```
User navigates to /unknown
  ↓
Wildcard route catches it
  ↓
Redirect to NotFoundComponent (/error/404)
  ↓
Display 404 page
```

### Сценарий 2: HTTP 404 Error

```
API request fails with 404
  ↓
ErrorInterceptor catches error
  ↓
Shows toast notification
  ↓
If critical - redirects to /error/404
```

### Сценарий 3: HTTP 500/505 Error

```
API request fails with 500/505
  ↓
ErrorInterceptor catches error
  ↓
Shows error notification
  ↓
Auto-redirect to /error/500 after 1s
```

### Сценарий 4: Table Guard Failure

```
User tries to access /table without data
  ↓
TableDataGuard checks localStorage
  ↓
No data found
  ↓
Redirect to /error/404
```

## 📦 Интеграция

### app.config.ts

```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true
}
```

### app.routes.ts

```typescript
import { NotFoundComponent } from './features/404/not-found.component';
import { InternalServerErrorComponent } from './features/505/internal-server-error.component';
```

### Guard на маршруте table

```typescript
{
  path: 'table',
  canActivate: [TableDataGuard],
  loadComponent: () => import('./features/table/table.component').then(m => m.TableComponent)
}
```

## 🎨 Дизайн страниц

### 404 Page

- Анимированное число "404"
- Орбитальные элементы фона
- 3 кнопки действия
- Детали ошибки с иконками
- Ссылки на помощь

### 505 Page

- Анимированное число "505" с эффектом глитча
- Красные/оранжевые тона
- Анимация сервера (LED индикаторы)
- 3 кнопки действия
- Сообщение для пользователя
- Таймер автоматического обновления

## 🌐 i18n Поддержка

Все строки переведены:

- **ru.json**: Русские переводы
- **en.json**: Английские переводы

Ключи:

- `ERROR_404.TITLE`
- `ERROR_404.DESCRIPTION`
- `ERROR_505.TITLE`
- `ERROR_505.DESCRIPTION`
- И другие...

## 📱 Отзывчивость

Обе страницы полностью адаптивны:

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🚀 Использование

### Программное перенаправление на 404

```typescript
this.router.navigate(['/error/404']);
```

### Программное перенаправление на 505

```typescript
this.router.navigate(['/error/500']);
```

### Автоматическое (через interceptor)

Просто пусть произойдет ошибка на API - interceptor все обработает.

## ⚙️ Конфигурация

### Изменение таймера авто-обновления (505)

В `internal-server-error.component.ts`:

```typescript
// Измените значение в constructor/ngOnInit
setTimeout(() => window.location.reload(), 10000); // 10 секунд
```

### Кастомизация сообщений об ошибках

Отредактируйте `ERROR_404` и `ERROR_505` в JSON файлах:

```json
{
  "ERROR_404": {
    "TITLE": "Страница не найдена",
    ...
  }
}
```

## 🐛 Отладка

### Логирование в console

ErrorInterceptor логирует все ошибки:

```
console.error('HTTP Error:', error);
```

### Проверка перенаправления

Откройте DevTools → Network/Console и повторите действие.

## ✅ Тестирование

### Тест 404

1. Перейдите на `/non-existent-route`
2. Должна отобразиться страница 404

### Тест guard

1. Очистите localStorage: `localStorage.clear()`
2. Попытайтесь перейти на `/table`
3. Должна отобразиться страница 404

### Тест API error

1. Выключите backend или интернет
2. Попытайтесь выполнить действие, требующее API
3. Должна отобразиться страница 500 или уведомление об ошибке
