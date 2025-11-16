import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PrimeNG } from 'primeng/config';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, shareReplay, takeUntil } from 'rxjs/operators';
import { SuccessResultResponse } from '../../../types/resultResponse.type';
import { CeilRequest, CeilService } from '../services/ceil.service';
import { ExportService } from '../services/export.service';

interface EditingCell {
  rowIndex: number;
  columnName: string;
  value: any;
  originalValue: any;
  isLoading: boolean;
  error: string | null;
}

interface TableState {
  columns: string[];
  rows: any[];
  filteredRows: any[];
  searchText: string;
  sortColumn: string | null;
  sortOrder: 'asc' | 'desc';
  selectedRows: Set<number>;
  editingCell: EditingCell | null;
  loading: boolean;
  savingCells: Set<string>;
  showExportDialog: boolean;
  exportType: 'excel' | 'csv' | null;
  currentPage: number;
  pageSize: number;
}

@Component({
  selector: 'app-filming-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    FormsModule,
    MultiSelectModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    TranslateModule,
    PaginatorModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './scene-table.component.html',
  styleUrls: ['./scene-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmingTableComponent implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly primeng = inject(PrimeNG);
  private readonly messageService = inject(MessageService);
  private readonly ceilService = inject(CeilService);
  private readonly exportService = inject(ExportService);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();
  private readonly collator = new Intl.Collator('ru');
  private jobId: string | null = null;

  // State management с BehaviorSubject
  private readonly initialState: TableState = {
    columns: [],
    rows: [],
    filteredRows: [],
    searchText: '',
    sortColumn: null,
    sortOrder: 'asc',
    selectedRows: new Set(),
    editingCell: null,
    loading: false,
    savingCells: new Set(),
    showExportDialog: false,
    exportType: null,
    currentPage: 0,
    pageSize: 10,
  };

  private readonly state$ = new BehaviorSubject<TableState>(this.initialState);

  // Selectors с оптимизацией
  columns$ = this.state$.pipe(
    map((state) => state.columns),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  filteredRows$ = this.state$.pipe(
    map((state) => state.filteredRows),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  selectedRows$ = this.state$.pipe(map((state) => state.selectedRows));
  editingCell$ = this.state$.pipe(map((state) => state.editingCell));
  loading$ = this.state$.pipe(
    map((state) => state.loading),
    distinctUntilChanged()
  );
  searchText$ = this.state$.pipe(
    map((state) => state.searchText),
    distinctUntilChanged()
  );
  showExportDialog$ = this.state$.pipe(
    map((state) => state.showExportDialog),
    distinctUntilChanged()
  );
  exportType$ = this.state$.pipe(map((state) => state.exportType));
  sortColumn$ = this.state$.pipe(map((state) => state.sortColumn));
  sortOrder$ = this.state$.pipe(map((state) => state.sortOrder));

  selectedCount$ = this.selectedRows$.pipe(map((selectedRows) => selectedRows.size));
  allRecords$ = this.state$.pipe(
    map((state) => state.rows.length),
    distinctUntilChanged()
  );
  totalRecords$ = this.filteredRows$.pipe(
    map((rows) => rows.length),
    distinctUntilChanged()
  );

  // Pagination selectors
  currentPage$ = this.state$.pipe(
    map((state) => state.currentPage),
    distinctUntilChanged()
  );
  pageSize$ = this.state$.pipe(
    map((state) => state.pageSize),
    distinctUntilChanged()
  );

  paginatedRows$ = this.state$.pipe(
    map((state) => {
      const start = state.currentPage * state.pageSize;
      const end = start + state.pageSize;
      const safeStart = Math.min(start, state.filteredRows.length);
      const safeEnd = Math.min(end, state.filteredRows.length);
      return state.filteredRows.slice(safeStart, safeEnd);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  first$ = this.state$.pipe(
    map((state) => state.currentPage * state.pageSize),
    distinctUntilChanged()
  );

  // Pagination display info
  paginationStart$ = this.state$.pipe(
    map((state) => {
      if (state.filteredRows.length === 0) return 0;
      return state.currentPage * state.pageSize + 1;
    }),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  );

  paginationEnd$ = this.state$.pipe(
    map((state) => {
      const end = (state.currentPage + 1) * state.pageSize;
      return Math.min(end, state.filteredRows.length);
    }),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  );

  ngOnInit(): void {
    this.loadDataFromServer();
    this.initSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Инициализация поиска с дебаунсингом
   */
  private initSearchDebounce(): void {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchText) => {
        this.updateSearch(searchText);
      });
  }

  /**
   * Загружает данные с сервера из localStorage
   */
  private loadDataFromServer(): void {
    try {
      const storedData = localStorage.getItem('processedTableData');

      if (storedData) {
        const serverResponse: SuccessResultResponse = JSON.parse(storedData);

        this.jobId = serverResponse.job_id;

        const columns = serverResponse.table.columns;
        const rows = JSON.parse(JSON.stringify(serverResponse.table.rows));

        this.setState({
          columns,
          rows,
          filteredRows: [...rows],
          loading: false,
        });
      } else {
        this.setState({
          columns: [],
          rows: [],
          filteredRows: [],
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('COMMON.ERROR') || 'Ошибка',
        detail: this.translate.instant('TABLE.LOAD_ERROR') || 'Не удалось загрузить данные',
        life: 3000,
      });
    }
  }

  /**
   * Обновляет состояние компонента
   */
  private setState(partial: Partial<TableState>): void {
    const current = this.state$.value;
    this.state$.next({ ...current, ...partial });
  }

  /**
   * Поиск по всем столбцам
   */
  onSearch(searchText: string): void {
    this.setState({ searchText });
    this.search$.next(searchText);
  }

  /**
   * Обновляет результаты поиска
   */
  private updateSearch(searchText: string): void {
    const state = this.state$.value;
    let filtered = [...state.rows];

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) => String(value).toLowerCase().includes(searchLower))
      );
    }

    if (state.sortColumn) {
      filtered = this.sortRows(filtered, state.sortColumn, state.sortOrder);
    }

    // Всегда сбрасываем на первую страницу при поиске
    this.setState({
      filteredRows: filtered,
      searchText,
      currentPage: 0,
    });
  }

  /**
   * Сортировка строк (оптимизирована с Intl.Collator)
   */
  private sortRows(rows: any[], columnName: string, sortOrder: 'asc' | 'desc'): any[] {
    return [...rows].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';

      let comparison = 0;

      const numA = Number(valueA);
      const numB = Number(valueB);

      if (!isNaN(numA) && !isNaN(numB)) {
        comparison = numA - numB;
      } else {
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        comparison = this.collator.compare(strA, strB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Сортировка по столбцу
   */
  sortByColumn(columnName: string): void {
    const state = this.state$.value;
    let newOrder: 'asc' | 'desc' = 'asc';

    if (state.sortColumn === columnName) {
      newOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    }

    const sortedRows = this.sortRows(state.filteredRows, columnName, newOrder);

    // Пересчитываем текущую страницу после сортировки
    const totalPages = Math.ceil(sortedRows.length / state.pageSize);
    const newCurrentPage = state.currentPage >= totalPages ? 0 : state.currentPage;

    this.setState({
      sortColumn: columnName,
      sortOrder: newOrder,
      filteredRows: sortedRows,
      currentPage: newCurrentPage, // Сбрасываем страницу если нужно
    });
  }
  /**
   * Получить иконку сортировки для столбца
   */
  getSortIcon(columnName: string): string {
    const state = this.state$.value;
    if (state.sortColumn !== columnName) {
      return 'pi pi-sort text-gray-500';
    }

    return state.sortOrder === 'asc'
      ? 'pi pi-sort-amount-up text-[#FF6600]'
      : 'pi pi-sort-amount-down text-[#FF6600]';
  }

  /**
   * Проверить, активна ли сортировка для столбца
   */
  isSortActive(columnName: string): boolean {
    return this.state$.value.sortColumn === columnName;
  }

  /**
   * Очистить фильтры и сортировку
   */
  clearFilters(): void {
    const state = this.state$.value;
    this.setState({
      searchText: '',
      filteredRows: [...state.rows],
      sortColumn: null,
      sortOrder: 'asc',
      selectedRows: new Set(),
      currentPage: 0, // Уже сбрасывается на 0
    });

    this.messageService.add({
      severity: 'info',
      summary: this.translate.instant('SCENE_TABLE.FILTERS_CLEARED') || 'Фильтры очищены',
      detail:
        this.translate.instant('SCENE_TABLE.FILTERS_DETAILS') ||
        'Все фильтры были сброшены до значений по умолчанию.',
      life: 2000,
    });
  }

  /**
   * Выбрать все строки
   */
  selectAllRows(): void {
    const state = this.state$.value;
    const selectedRows = new Set<number>();
    state.filteredRows.forEach((_, index) => selectedRows.add(index));
    this.setState({ selectedRows });
  }

  /**
   * Отменить выбор всех строк
   */
  deselectAllRows(): void {
    this.setState({ selectedRows: new Set() });
  }

  /**
   * Переключить выбор строки
   */
  toggleRowSelection(rowIndex: number): void {
    const state = this.state$.value;
    const selectedRows = new Set(state.selectedRows);

    if (selectedRows.has(rowIndex)) {
      selectedRows.delete(rowIndex);
    } else {
      selectedRows.add(rowIndex);
    }

    this.setState({ selectedRows });
  }

  /**
   * Обработка изменения страницы пагинатора
   */
  onPageChange(event: any): void {
    const pageSize = event.rows || 10;
    const first = event.first || 0;
    const currentPage = Math.floor(first / pageSize);

    // Проверяем, что текущая страница не выходит за пределы
    const totalPages = Math.ceil(this.state$.value.filteredRows.length / pageSize);
    const safeCurrentPage = Math.min(currentPage, totalPages - 1);

    this.setState({
      currentPage: safeCurrentPage,
      pageSize,
    });
  }

  /**
   * Проверить, выбрана ли строка
   */
  isRowSelected(rowIndex: number): boolean {
    return this.state$.value.selectedRows.has(rowIndex);
  }

  /**
   * Показать диалог экспорта Excel
   */
  showExcelExportDialog(): void {
    this.setState({ showExportDialog: true, exportType: 'excel' });
  }

  /**
   * Показать диалог экспорта CSV
   */
  showCsvExportDialog(): void {
    this.setState({ showExportDialog: true, exportType: 'csv' });
  }

  /**
   * Подтвердить экспорт
   */
  confirmExport(): void {
    const state = this.state$.value;

    if (!this.jobId) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('COMMON.ERROR') || 'Ошибка',
        detail: 'Job ID не найден. Перезагрузите страницу',
        life: 3000,
      });
      return;
    }

    // Показываем индикатор загрузки
    this.setState({ loading: true });

    let format: 'csv' | 'xlsx' = 'csv';
    if (state.exportType === 'excel') {
      format = 'xlsx';
    }

    // Подписываемся на Observable с правильной обработкой ошибок
    this.exportService.downloadExport(this.jobId, format).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SCENE_TABLE.EXPORT_SUCCESS') || 'Экспорт успешен',
          detail: `Файл ${state.exportType?.toUpperCase()} скачан`,
          life: 3000,
        });

        this.setState({ showExportDialog: false, exportType: null, loading: false });
      },
      error: (err: any) => {
        const errorMessage =
          err?.message || err?.detail || `Ошибка при экспорте ${state.exportType?.toUpperCase()}`;

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR') || 'Ошибка',
          detail: errorMessage,
          life: 5000,
        });

        this.setState({ loading: false });
      },
      complete: () => {
        // Запрос экспорта завершен
      },
    });
  }

  /**
   * Скрыть диалог экспорта
   */
  hideExportDialog(): void {
    this.setState({ showExportDialog: false });
  }

  /**
   * Получить значение ячейки с форматированием
   */
  getCellValue(row: any, column: string): any {
    const value = row[column];

    if (value === null || value === undefined) {
      return '—';
    }

    return value;
  }

  /**
   * Проверить, является ли значение процентом
   */
  isPercentageValue(value: any): boolean {
    return String(value).includes('%');
  }

  /**
   * Получить стиль для процентов
   */
  getPercentageStyle(value: any): any {
    const numValue = parseInt(String(value));

    if (numValue >= 80) {
      return { color: '#10b981' };
    } else if (numValue >= 60) {
      return { color: '#f59e0b' };
    } else {
      return { color: '#ef4444' };
    }
  }

  /**
   * Проверить, является ли столбец статусом
   */
  isStatusColumn(columnName: string): boolean {
    return (
      columnName.toLowerCase().includes('status') || columnName.toLowerCase().includes('статус')
    );
  }

  /**
   * Получить стиль статуса
   */
  getStatusStyle(value: any): any {
    const status = String(value).toLowerCase();

    if (status.includes('success') || status.includes('завершен')) {
      return { 'background-color': '#10b981', color: '#fff' };
    } else if (status.includes('pending') || status.includes('ожидание')) {
      return { 'background-color': '#f59e0b', color: '#fff' };
    } else if (status.includes('error') || status.includes('ошибка')) {
      return { 'background-color': '#ef4444', color: '#fff' };
    }

    return { 'background-color': '#6b7280', color: '#fff' };
  }

  /**
   * Получить иконку статуса
   */
  getStatusIcon(value: any): string {
    const status = String(value).toLowerCase();

    if (status.includes('success') || status.includes('завершен')) {
      return 'pi pi-check-circle';
    } else if (status.includes('pending') || status.includes('ожидание')) {
      return 'pi pi-clock';
    } else if (status.includes('error') || status.includes('ошибка')) {
      return 'pi pi-times-circle';
    }

    return 'pi pi-info-circle';
  }

  /**
   * Получить уникальный ключ ячейки для отслеживания загрузки
   */
  private getCellKey(rowIndex: number, columnName: string): string {
    return `${rowIndex}:${columnName}`;
  }

  /**
   * Включить режим редактирования для ячейки
   */
  enableEditing(rowIndex: number, columnName: string): void {
    const state = this.state$.value;
    if (state.editingCell) {
      this.cancelEditing();
    }

    const value = state.filteredRows[rowIndex][columnName];

    const editingCell: EditingCell = {
      rowIndex,
      columnName,
      value,
      originalValue: value,
      isLoading: false,
      error: null,
    };

    this.setState({ editingCell });
  }

  /**
   * Сохранить изменения редактирования и отправить на сервер
   */
  saveEditing(): void {
    const state = this.state$.value;
    const editingCell = state.editingCell;

    if (!editingCell) return;

    if (editingCell.value === editingCell.originalValue) {
      this.cancelEditing();
      return;
    }

    if (!this.jobId) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('COMMON.ERROR') || 'Ошибка',
        detail: 'Job ID не найден. Перезагрузите страницу',
        life: 3000,
      });
      return;
    }

    const cellKey = this.getCellKey(editingCell.rowIndex, editingCell.columnName);
    const savingCells = new Set(state.savingCells);
    savingCells.add(cellKey);

    this.setState({
      editingCell: { ...editingCell, isLoading: true },
      savingCells,
    });

    const payload: CeilRequest = {
      job_id: this.jobId,
      row: editingCell.rowIndex,
      column: editingCell.columnName,
      value: String(editingCell.value),
    };

    this.ceilService
      .updateCell(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCell) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SCENE_TABLE.CHANGES_SAVED') || 'Изменения сохранены',
            detail: `${editingCell.columnName}: ${editingCell.value}`,
            life: 2000,
          });

          savingCells.delete(cellKey);
          this.setState({ editingCell: null, savingCells });
        },
        error: (err) => {
          // Откатываем значение в случае ошибки
          const filteredRows = [...state.filteredRows];
          filteredRows[editingCell.rowIndex][editingCell.columnName] = editingCell.originalValue;

          const rows = [...state.rows];
          rows[editingCell.rowIndex][editingCell.columnName] = editingCell.originalValue;

          const errorMessage =
            err?.message || this.translate.instant('TABLE.SAVE_ERROR') || 'Ошибка при сохранении';

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR') || 'Ошибка',
            detail: errorMessage,
            life: 4000,
          });

          savingCells.delete(cellKey);
          this.setState({ editingCell: null, savingCells, filteredRows, rows });
        },
      });

    // Оптимистичное обновление UI
    const filteredRows = [...state.filteredRows];
    filteredRows[editingCell.rowIndex][editingCell.columnName] = editingCell.value;

    const rows = [...state.rows];
    rows[editingCell.rowIndex][editingCell.columnName] = editingCell.value;

    this.setState({ filteredRows, rows });
  }

  /**
   * Отменить редактирование
   */
  cancelEditing(): void {
    this.setState({ editingCell: null });
  }

  /**
   * Проверить, находится ли ячейка в режиме редактирования
   */
  isCellEditing(rowIndex: number, columnName: string): boolean {
    const editingCell = this.state$.value.editingCell;
    return editingCell?.rowIndex === rowIndex && editingCell?.columnName === columnName;
  }

  /**
   * Проверить, загружается ли ячейка
   */
  isCellLoading(rowIndex: number, columnName: string): boolean {
    const cellKey = this.getCellKey(rowIndex, columnName);
    return this.state$.value.savingCells.has(cellKey);
  }

  /**
   * TrackBy функции для оптимизации *ngFor
   */
  trackByString(index: number, value: string): string {
    return value;
  }

  trackByIndex(index: number, value: any): number {
    return index;
  }
}
