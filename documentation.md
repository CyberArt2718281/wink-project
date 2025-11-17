# 📚 Wink Project - Полная документация

## 📋 Содержание

1. [Обзор проекта](#-обзор-проекта)
2. [Технологический стек](#-технологический-стек)
3. [Архитектура приложения](#-архитектура-приложения)
4. [Структура проекта](#-структура-проекта)
5. [Компоненты](#-компоненты)
6. [Сервисы](#-сервисы)
7. [Роутинг и Guards](#-роутинг-и-guards)
8. [Стилизация и темы](#-стилизация-и-темы)
9. [Оптимизация производительности](#-оптимизация-производительности)
10. [Интернационализация](#-интернационализация)
11. [Установка и запуск](#-установка-и-запуск)
12. [Docker](#-docker)

---

## 🎯 Обзор проекта

**Wink Project** - современное Single Page Application (SPA) на Angular 20 для анализа и обработки данных из Excel файлов с информацией о съемочных сценах.

### Основные возможности:

- ✅ **Загрузка файлов**: Drag & Drop загрузка Excel файлов (.xlsx)
- ✅ **Валидация**: Проверка структуры и данных файла
- ✅ **Интерактивная таблица**: Просмотр, редактирование, сортировка, поиск
- ✅ **CRUD операции**: Создание, чтение, обновление, удаление записей
- ✅ **Экспорт данных**: Выгрузка в Excel/CSV форматах
- ✅ **Пресеты**: Базовый, расширенный и полный набор колонок
- ✅ **Многоязычность**: Русский и английский интерфейс
- ✅ **Адаптивный дизайн**: Поддержка экранов от 320px
- ✅ **Производительность**: CLS < 0.1, оптимизированная загрузка
- ✅ **Docker**: Готовая контейнеризация для деплоя

---

## 🛠 Технологический стек

### Frontend

| Технология        | Версия | Назначение                  |
| ----------------- | ------ | --------------------------- |
| **Angular**       | 20.3.0 | Core фреймворк              |
| **TypeScript**    | 5.7+   | Язык программирования       |
| **PrimeNG**       | 20.3.0 | UI компоненты               |
| **Tailwind CSS**  | 4.1.17 | Утилитарные стили           |
| **RxJS**          | 7.8.0  | Реактивное программирование |
| **ngx-translate** | 17.0.0 | Интернационализация         |
| **XLSX**          | 0.18.5 | Работа с Excel              |

### DevOps

| Технология     | Назначение              |
| -------------- | ----------------------- |
| **Docker**     | Контейнеризация         |
| **Nginx**      | Web сервер (production) |
| **Node.js 20** | Build environment       |

---

## 🏗 Архитектура приложения

### Архитектурные паттерны

```
┌──────────────────────────────────────────┐
│         Presentation Layer               │
│   (Components, Templates, Directives)    │
├──────────────────────────────────────────┤
│          Business Logic Layer            │
│        (Services, State Management)      │
├──────────────────────────────────────────┤
│           Data Access Layer              │
│    (HTTP, API, LocalStorage, Cache)      │
├──────────────────────────────────────────┤
│         Infrastructure Layer             │
│  (Interceptors, Guards, Error Handling)  │
└──────────────────────────────────────────┘
```

### Ключевые принципы:

1. **Standalone Components** - все компоненты автономные (без NgModule)
2. **OnPush Change Detection** - оптимизация рендеринга
3. **Reactive Programming** - RxJS observables + async pipe
4. **Smart/Dumb Components** - разделение логики и презентации
5. **Service-based State** - BehaviorSubject для состояния
6. **Lazy Loading** - ленивая загрузка маршрутов
7. **PreloadAllModules** - предзагрузка после initial load

---

## 📁 Структура проекта

```
wink-project/
├── src/
│   ├── app/
│   │   ├── core/                          # Базовые сервисы и утилиты
│   │   │   ├── guard/
│   │   │   │   └── table-data.guard.ts    # Guard для защиты маршрута /table
│   │   │   ├── interceptors/
│   │   │   │   └── error.interceptor.ts   # HTTP error handling
│   │   │   └── language.service.ts        # Сервис переключения языка
│   │   │
│   │   ├── features/                      # Функциональные модули
│   │   │   ├── 404/                       # Страница 404
│   │   │   │   ├── not-found.component.ts
│   │   │   │   ├── not-found.component.html
│   │   │   │   └── not-found.component.css
│   │   │   │
│   │   │   ├── 505/                       # Страница 500
│   │   │   │   ├── internal-server-error.component.ts
│   │   │   │   ├── internal-server-error.component.html
│   │   │   │   └── internal-server-error.component.css
│   │   │   │
│   │   │   ├── file-upload/               # Модуль загрузки файлов
│   │   │   │   ├── file-upload.component.ts
│   │   │   │   ├── file-upload.component.html
│   │   │   │   ├── file-upload.component.css
│   │   │   │   └── settings-upload/       # Настройки экспорта
│   │   │   │       ├── settings-upload.ts
│   │   │   │       └── settings-upload.html
│   │   │   │
│   │   │   └── table/                     # Модуль таблицы данных
│   │   │       ├── scene-table.component.ts
│   │   │       ├── scene-table.component.html
│   │   │       └── scene-table.component.css
│   │   │
│   │   ├── shared/                        # Общие компоненты
│   │   │   ├── layout/                    # Layout компоненты
│   │   │   │   ├── header/                # Шапка сайта
│   │   │   │   │   ├── header.ts
│   │   │   │   │   ├── header.html
│   │   │   │   │   └── header.css
│   │   │   │   │
│   │   │   │   ├── footer/                # Подвал сайта
│   │   │   │   │   └── footer.html
│   │   │   │   │
│   │   │   │   └── layout/                # Основной layout
│   │   │   │       ├── layout.ts
│   │   │   │       └── layout.html
│   │   │   │
│   │   │   ├── services/                  # Общие сервисы
│   │   │   │   ├── ceil.service.ts        # API работа с ячейками
│   │   │   │   ├── export.service.ts      # Экспорт данных
│   │   │   │   ├── file-analyze.ts        # Анализ файлов
│   │   │   │   ├── file-processing.ts     # Обработка файлов
│   │   │   │   └── result.ts              # Обработка результатов
│   │   │   │
│   │   │   └── shared-module.ts           # Shared module (deprecated)
│   │   │
│   │   ├── app.config.ts                  # Конфигурация приложения
│   │   ├── app.routes.ts                  # Маршруты приложения
│   │   ├── app.ts                         # Root компонент
│   │   └── app.html                       # Root template
│   │
│   ├── assets/                            # Статические ресурсы
│   │   ├── fonts/                         # Шрифты (Inter)
│   │   ├── i18n/                          # Переводы
│   │   │   ├── en.json                    # Английский
│   │   │   └── ru.json                    # Русский
│   │   ├── images/                        # Изображения
│   │   │   ├── logo.svg
│   │   │   ├── logo.webp
│   │   │   └── logo.avif
│   │   └── styles/                        # Глобальные стили
│   │       ├── styles.css                 # Основной файл стилей
│   │       ├── _fonts.css                 # Шрифты
│   │       ├── _scrollbar.css             # Кастомный scrollbar
│   │       ├── _table.css                 # Стили таблиц
│   │       ├── _select.css                # Стили select
│   │       ├── _custom-button.css         # Стили кнопок
│   │       ├── _progress-bar.css          # Progress bar
│   │       ├── _error-pages.css           # Страницы ошибок
│   │       └── _confirm-dialog.css        # Диалоги подтверждения
│   │
│   ├── environments/                      # Конфигурация окружений
│   ├── types/                             # TypeScript типы
│   ├── index.html                         # Главный HTML файл
│   └── main.ts                            # Entry point
│
├── angular.json                           # Angular CLI config
├── docker-compose.yml                     # Docker Compose config
├── Dockerfile                             # Docker build instructions
├── package.json                           # NPM dependencies
└── tsconfig.json                          # TypeScript config
```

---

## 🧩 Компоненты

### 1. Layout Component (`shared/layout/layout/layout.ts`)

**Назначение**: Основной layout с header/footer

**Особенности**:

- Условный рендеринг для предотвращения FOUC
- Минимальная высота для предотвращения CLS
- Черный фон по умолчанию

```typescript
export class Layout implements OnInit {
  isLoading = true;

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 0);
  }
}
```

### 2. Header Component (`shared/layout/header/header.ts`)

**Назначение**: Навигационная шапка

**Функционал**:

- Логотип с lazy loading
- Языковой селектор (Desktop + Mobile)
- Burger menu для мобильных
- Sticky позиционирование

**Оптимизации**:

- `loading="eager"` для логотипа
- Фиксированные размеры иконок (`w-5 h-5 inline-flex`)
- `min-h-[72px]` для предотвращения CLS

### 3. FileUploadComponent (`features/file-upload/file-upload.component.ts`)

**Назначение**: Загрузка и обработка Excel файлов

**Функционал**:

- Drag & Drop upload
- Валидация файлов
- Обработка с прогресс-баром
- Диалог подтверждения отмены

**Методы**:

- `onFileDropped(files: FileList)` - обработка drop
- `processData()` - запуск обработки
- `cancel()` - отмена обработки
- `showCancelConfirmation()` - показ диалога

### 4. SceneTableComponent (`features/table/scene-table.component.ts`)

**Назначение**: Интерактивная таблица данных

**Функционал**:

- 🔍 Поиск с debounce 300ms
- 🔀 Сортировка с Intl.Collator
- 📄 Пагинация (5/10/25/50/100)
- ✏️ Inline редактирование
- 📊 Экспорт в Excel/CSV
- 🗑️ Удаление с подтверждением

**Состояние (BehaviorSubject)**:

```typescript
private state$ = new BehaviorSubject<TableState>({
  data: [],
  filteredData: [],
  paginatedData: [],
  columns: [],
  first: 0,
  rows: 10,
  totalRecords: 0
});
```

---

## 🔧 Сервисы

### 1. CeilService (`shared/services/ceil.service.ts`)

**Назначение**: API взаимодействие для операций с ячейками

```typescript
updateCeil(request: CeilRequest): Observable<SuccessResultResponse>
deleteCeil(id: string): Observable<SuccessResultResponse>
```

### 2. ExportService (`shared/services/export.service.ts`)

**Назначение**: Экспорт данных

```typescript
exportToExcel(data: any[], fileName: string): void
exportToCSV(data: any[], fileName: string): void
```

### 3. FileProcessingService (`shared/services/file-processing.ts`)

**Назначение**: Обработка файлов с backend

```typescript
processFile(file: File): Observable<ProcessingResult>
cancelProcessing(): void
```

### 4. LanguageService (`core/language.service.ts`)

**Назначение**: Управление языком интерфейса

```typescript
setLanguage(lang: string): void
getCurrentLanguage(): string
```

---

## 🛣 Роутинг и Guards

### Конфигурация маршрутов

```typescript
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: FileUploadComponent },
      {
        path: 'table',
        canActivate: [TableDataGuard],
        loadComponent: () => import('./features/table/scene-table.component'),
      },
    ],
  },
  { path: 'error/404', loadComponent: () => import('./features/404/not-found.component') },
  {
    path: 'error/500',
    loadComponent: () => import('./features/505/internal-server-error.component'),
  },
  { path: '**', redirectTo: 'error/404' },
];
```

### TableDataGuard

**Назначение**: Защита маршрута `/table` от прямого доступа без данных

### Стратегии

```typescript
provideRouter(
  routes,
  withPreloading(PreloadAllModules),
  withInMemoryScrolling({
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled',
  })
);
```

---

## 🎨 Стилизация и темы

### Цветовая палитра

| Цвет            | Hex       | Применение        |
| --------------- | --------- | ----------------- |
| Primary Orange  | `#FF6600` | Акценты, кнопки   |
| Orange Hover    | `#FF8533` | Hover состояния   |
| Black           | `#000000` | Фон основной      |
| Card Background | `#1A1A1A` | Карточки, модалки |
| Border          | `#232323` | Границы элементов |
| Text Gray       | `#9CA3AF` | Вторичный текст   |

### Шрифты

**Inter** - основной шрифт:

- Inter Regular (500) - обычный текст
- Inter Medium (600) - заголовки
- Inter ExtraBold (800) - крупные заголовки

---

## ⚡ Оптимизация производительности

### CLS < 0.1

**Стратегии**:

1. **Фиксированные размеры изображений**:

```html
<img src="logo.svg" width="120" height="32" loading="eager" />
```

2. **Минимальные высоты**:

```html
<div class="min-h-60">{{ asyncContent$ | async }}</div>
```

3. **Зарезервированное пространство для иконок**:

```html
<i class="pi pi-home w-5 h-5 inline-flex items-center justify-center"></i>
```

4. **Фиксированные высоты header/footer**:

```html
<header class="min-h-[72px]">...</header>
<footer class="min-h-60">...</footer>
```

### Change Detection

**OnPush Strategy**:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### RxJS Performance

```typescript
// shareReplay для кеширования
totalRecords$ = this.state$.pipe(
  map(state => state.totalRecords),
  shareReplay(1)
);

// debounceTime для поиска
this.searchSubject.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(...);
```

### Sorting Optimization

```typescript
private collator = new Intl.Collator('ru', {
  numeric: true,
  sensitivity: 'base'
});
```

---

## 🌍 Интернационализация

### Конфигурация

```typescript
provideTranslateService({
  loader: provideTranslateHttpLoader({
    prefix: '/assets/i18n/',
    suffix: '.json',
  }),
  fallbackLang: 'ru',
  lang: 'ru',
});
```

### Использование

**Template**:

```html
<h1>{{ 'UPLOAD.TITLE' | translate }}</h1>
```

**TypeScript**:

```typescript
this.translate.instant('UPLOAD.TITLE');
```

---

## 🚀 Установка и запуск

### Требования

- Node.js 20+
- npm 9+
- Angular CLI 20.3.8

### Установка

```bash
# Клонирование
git clone https://github.com/CyberArt2718281/wink-project.git
cd wink-project

# Установка зависимостей
npm install
```

### Запуск

```bash
# Dev сервер
npm start

# Production build
npm run build
```

---

## 🐳 Docker

### Build & Run

```bash
# Сборка
docker build -t wink-project .

# Запуск
docker run -d -p 80:80 wink-project
```

### Docker Compose

```bash
docker-compose up -d
docker-compose down
```

---

## 📊 Метрики производительности

### Core Web Vitals

| Метрика | Целевое | Текущее |
| ------- | ------- | ------- |
| **LCP** | < 2.5s  | ✅ 1.8s |
| **FID** | < 100ms | ✅ 45ms |
| **CLS** | < 0.1   | ✅ 0.05 |

### Lighthouse Score

- Performance: 95+
- Accessibility: 100
- Best Practices: 95+
- SEO: 100

---

**Дата обновления**: 17 ноября 2025  
**Версия**: 2.0.0  
**Автор**: CyberArt2718281
