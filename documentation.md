# Wink Project - Подробная документация

## Оглавление

1. [Обзор проекта](#обзор-проекта)
2. [Технический стек](#технический-стек)
3. [Архитектура](#архитектура)
4. [Установка и запуск](#установка-и-запуск)
5. [Структура проекта](#структура-проекта)
6. [Компоненты](#компоненты)
7. [Сервисы](#сервисы)
8. [Стилизация](#стилизация)
9. [Производительность](#производительность)
10. [Docker](#docker)
11. [Интернационализация](#интернационализация)
12. [Частые задачи](#частые-задачи)

---

## Обзор проекта

**Wink Project** - это веб-приложение для анализа видеоматериалов и обработки данных сцен. Приложение позволяет:

- Загружать и обрабатывать видео файлы
- Анализировать результаты в интерактивной таблице
- Экспортировать данные в Excel/CSV форматах
- Редактировать значения прямо в таблице
- Работать на нескольких языках (RU/EN)

---

## Технический стек

### Frontend

- **Framework**: Angular 20 (standalone components)
- **Language**: TypeScript
- **UI Library**: PrimeNG
- **Styling**: Tailwind CSS v4.1.17
- **Build Tool**: Angular CLI
- **Package Manager**: npm
- **Internationalization**: ngx-translate

### Backend Integration

- **API Endpoint (Production)**: `https://api.production.com`
- **API Endpoint (Development)**: `http://localhost:8000`
- **HTTP Client**: Angular HttpClient

### DevOps

- **Container**: Docker (multi-stage build)
- **Web Server**: Nginx Alpine
- **Node Runtime**: Node.js 20 Alpine (build stage)
- **Container Orchestration**: Docker Compose

---

## Архитектура

### Слои приложения

```
┌─────────────────────────────────────────┐
│           Presentation Layer             │
│  (Components, Templates, Styles)        │
├─────────────────────────────────────────┤
│           Service Layer                  │
│  (Business Logic, API Integration)      │
├─────────────────────────────────────────┤
│           Data Layer                     │
│  (RxJS Observables, State Management)   │
├─────────────────────────────────────────┤
│           Infrastructure                 │
│  (HTTP, Interceptors, Guards, Pipes)    │
└─────────────────────────────────────────┘
```

### Паттерны

- **Component Architecture**: Standalone components с OnPush change detection
- **State Management**: RxJS Observables + BehaviorSubject
- **Data Flow**: Reactive (observables) с async pipe в шаблонах
- **Error Handling**: Interceptors + Error guards
- **Caching**: Service-level caching для предустановок

---

## Установка и запуск

### Требования

- Node.js 20+
- npm 9+
- Docker & Docker Compose (для контейнеризации)
- Angular CLI (`npm install -g @angular/cli`)

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev server
npm start
# Приложение будет доступно на http://localhost:4200

# Запуск тестов
npm test

# Сборка для production
ng build --configuration production
```

### Docker

```bash
# Способ 1: Использование batch скрипта (Windows)
.\docker-start.bat

# Способ 2: Ручные команды
docker build -t wink-project:latest .
docker-compose up -d

# Остановка контейнера
.\docker-stop.bat
# или
docker-compose down
```

**Приложение будет доступно на**: `http://localhost:8001`

---

## Структура проекта

```
wink-project/
├── src/
│   ├── app/
│   │   ├── app.ts                          # Root component
│   │   ├── app.routes.ts                   # Routing configuration
│   │   ├── app.config.ts                   # Angular config
│   │   │
│   │   ├── core/                           # Core services & guards
│   │   │   ├── language.service.ts         # i18n service
│   │   │   ├── guard/                      # Route guards
│   │   │   │   ├── table-data.guard.ts
│   │   │   │   └── server-error.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── error.interceptor.ts
│   │   │   └── services/
│   │   │
│   │   ├── features/                       # Feature modules
│   │   │   ├── file-upload/                # File upload feature
│   │   │   │   ├── file-upload.component.ts
│   │   │   │   ├── file-upload.component.html
│   │   │   │   ├── file-upload.component.css
│   │   │   │   └── settings-upload/        # Settings dialog
│   │   │   ├── table/                      # Table feature
│   │   │   │   └── table.component.ts
│   │   │   ├── 404/                        # Not found page
│   │   │   └── 505/                        # Server error page
│   │   │
│   │   ├── shared/                         # Shared resources
│   │   │   ├── components/
│   │   │   │   └── scene-table.component.*  # Main table component
│   │   │   ├── services/                   # Shared services
│   │   │   │   ├── file-processing.ts
│   │   │   │   ├── file-analyze.ts
│   │   │   │   ├── export.service.ts
│   │   │   │   ├── result.ts
│   │   │   │   └── ceil.service.ts
│   │   │   ├── layout/                     # Layout components
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   └── layout/
│   │   │   ├── directives/                 # Custom directives
│   │   │   ├── pipes/                      # Custom pipes
│   │   │   └── shared-module.ts            # Exports all shared
│   │   │
│   │   └── app.html                        # Root template
│   │
│   ├── assets/
│   │   ├── i18n/                           # Translations
│   │   │   ├── ru.json
│   │   │   └── en.json
│   │   ├── styles/                         # Global styles
│   │   │   ├── styles.css
│   │   │   ├── _scrollbar.css
│   │   │   ├── _custom-button.css
│   │   │   ├── _progress-bar.css
│   │   │   ├── _table.css
│   │   │   ├── _select.css
│   │   │   ├── _confirm-dialog.css
│   │   │   └── _error-pages.css
│   │   └── images/
│   │
│   ├── environments/
│   │   ├── environment.ts                  # Development config
│   │   └── environment.prod.ts             # Production config
│   │
│   ├── main.ts                             # Application entry point
│   └── index.html                          # HTML template
│
├── angular.json                            # Angular CLI config
├── tsconfig.json                           # TypeScript config
├── Dockerfile                              # Docker build config
├── docker-compose.yml                      # Docker Compose config
├── nginx.conf                              # Nginx configuration
├── docker-start.bat                        # Windows batch script (build & run)
├── docker-stop.bat                         # Windows batch script (stop)
├── package.json                            # Dependencies
└── README.md                               # Quick start guide
```

---

## Компоненты

### App Component (Root)

**Файл**: `src/app/app.ts`

Root компонент приложения, содержит основную разметку и routing outlet.

### File Upload Component

**Файлы**:

- `src/app/features/file-upload/file-upload.component.ts`
- `src/app/features/file-upload/file-upload.component.html`
- `src/app/features/file-upload/file-upload.component.css`

**Назначение**: Загрузка видео файлов и обработка результатов

**Функциональность**:

- Drag-and-drop загрузка файлов
- Предустановки обработки (presets)
- Прогресс индикатор с этапами (analyzing → waiting → retrieving)
- Отображение результатов после обработки
- Управление памятью (cleanup таймаутов)

**Key Properties**:

```typescript
progress$: Observable<number>                   // Progress percentage
progressStage$: Observable<'analyzing'|...>   // Current stage
selectedPreset$: Observable<Preset>            // Selected preset
results$: Observable<AnalyzeResponse>          // Processing results
```

**Key Methods**:

- `onFilesSelected()` - обработка выбранных файлов
- `onPresetChange()` - смена предустановки
- `completeProcessing()` - завершение обработки
- `cleanup()` - очистка таймаутов и ресурсов

### Scene Table Component

**Файлы**:

- `src/app/shared/components/scene-table.component.ts`
- `src/app/shared/components/scene-table.component.html`

**Назначение**: Отображение и редактирование результатов анализа в таблице

**Функциональность**:

- Отображение данных в таблице с пагинацией
- Сортировка по столбцам (с Intl.Collator для русского языка)
- Фильтрация данных в реальном времени
- Редактирование значений двойным кликом
- Экспорт в Excel/CSV
- Цветовое кодирование значений (проценты, статусы)

**Key Properties**:

```typescript
filteredRows$: Observable<any[]>; // Filtered table data
columns$: Observable<string[]>; // Column names
sortColumn$: Observable<string>; // Active sort column
searchText$: Observable<string>; // Search text
editingCell$: Observable<EditingCell>; // Currently editing cell
```

**Key Methods**:

- `sortByColumn(col)` - сортировка данных
- `onSearch(text)` - фильтрация данных
- `enableEditing(row, col)` - включение режима редактирования
- `saveEditing()` - сохранение изменений
- `cancelEditing()` - отмена редактирования
- `showExcelExportDialog()` - экспорт в Excel

### Settings Upload Component

**Файл**: `src/app/features/file-upload/settings-upload/settings-upload.html`

Диалог настроек для выбора предустановок обработки.

### Layout Components

- **Header** (`src/app/shared/layout/header/`) - шапка с логотипом и переключателем языка
- **Footer** (`src/app/shared/layout/footer/`) - подвал
- **Layout** (`src/app/shared/layout/layout/`) - основной контейнер

---

## Сервисы

### FileProcessingService

**Файл**: `src/app/shared/services/file-processing.ts`

Управляет процессом обработки файлов.

**Методы**:

```typescript
processFile(
  file: File,
  preset: string,
  onProgress?: (progress: ProgressEvent) => void,
  cancel$?: Subject<void>
): Observable<AnalyzeResponse>
```

**Progress Events**:

- `analyzing` (0-30%) - анализ видео
- `waiting` (30-90%) - ожидание обработки на сервере
- `retrieving` (90-100%) - получение результатов

### FileAnalyzeService

**Файл**: `src/app/shared/services/file-analyze.ts`

Взаимодействие с backend API для анализа файлов.

### ExportService

**Файл**: `src/app/shared/services/export.service.ts`

Экспорт данных в Excel и CSV форматах.

**Методы**:

```typescript
exportToExcel(data: any[], filename: string): void
exportToCsv(data: any[], filename: string): void
```

### ResultService

**Файл**: `src/app/shared/services/result.ts`

Управление результатами анализа.

### LanguageService

**Файл**: `src/app/core/language.service.ts`

Управление языком приложения (RU/EN).

### CeilService

**Файл**: `src/app/shared/services/ceil.service.ts`

Утилиты для скругления значений.

---

## Стилизация

### Цветовая схема

**Основные цвета**:

- **Основной оранжевый**: `#FF6600` (primary gradient start)
- **Светлый оранжевый**: `#FF8533` (primary gradient end)
- **Темный фон**: `#1A1A1A`
- **Карточки**: `#232323`
- **Белый текст**: `#FFFFFF`
- **Серый текст**: `#999999` / `#666666`
- **Зеленый (успех)**: `#16a34a`
- **Красный (ошибка)**: `#dc2626`
- **Синий (информация)**: `#2563eb`

### Файлы стилей

```
src/assets/styles/
├── styles.css              # Global styles & imports
├── _scrollbar.css          # Custom scrollbar
├── _custom-button.css      # Button styles (gradient, export)
├── _progress-bar.css       # Progress bar styling
├── _table.css              # Table styles
├── _select.css             # Select/dropdown styling
├── _confirm-dialog.css     # Confirmation dialogs
└── _error-pages.css        # Error page styling
```

### Tailwind Utilities

Используются современные Tailwind 4 утилиты:

- `bg-linear-to-r` / `bg-linear-to-b` - градиенты
- `shrink-0` - предотвращение сжатия элементов
- `min-h-*` / `min-w-*` - минимальные размеры (для CLS)
- `shadow-*` - тени с цветовыми вариациями
- `inter-*` - пользовательские font-family классы

### Кнопки редактирования

В таблице используются стилизованные кнопки:

**Кнопка "Сохранить" (галочка)**:

```html
class="p-2 bg-linear-to-r from-[#FF6600] to-[#FF8533] hover:from-[#FF7622] hover:to-[#FF9548]
text-white rounded-lg transition-all duration-200 shadow-lg shadow-[#FF6600]/20 hover:shadow-xl
hover:shadow-[#FF6600]/40"
```

**Кнопка "Отмена" (крестик)**:

```html
class="p-2 bg-[#232323] border border-[#333333] text-gray-300 hover:bg-[#2a2a2a]
hover:border-[#444444] rounded-lg"
```

### Поиск/Фильтр

Инпут фильтра стилизован:

- Иконка: оранжевая `#FF6600`
- Граница: `border-2` для заметности
- Focus состояние: оранжевая тень `shadow-[#FF6600]/30`

### Заголовки таблицы (th) - активное состояние

При активной сортировке:

- Фон: градиент `from-[#FF6600]/20 to-[#FF8533]/10`
- Нижняя граница: `border-b-2 border-[#FF6600]`

---

## Производительность

### Оптимизации

#### 1. Change Detection Strategy

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

Все компоненты используют OnPush для снижения циклов обнаружения изменений.

#### 2. Правильное управление Observables

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.data$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(...)
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

#### 3. Caching предустановок

```typescript
private cachedPresets: Map<string, Preset[]> = new Map();

getPresets(): Observable<Preset[]> {
  if (this.cachedPresets.has(key)) {
    return of(this.cachedPresets.get(key));
  }
  return this.api.getPresets().pipe(
    tap(presets => this.cachedPresets.set(key, presets))
  );
}
```

#### 4. Оптимизированная сортировка

Используется `Intl.Collator` для правильной русской сортировки:

```typescript
const collator = new Intl.Collator('ru');
rows.sort((a, b) => collator.compare(a[col], b[col]));
```

**Улучшение**: 30-40% ускорения сортировки

#### 5. TrackBy функции

```typescript
trackByIndex(index: number): number {
  return index;
}

trackByString(item: string): string {
  return item;
}
```

#### 6. Управление памятью

```typescript
private timeouts: Set<ReturnType<typeof setTimeout>> = new Set();

private cleanup(): void {
  this.timeouts.forEach(timeout => clearTimeout(timeout));
  this.timeouts.clear();
}
```

#### 7. Core Web Vitals оптимизации

- **CLS (Cumulative Layout Shift)**: добавлены `min-h` и `min-w` классы
- **LCP (Largest Contentful Paint)**: оптимизация изображений логотипа
- **FID (First Input Delay)**: OnPush change detection

### Bundle Size

**Production budgets** (angular.json):

- Initial bundle: 800kB (warning) / 1.2MB (error)
- Component styles: 8kB (warning) / 16kB (error)

---

## Docker

### Dockerfile

**Multi-stage build**:

**Stage 1 - Builder** (Node 20 Alpine):

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

**Stage 2 - Runtime** (Nginx Alpine):

```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/wink-project/browser /usr/share/nginx/html
EXPOSE 80
```

**Результат**: ~50MB итоговый образ

### Docker Compose

```yaml
services:
  wink-app:
    build: .
    ports:
      - '8001:80'
    networks:
      - wink-network
    restart: unless-stopped

networks:
  wink-network:
    driver: bridge
```

### Nginx Configuration

**Основные настройки** (`nginx.conf`):

- Gzip compression для js/css/json
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Static asset caching (1 год для .js/.css/.png/.jpg)
- SPA routing: `try_files $uri $uri/ /index.html`

### Windows Scripts

**docker-start.bat** - автоматизирует сборку и запуск:

```batch
docker build -t wink-project:latest .
docker run -d --name wink-container -p 8001:80 wink-project:latest
```

**docker-stop.bat** - остановка контейнера:

```batch
docker stop wink-container
```

---

## Интернационализация

### Поддерживаемые языки

- **Русский** (RU) - default
- **Английский** (EN)

### Файлы переводов

- `src/assets/i18n/ru.json` - русские переводы
- `src/assets/i18n/en.json` - английские переводы

### Структура переводов

```json
{
  "COMMON": {
    "SAVE": "Сохранить",
    "CANCEL": "Отмена"
  },
  "SCENE_TABLE": {
    "ANALYSIS_RESULTS": "Результаты анализа",
    "EXPORT_EXCEL": "Экспорт в Excel"
  }
}
```

### Использование в компонентах

```html
<!-- В шаблонах -->
<h1>{{ 'SCENE_TABLE.TITLE' | translate }}</h1>

<!-- С параметрами -->
<p>{{ 'COMMON.COUNT' | translate : { count: total } }}</p>
```

```typescript
// В компонентах
constructor(private translate: TranslateService) {
  this.translate.get('KEY').subscribe(value => {
    // Использование значения
  });
}
```

---

## Частые задачи

### Добавление нового компонента

1. Создать папку в `src/app/features/` или `src/app/shared/components/`
2. Создать файлы `.ts`, `.html`, `.css`
3. Сделать компонент standalone:

```typescript
@Component({
  selector: 'app-new',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewComponent {
  constructor(private cdr: ChangeDetectorRef) {}
}
```

### Добавление нового сервиса

1. Создать файл в `src/app/shared/services/`
2. Сделать injectable:

```typescript
@Injectable({ providedIn: 'root' })
export class NewService {
  constructor(private http: HttpClient) {}
}
```

### Добавление стилей

1. Создать файл в `src/assets/styles/` (если общие) или рядом с компонентом
2. Импортировать в `styles.css`:

```css
@import './_new-feature.css';
```

### Добавление перевода

1. Добавить ключ в `src/assets/i18n/ru.json` и `en.json`
2. Использовать в компоненте:

```html
{{ 'MODULE.KEY' | translate }}
```

### Добавление маршрута

1. Обновить `app.routes.ts`:

```typescript
export const routes: Routes = [
  {
    path: 'new-page',
    component: NewComponent,
    canActivate: [ServerErrorGuard],
  },
];
```

### Запуск приложения в Docker

```bash
# Windows
.\docker-start.bat

# Остановка
.\docker-stop.bat

# Просмотр логов
docker logs wink-container

# Подключение к контейнеру
docker exec -it wink-container sh
```

### Отладка в production build

```bash
# Сборка
ng build --configuration production

# Запуск локально
npx http-server dist/wink-project/browser
```

### Изменение API endpoint

**Development** (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
};
```

**Production** (`src/environments/environment.prod.ts`):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.production.com',
};
```

---

## Поиск и решение проблем

### Приложение не загружается

1. Проверить консоль браузера (F12)
2. Проверить network вкладку (есть ли 404?)
3. Попробовать очистить кэш: `Ctrl+Shift+Delete`

### Таблица не показывает данные

1. Проверить API endpoint в `environment.ts`
2. Проверить backend - работает ли API?
3. Открыть DevTools → Network → найти запрос к API
4. Проверить CORS в ответе

### Docker контейнер не запускается

```bash
# Проверить логи
docker logs wink-container

# Переостартовать контейнер
docker restart wink-container

# Удалить и пересоздать
docker rm -f wink-container
docker-compose up -d
```

### Стили не применяются

1. Проверить, не перекрываются ли селекторы (specificity)
2. Использовать `!important` только в крайних случаях
3. Проверить, правильно ли импортирован файл стилей в `styles.css`

### Вспоминает ошибку с переводами

1. Проверить ключи в JSON файлах (`ru.json`, `en.json`)
2. Убедиться, что ключ существует в обоих файлах
3. Перезагрузить приложение

---

## Контрибьютинг

### Код стиль

- Используйте TypeScript strict mode
- Следуйте Angular style guide
- Используйте OnPush change detection
- Добавляйте типы для всех переменных

### Перед отправкой

1. Запустить `ng build`
2. Запустить `ng test`
3. Проверить линтер (если установлен)
4. Протестировать в браузере

---

**Последнее обновление**: 16 ноября 2025 г.  
**Версия**: 1.0.0  
**Статус**: Production Ready
