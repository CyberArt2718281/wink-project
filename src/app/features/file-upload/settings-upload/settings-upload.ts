import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {ToggleSwitchModule} from 'primeng/toggleswitch';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';

interface Column {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  category: string;
}

@Component({
  selector: 'app-settings-upload',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    ToggleSwitchModule,
    TranslateModule,
    CommonModule
  ],
  templateUrl: './settings-upload.html',
  styleUrl: './settings-upload.css',
})
export class SettingsUpload implements OnInit {
  modalOpen = false;
  selectedPreset: string = 'basic';
  newColumnName: string = '';

  @Output() presetChange = new EventEmitter<string>();
  @Output() columnsChange = new EventEmitter<{preset: string, columns: string[]}>();

  // Available columns
  basicColumns: Column[] = [
    { id: 'name', name: 'Название сцены', description: 'Основное название сцены', selected: true, category: 'basic' },
    { id: 'description', name: 'Описание', description: 'Детальное описание сцены', selected: true, category: 'basic' },
    { id: 'scene_number', name: 'Номер сцены', description: 'Порядковый номер сцены', selected: true, category: 'basic' },
    { id: 'location', name: 'Локация', description: 'Место съемки', selected: false, category: 'basic' },
    { id: 'duration', name: 'Длительность', description: 'Продолжительность сцены', selected: false, category: 'basic' }
  ];

  financialColumns: Column[] = [
    { id: 'budget', name: 'Бюджет', description: 'Запланированный бюджет', selected: false, category: 'financial' },
    { id: 'actual_cost', name: 'Фактические затраты', description: 'Реальные затраты', selected: false, category: 'financial' },
    { id: 'remaining_budget', name: 'Остаток бюджета', description: 'Неиспользованный бюджет', selected: false, category: 'financial' },
    { id: 'cost_breakdown', name: 'Детализация затрат', description: 'Подробная разбивка затрат', selected: false, category: 'financial' }
  ];

  productionColumns: Column[] = [
    { id: 'director', name: 'Режиссер', description: 'Ответственный режиссер', selected: false, category: 'production' },
    { id: 'camera_operator', name: 'Оператор', description: 'Оператор съемки', selected: false, category: 'production' },
    { id: 'lighting_director', name: 'Художник по свету', description: 'Специалист по освещению', selected: false, category: 'production' },
    { id: 'sound_engineer', name: 'Звукорежиссер', description: 'Специалист по звуку', selected: false, category: 'production' },
    { id: 'production_date', name: 'Дата производства', description: 'Планируемая дата съемки', selected: false, category: 'production' },
    { id: 'status', name: 'Статус', description: 'Текущий статус сцены', selected: true, category: 'production' }
  ];

  customColumns: Column[] = [];

  // В компоненте
  amberSwitch = {
    handle: {
      borderRadius: '16px',                // скругление круляшка
      checkedBackground: '#fff',        // цвет круляшка когда включено
      checkedHoverBackground: '#fff',   // цвет круляшка при hover (вкл)
      background: '#333',                  // цвет круляшка когда выключено
      hoverBackground: '#555',             // цвет круляшка при hover (выкл)
    },
    colorScheme: {
      light: {
        root: {
          checkedBackground: 'linear-gradient(15deg, #ff9532 0%, #ff8a1c 9.96%, #ff5b21 51.66%, #ff5a24 86%)',     // цвет фона когда включено
          checkedHoverBackground: 'linear-gradient(15deg, #ff9532 0%, #ff8a1c 9.96%, #ff5b21 51.66%, #ff5a24 86%)',// фон при hover (вкл)
          background: '#222',               // фон выключено
          hoverBackground: '#444',          // фон hover (выкл)
          borderRadius: '16px'
        },
      }
    }
  };

  checked = false;

  constructor() {
    this.loadSavedSettings();
  }

  ngOnInit() {
    this.applyPreset(this.selectedPreset);
  }

  get allColumns(): Column[] {
    return [...this.basicColumns, ...this.financialColumns, ...this.productionColumns, ...this.customColumns];
  }

  get selectedColumnsCount(): number {
    return this.allColumns.filter(col => col.selected).length;
  }

  get selectedColumnNames(): string[] {
    return this.allColumns.filter(col => col.selected).map(col => col.id);
  }

  openModal() {
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  saveSettings() {
    // Сохраняем настройки в localStorage
    localStorage.setItem('settings-upload-preset', this.selectedPreset);
    localStorage.setItem('settings-upload-columns', JSON.stringify(this.selectedColumnNames));
    localStorage.setItem('settings-upload-custom-columns', JSON.stringify(this.customColumns));

    // Эмитим события
    this.presetChange.emit(this.selectedPreset);
    this.columnsChange.emit({
      preset: this.selectedPreset,
      columns: this.selectedColumnNames
    });

    this.closeModal();
  }

  loadSavedSettings() {
    // Загружаем сохраненные настройки
    const savedPreset = localStorage.getItem('settings-upload-preset');
    const savedColumns = localStorage.getItem('settings-upload-columns');
    const savedCustomColumns = localStorage.getItem('settings-upload-custom-columns');

    if (savedPreset) {
      this.selectedPreset = savedPreset;
    }

    if (savedCustomColumns) {
      this.customColumns = JSON.parse(savedCustomColumns);
    }

    if (savedColumns && this.selectedPreset === 'custom') {
      const selectedColumnIds = JSON.parse(savedColumns);
      this.allColumns.forEach(column => {
        column.selected = selectedColumnIds.includes(column.id);
      });
    }
  }

  applyPreset(preset: string) {
    this.selectedPreset = preset;

    // Сбрасываем все выборы
    this.allColumns.forEach(column => column.selected = false);

    switch (preset) {
      case 'basic':
        this.basicColumns.forEach(col => {
          if (['name', 'description', 'scene_number'].includes(col.id)) {
            col.selected = true;
          }
        });
        this.productionColumns.forEach(col => {
          if (col.id === 'status') {
            col.selected = true;
          }
        });
        break;

      case 'advanced':
        this.allColumns.forEach(col => {
          if (!col.id.includes('cost_breakdown') && !col.category.includes('custom')) {
            col.selected = true;
          }
        });
        break;

      case 'full':
        this.allColumns.forEach(col => {
          col.selected = true;
        });
        break;

      case 'custom':
        // Для кастомного пресета загружаем сохраненные настройки
        const savedColumns = localStorage.getItem('settings-upload-columns');
        if (savedColumns) {
          const selectedColumnIds = JSON.parse(savedColumns);
          this.allColumns.forEach(column => {
            column.selected = selectedColumnIds.includes(column.id);
          });
        }
        break;
    }
  }

  selectAllColumns() {
    this.allColumns.forEach(column => column.selected = true);
  }

  deselectAllColumns() {
    this.allColumns.forEach(column => column.selected = false);
  }

  addCustomColumn() {
    if (this.newColumnName.trim()) {
      const newColumn: Column = {
        id: `custom_${Date.now()}`,
        name: this.newColumnName.trim(),
        description: 'Пользовательская колонка',
        selected: true,
        category: 'custom'
      };

      this.customColumns.push(newColumn);
      this.newColumnName = '';
    }
  }

  removeCustomColumn(columnId: string) {
    this.customColumns = this.customColumns.filter(col => col.id !== columnId);
  }

  toggleColumn(column: any, event: MouseEvent) {
    event.preventDefault();
    column.selected = !column.selected;
  }
}
