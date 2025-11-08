import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {TagModule} from 'primeng/tag';
import {InputTextModule} from 'primeng/inputtext';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {DialogModule} from 'primeng/dialog';
import {FormsModule} from '@angular/forms';
import {MultiSelectModule} from 'primeng/multiselect';
import {SelectModule} from 'primeng/select';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver-es';

// Интерфейсы
export interface FilmingItem {
  id: number;
  name: string;
  cost: number;
  status: 'planned' | 'confirmed' | 'completed';
  contact?: string;
  category: string;
}

export interface FilmingCategory {
  name: string;
  items: FilmingItem[];
  budget: number;
}

export interface FilmingProduction {
  title: string;
  director: string;
  totalBudget: number;
  categories: {
    locations: FilmingCategory;
    characters: FilmingCategory;
    extras: FilmingCategory;
    props: FilmingCategory;
    transportation: FilmingCategory;
    animals: FilmingCategory;
    stunts: FilmingCategory;
  };
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
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: 'scene-table.component.html',
  styleUrls: ['scene-table.component.css'],
})
export class FilmingTableComponent implements OnInit {
  production: FilmingProduction = {
    title: 'Последний рассвет',
    director: 'Иван Петров',
    totalBudget: 5000000,
    categories: {
      locations: {
        name: 'Локации',
        budget: 1200000,
        items: [
          {
            id: 1,
            name: 'Заброшенный завод',
            cost: 500000,
            status: 'confirmed',
            contact: 'Мария +7-999-123-45-67',
            category: 'locations'
          },
          {id: 2, name: 'Городская площадь', cost: 300000, status: 'planned', category: 'locations'}
        ]
      },
      characters: {
        name: 'Персонажи',
        budget: 2000000,
        items: [
          {id: 3, name: 'Джон Смит', cost: 1000000, status: 'confirmed', category: 'characters'},
          {id: 4, name: 'Анна Джонс', cost: 500000, status: 'confirmed', category: 'characters'}
        ]
      },
      extras: {
        name: 'Массовка',
        budget: 300000,
        items: [
          {id: 5, name: 'Статисты для митинга', cost: 150000, status: 'planned', category: 'extras'},
          {id: 6, name: 'Актеры для кафе', cost: 60000, status: 'confirmed', category: 'extras'}
        ]
      },
      props: {
        name: 'Реквизит',
        budget: 400000,
        items: [
          {id: 7, name: 'Исторический реквизит', cost: 200000, status: 'confirmed', category: 'props'},
          {id: 8, name: 'Оружие (муляжи)', cost: 80000, status: 'planned', category: 'props'}
        ]
      },
      transportation: {
        name: 'Транспорт',
        budget: 350000,
        items: [
          {id: 9, name: 'Грузовик для оборудования', cost: 120000, status: 'confirmed', category: 'transportation'},
          {id: 10, name: 'Автобус для массовки', cost: 90000, status: 'planned', category: 'transportation'}
        ]
      },
      animals: {
        name: 'Животные',
        budget: 250000,
        items: [
          {id: 11, name: 'Лошади', cost: 150000, status: 'confirmed', contact: 'Конный клуб', category: 'animals'},
          {id: 12, name: 'Собаки', cost: 50000, status: 'planned', category: 'animals'}
        ]
      },
      stunts: {
        name: 'Трюки/Пиротехника',
        budget: 400000,
        items: [
          {id: 13, name: 'Каскадеры', cost: 250000, status: 'confirmed', category: 'stunts'},
          {id: 14, name: 'Пиротехника', cost: 100000, status: 'planned', category: 'stunts'}
        ]
      }
    }
  };

  allItems: FilmingItem[] = [];
  filteredItems: FilmingItem[] = [];

  selectedCategories: any[] = [];
  selectedStatuses: any[] = [];
  searchText: string = '';

  loading: boolean = false;
  showDialog: boolean = false;
  editingItem: FilmingItem | null = null;
  selectedItem: FilmingItem | null = null;

  formItem: any = {};

