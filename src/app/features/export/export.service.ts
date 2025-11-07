import {Injectable} from '@angular/core';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver-es';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportTable(data: any[], format: 'xlsx' | 'csv'): void {
    if (!data || !data.length) {
      alert('Нет данных для экспорта');
      return;
    }
    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'export.xlsx');
    } else if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data));
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'export.csv');
    }
  }
}
