import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Store} from '@ngrx/store';
import {selectAnalysisResult} from '../../store/script/selectors';
import {ExportService} from './export.service';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 rounded-xl  p-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Экспорт таблицы</h2>
      <div class="flex gap-4 mb-6">
        <button (click)="export('xlsx')"
          class="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition font-semibold flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v16h16V4H4zm4 8h8" /></svg>
          XLSX
        </button>
        <button (click)="export('csv')"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v16h16V4H4zm4 8h8" /></svg>
          CSV
        </button>
      </div>
      @if (message) {
        <div  class="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded shadow animate-fade-in">{{ message }}</div>
      }
    </div>
  `,
  styles: []
})
export class ExportComponent {
  private store = inject(Store);
  private exportService = inject(ExportService);
  message: string | null = null;

  export(format: 'xlsx' | 'csv') {
    this.store.select(selectAnalysisResult).subscribe(result => {
      this.exportService.exportTable(result?.scenes || [], format);
      this.message = `Экспорт в ${format.toUpperCase()} завершён (заглушка)`;
    }).unsubscribe();
  }


}