  categoryOptions = [
    {label: 'Локации', value: 'locations'},
    {label: 'Персонажи', value: 'characters'},
    {label: 'Массовка', value: 'extras'},
    {label: 'Реквизит', value: 'props'},
    {label: 'Транспорт', value: 'transportation'},
    {label: 'Животные', value: 'animals'},
    {label: 'Трюки', value: 'stunts'}
  ];

  statusOptions = [
    {label: 'Запланировано', value: 'planned'},
    {label: 'Подтверждено', value: 'confirmed'},
    {label: 'Завершено', value: 'completed'}
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.loadAllItems();
  }

  ngOnInit() {
    this.applyFilters();
    // Сбрасываем выделение при инициализации
    setTimeout(() => {
      this.selectedItem = null;
    });
  }

  clearSelection(): void {
    this.selectedItem = null;
  }

  get categoryStats(): any[] {
    return this.categoryOptions.map(option => {
      const items = this.allItems.filter(item => item.category === option.value);
      return {
        name: option.value,
        label: option.label,
        count: items.length,
        totalCost: items.reduce((sum, item) => sum + item.cost, 0)
      };
    });
  }

  private loadAllItems(): void {
    this.allItems = [];
    Object.values(this.production.categories).forEach(category => {
      this.allItems.push(...category.items);
    });
    this.filteredItems = [...this.allItems];
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.loading = true;

    let filtered = [...this.allItems];

    if (this.selectedCategories.length > 0) {
      const selectedValues = this.selectedCategories.map(c => c.value);
      filtered = filtered.filter(item => selectedValues.includes(item.category));
    }

    if (this.selectedStatuses.length > 0) {
      const selectedValues = this.selectedStatuses.map(s => s.value);
      filtered = filtered.filter(item => selectedValues.includes(item.status));
    }

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.contact && item.contact.toLowerCase().includes(searchLower)) ||
        this.getCategoryLabel(item.category).toLowerCase().includes(searchLower)
      );
    }

    this.filteredItems = filtered;
    this.loading = false;

    this.clearSelection();
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.selectedStatuses = [];
    this.searchText = '';
    this.applyFilters();
    this.messageService.add({severity: 'info', summary: 'Фильтры сброшены', detail: 'Все фильтры были очищены'});
  }

  filterByCategory(category: string): void {
    this.selectedCategories = [this.categoryOptions.find(opt => opt.value === category)];
    this.applyFilters();
  }

  showAddDialog(): void {
    this.editingItem = null;
    this.formItem = {
      id: this.generateId(),
      name: '',
      cost: 0,
      status: 'planned',
      category: 'locations'
    };
    this.showDialog = true;
  }

  editItem(item: FilmingItem): void {
    this.editingItem = item;
    this.formItem = {...item};
    this.showDialog = true;
  }

  confirmDelete(item: FilmingItem): void {
    this.confirmationService.confirm({
      message: `Вы уверены, что хотите удалить "${item.name}"?`,
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Да, удалить',
      rejectLabel: 'Отмена',
      accept: () => this.deleteItem(item)
    });
  }

  deleteItem(item: FilmingItem): void {
    const category = this.production.categories[item.category as keyof typeof this.production.categories];
    category.items = category.items.filter(i => i.id !== item.id);

    this.loadAllItems();
    this.applyFilters();
    this.messageService.add({severity: 'success', summary: 'Успешно', detail: `Элемент "${item.name}" удален`});
  }

  markAsCompleted(item: FilmingItem): void {
    const category = this.production.categories[item.category as keyof typeof this.production.categories];
    const foundItem = category.items.find(i => i.id === item.id);
    if (foundItem) {
      foundItem.status = 'completed';
      this.loadAllItems();
      this.applyFilters();
      this.messageService.add({
        severity: 'success',
        summary: 'Обновлено',
        detail: `Элемент "${item.name}" отмечен как завершенный`
      });
    }
  }

  saveItem(): void {
    if (!this.isFormValid()) return;

    const category = this.production.categories[this.formItem.category as keyof typeof this.production.categories];

    if (this.editingItem) {
      const index = category.items.findIndex(item => item.id === this.editingItem!.id);
      if (index !== -1) {
        category.items[index] = {...this.formItem};
      }
      this.messageService.add({
        severity: 'success',
        summary: 'Обновлено',
        detail: `Элемент "${this.formItem.name}" обновлен`
      });
    } else {
      category.items.push({...this.formItem});
      this.messageService.add({
        severity: 'success',
        summary: 'Добавлено',
        detail: `Элемент "${this.formItem.name}" добавлен`
      });
    }

    this.loadAllItems();
    this.applyFilters();
    this.showDialog = false;
  }

  // Экспорт данных
  exportExcel(): void {
    const data = this.prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Production Data');

    const excelBuffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
    const blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    saveAs(blob, `production_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    this.messageService.add({severity: 'success', summary: 'Экспорт', detail: 'Данные экспортированы в Excel'});
  }

  exportCSV(): void {
    const data = this.prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob(['\uFEFF' + csvOutput], {type: 'text/csv;charset=utf-8;'});
    saveAs(blob, `production_data_${new Date().toISOString().split('T')[0]}.csv`);
    this.messageService.add({severity: 'success', summary: 'Экспорт', detail: 'Данные экспортированы в CSV'});
  }

  private prepareExportData(): any[] {
    return this.filteredItems.map(item => ({
      'ID': item.id,
      'Название': item.name,
      'Категория': this.getCategoryLabel(item.category),
      'Стоимость ($)': item.cost,
      'Статус': this.getStatusLabel(item.status),
      'Контакт': item.contact || 'Не указан'
    }));
  }

  // Вспомогательные методы
  private generateId(): number {
    return Math.max(...this.allItems.map(item => item.id), 0) + 1;
  }

  isFormValid(): boolean {
    return !!(this.formItem.name && this.formItem.cost && this.formItem.status && this.formItem.category);
  }

  getCategoryLabel(category: string): string {
    const found = this.categoryOptions.find(opt => opt.value === category);
    return found ? found.label : category;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'locations': 'pi pi-map-marker',
      'characters': 'pi pi-users',
      'extras': 'pi pi-user',
      'props': 'pi pi-box',
      'transportation': 'pi pi-truck',
      'animals': 'pi pi-heart',
      'stunts': 'pi pi-bolt'
    };
    return icons[category] || 'pi pi-tag';
  }

  getCategoryStyle(category: string): any {
    const styles: { [key: string]: any } = {
      'locations': {'background': '#3B82F6', 'color': 'white'},
      'characters': {'background': '#10B981', 'color': 'white'},
      'extras': {'background': '#F59E0B', 'color': 'white'},
      'props': {'background': '#8B5CF6', 'color': 'white'},
      'transportation': {'background': '#EF4444', 'color': 'white'},
      'animals': {'background': '#6B7280', 'color': 'white'},
      'stunts': {'background': '#EC4899', 'color': 'white'}
    };
    return styles[category] || {'background': '#6B7280', 'color': 'white'};
  }

  getCategoryBudget(category: string): number {
    return this.production.categories[category as keyof typeof this.production.categories]?.budget || 0;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'planned': 'Запланировано',
      'confirmed': 'Подтверждено',
      'completed': 'Завершено'
    };
    return labels[status] || status;
  }

  getStatusStyle(status: string): any {
    const styles: { [key: string]: any } = {
      'planned': {'background': '#F59E0B', 'color': 'white'},
      'confirmed': {'background': '#3B82F6', 'color': 'white'},
      'completed': {'background': '#10B981', 'color': 'white'}
    };
    return styles[status] || {'background': '#6B7280', 'color': 'white'};
  }

  // Геттеры для статистики
  get totalItems(): number {
    return this.filteredItems.length;
  }

  get totalCost(): number {
    return this.filteredItems.reduce((sum, item) => sum + item.cost, 0);
  }

  get confirmedCount(): number {
    return this.filteredItems.filter(item => item.status === 'confirmed').length;
  }

  get completedCount(): number {
    return this.filteredItems.filter(item => item.status === 'completed').length;
  }

  get totalRecords(): number {
    return this.filteredItems.length;
  }
}
