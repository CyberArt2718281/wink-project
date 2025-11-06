import {Injectable} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSizeMb = 5;
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Поддерживаются только PDF и DOCX' };
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return { valid: false, error: 'Файл слишком большой (максимум 5 МБ)' };
    }
    // Здесь можно добавить проверку количества страниц (заглушка)
    return { valid: true };
  }
}
