import {Injectable} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportTable(data: any[], format: 'xlsx' | 'csv'): void {
    // Заглушка: имитация экспорта данных
    // В реальной реализации здесь будет генерация файла и сохранение через FileSaver/xlsx
    console.log(`Экспорт данных в формат: ${format}`);
    console.log('Данные:', data);
    // Можно добавить имитацию задержки или уведомления
  }
}
