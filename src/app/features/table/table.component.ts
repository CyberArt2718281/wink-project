import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 rounded-xl shadow-lg p-8">
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
    </div>
  `,
  styles: []
})
export class TableComponent implements OnInit {
  tableData: { name: string; elements: string }[] = [];

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
}

