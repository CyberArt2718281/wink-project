import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExportService} from './export.service';
import {Toast} from 'primeng/toast';
import {ButtonModule} from 'primeng/button';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, Toast, ButtonModule],
  providers: [ MessageService],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 rounded-xl p-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Экспорт таблицы</h2>
      <div class="flex gap-4 mb-6">
        <button (click)="export('xlsx')"
          class="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition font-semibold flex items-center gap-2 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v16h16V4H4zm4 8h8" /></svg>
          XLSX
        </button>
        <button (click)="export('csv')"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold flex items-center gap-2 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v16h16V4H4zm4 8h8" /></svg>
          CSV
        </button>
      </div>
      <p-toast position="top-center"></p-toast>
    </div>
  `,
  styles: []
})
export class ExportComponent {
  private exportService = inject(ExportService);
  private messageService = inject(MessageService);

  export(format: 'xlsx' | 'csv') {
    // Получаем данные из localStorage
    const raw = localStorage.getItem('tableData');
    let scenes: { name: string; elements: string }[] = [];
    if (raw) {
      try {
        scenes = JSON.parse(raw);
      } catch {
        scenes = [];
      }
    }
    if (!scenes.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Нет данных для экспорта.',
        life: 3000
      });
      return;
    }
    try {
      this.exportService.exportTable(scenes, format);
      this.messageService.add({
        severity: 'success',
        summary: 'Успех',
        detail: `Экспорт в ${format.toUpperCase()} завершён.`,
        life: 3000
      });
    } catch (e) {
      const errorMessage = (e && typeof e === 'object' && 'message' in e) ? (e as Error).message : 'Ошибка экспорта файла.';
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: errorMessage,
        life: 3000
      });
    }
  }
}
