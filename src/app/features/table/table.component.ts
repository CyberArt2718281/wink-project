import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, Toast],
  providers: [ MessageService],
  template: `
    <p-toast position="top-center" class="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto"></p-toast>
    <div class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 rounded-xl  p-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Таблица данных</h2>
      <div class="overflow-x-auto w-full">
        <table class="min-w-full bg-white rounded-xl shadow border border-gray-200">
          <thead>
          <tr class="bg-blue-50">
            <th class="px-4 py-2 text-left text-gray-600 font-semibold">Сцена</th>
            <th class="px-4 py-2 text-left text-gray-600 font-semibold">Элементы</th>
          </tr>
          </thead>
          <tbody>
            @if (tableData.length > 0) {
              @for (row of tableData; let i = $index; track i) {
                <tr class="hover:bg-blue-50 transition">
                  <td class="px-4 py-2 text-gray-600">{{ row.name }}</td>
                  <td class="px-4 py-2 text-gray-600">{{ row.elements }}</td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="2" class="px-4 py-6 text-center text-gray-400">Нет данных для отображения</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="flex flex-col items-center mt-8 w-full">
        <input type="text" [(ngModel)]="editDescription" placeholder="Опишите, что нужно исправить..." class="mb-4 px-4 py-2 border text-gray-500 border-gray-300 rounded-lg w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-400 transition" [disabled]="isLoading" />
        <button (click)="sendForEdit()" [disabled]="isLoading || !editDescription" class="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold mb-4 w-full max-w-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          @if (!isLoading) { Отправить на правку }
          @else { <span class="flex items-center justify-center gap-2"><span class="loader"></span> Ожидание ответа...</span> }
        </button>
        @if (editMessage) {
          <div class="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded shadow animate-fade-in w-full max-w-xs text-center">{{ editMessage }}</div>
        }
        <button (click)="goToExport()" class="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition font-semibold w-full max-w-xs cursor-pointer">
          Перейти к экспорту
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  tableData: { name: string; elements: string }[] = [];
  isLoading = false;
  editMessage: string | null = null;
  editDescription: string = '';
  messageService = inject(MessageService)
  ngOnInit() {
    const saved = localStorage.getItem('tableData');
    if (saved) {
      this.tableData = JSON.parse(saved);
    } else {
      // Моковые данные для отображения
      this.tableData = [
        { name: 'Моковая сцена 1', elements: 'Моковые элементы 1' },
        { name: 'Моковая сцена 2', elements: 'Моковые элементы 2' }
      ];
    }
  }

  sendForEdit() {
    if (!this.editDescription) return;
    this.isLoading = true;
    this.editMessage = null;
    setTimeout(() => {
      // Имитация "ответа" сервера и обновления данных
      this.tableData = this.tableData.map(row => ({
        name: row.name + ' (отредактировано)',
        elements: row.elements + ' (правка)'
      }));
      this.isLoading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Успех',
        detail: 'Таблица успешно отредактирована.',
        life: 3000
      })
      this.editMessage = `Таблица успешно отредактирована: ${this.editDescription}`;
      localStorage.setItem('tableData', JSON.stringify(this.tableData));
      this.editDescription = '';
    }, 1800);
  }

  goToExport() {
    window.location.href = '/export';
  }
}

