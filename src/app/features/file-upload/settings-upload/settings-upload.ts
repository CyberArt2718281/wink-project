import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

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
  imports: [FormsModule, ButtonModule, ToggleSwitchModule, TranslateModule, CommonModule],
  templateUrl: './settings-upload.html',
  styleUrl: './settings-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsUpload implements OnInit {
  modalOpen = false;
  selectedPreset: string = 'basic';

  @Output() presetChange = new EventEmitter<string>();
  @Output() columnsChange = new EventEmitter<{ preset: string; columns: string[] }>();

  basicColumns: Column[] = [
    {
      id: 'name',
      name: 'Название сцены',
      description: 'Основное название сцены',
      selected: true,
      category: 'basic',
    },
    {
      id: 'description',
      name: 'Описание',
      description: 'Детальное описание сцены',
      selected: true,
      category: 'basic',
    },
    {
      id: 'scene_number',
      name: 'Номер сцены',
      description: 'Порядковый номер сцены',
      selected: true,
      category: 'basic',
    },
    {
      id: 'location',
      name: 'Локация',
      description: 'Место съемки',
      selected: false,
      category: 'basic',
    },
    {
      id: 'duration',
      name: 'Длительность',
      description: 'Продолжительность сцены',
      selected: false,
      category: 'basic',
    },
  ];

  financialColumns: Column[] = [
    {
      id: 'budget',
      name: 'Бюджет',
      description: 'Запланированный бюджет',
      selected: false,
      category: 'financial',
    },
    {
      id: 'actual_cost',
      name: 'Фактические затраты',
      description: 'Реальные затраты',
      selected: false,
      category: 'financial',
    },
    {
      id: 'remaining_budget',
      name: 'Остаток бюджета',
      description: 'Неиспользованный бюджет',
      selected: false,
      category: 'financial',
    },
    {
      id: 'cost_breakdown',
      name: 'Детализация затрат',
      description: 'Подробная разбивка затрат',
      selected: false,
      category: 'financial',
    },
  ];

  productionColumns: Column[] = [
    {
      id: 'director',
      name: 'Режиссер',
      description: 'Ответственный режиссер',
      selected: false,
      category: 'production',
    },
    {
      id: 'camera_operator',
      name: 'Оператор',
      description: 'Оператор съемки',
      selected: false,
      category: 'production',
    },
    {
      id: 'lighting_director',
      name: 'Художник по свету',
      description: 'Специалист по освещению',
      selected: false,
      category: 'production',
    },
    {
      id: 'sound_engineer',
      name: 'Звукорежиссер',
      description: 'Специалист по звуку',
      selected: false,
      category: 'production',
    },
    {
      id: 'production_date',
      name: 'Дата производства',
      description: 'Планируемая дата съемки',
      selected: false,
      category: 'production',
    },
    {
      id: 'status',
      name: 'Статус',
      description: 'Текущий статус сцены',
      selected: true,
      category: 'production',
    },
  ];

  private allColumnsCache: Column[] | null = null;
  private selectedColumnCountCache: number = -1;
  private selectedColumnNamesCache: string[] | null = null;

  readonly amberSwitch = {
    handle: {
      borderRadius: '16px',
      checkedBackground: '#fff',
      checkedHoverBackground: '#fff',
      background: '#333',
      hoverBackground: '#555',
    },
    colorScheme: {
      light: {
        root: {
          checkedBackground:
            'linear-gradient(15deg, #ff9532 0%, #ff8a1c 9.96%, #ff5b21 51.66%, #ff5a24 86%)',
          checkedHoverBackground:
            'linear-gradient(15deg, #ff9532 0%, #ff8a1c 9.96%, #ff5b21 51.66%, #ff5a24 86%)',
          background: '#222',
          hoverBackground: '#444',
          borderRadius: '16px',
        },
      },
    },
  };

  checked = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.loadSavedSettings();
  }

  ngOnInit(): void {
    this.applyPreset(this.selectedPreset);
  }

  get allColumns(): Column[] {
    this.allColumnsCache = [
      ...this.basicColumns,
      ...this.financialColumns,
      ...this.productionColumns,
    ];
    return this.allColumnsCache;
  }

  get selectedColumnNames(): string[] {
    return this.allColumns.filter((col) => col.selected).map((col) => col.id);
  }

  openModal(): void {
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  saveSettings(): void {
    const columnNames = this.selectedColumnNames;
    localStorage.setItem('settings-upload-preset', this.selectedPreset);
    localStorage.setItem('settings-upload-columns', JSON.stringify(columnNames));

    this.presetChange.emit(this.selectedPreset);
    this.columnsChange.emit({
      preset: this.selectedPreset,
      columns: columnNames,
    });

    this.closeModal();
  }

  loadSavedSettings(): void {
    const savedPreset = localStorage.getItem('settings-upload-preset');
    const savedColumns = localStorage.getItem('settings-upload-columns');

    if (savedPreset) {
      this.selectedPreset = savedPreset;
    }

    if (savedColumns) {
      const selectedColumnIds = JSON.parse(savedColumns);
      this.allColumns.forEach((column) => {
        column.selected = selectedColumnIds.includes(column.id);
      });
    }
  }

  applyPreset(preset: string): void {
    this.selectedPreset = preset;
    this.allColumns.forEach((column) => (column.selected = false));

    switch (preset) {
      case 'basic':
        this.basicColumns.forEach((col) => {
          if (['name', 'description', 'scene_number'].includes(col.id)) {
            col.selected = true;
          }
        });
        this.productionColumns.forEach((col) => {
          if (col.id === 'status') {
            col.selected = true;
          }
        });
        break;

      case 'extended':
        this.allColumns.forEach((col) => {
          if (!col.id.includes('cost_breakdown')) {
            col.selected = true;
          }
        });
        break;

      case 'full':
        this.allColumns.forEach((col) => {
          col.selected = true;
        });
        break;
    }
  }

  toggleColumn(column: any, event: MouseEvent) {
    event.preventDefault();
    column.selected = !column.selected;
  }
}
