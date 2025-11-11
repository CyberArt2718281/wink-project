import {ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MessageService} from 'primeng/api';
import {SettingsUpload} from './settings-upload/settings-upload';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {SharedModule} from '../../shared/shared-module';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '../../core/language.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [SharedModule, SettingsUpload, CommonModule, TranslateModule],
  providers: [MessageService],
  styleUrls: ['./file-upload.component.css'],
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  isDragOver = false;
  uploadedFile: File | null = null;
  uploadedFileType: string | null = null;
  progress: number = 0;
  visible: boolean = false;
  interval: any = null;
  timeOut: any = null;
  error: string | null = null;
  selectedOption: string | null = null;
  selectedColumns: string[] = [];
  isProcessing: boolean = false;

  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  languageService = inject(LanguageService);
  translate = inject(TranslateService);

  constructor() {
    this.languageService.getLanguage$().subscribe(lang => {
      this.translate.use(lang);
      if (this.visible && !this.error) {
        this.translate.get('UPLOAD.PROCESSING').subscribe((processingText: string) => {
          this.messageService.clear('confirm');
          this.messageService.add({
            key: 'confirm',
            sticky: true,
            severity: 'custom',
            summary: processingText,
            styleClass: 'backdrop-blur-lg rounded-2xl'
          });
        });
      }
    });
  }

  ngOnInit() {
    this.selectedOption = localStorage.getItem('settings-upload-preset') || 'basic';
    this.selectedColumns = JSON.parse(localStorage.getItem('settings-upload-columns') || '[]');
    this.timeOut = setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
  }

  triggerFileInput() {
    this.fileInput?.nativeElement.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.processFile(input.files[0]);
    input.value = '';
  }

  processFile(file: File) {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.showError(this.translate.instant('UPLOAD.ERROR_TYPE'));
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      this.showError(this.translate.instant('UPLOAD.ERROR_SIZE'));
      return;
    }

    if (!file.name.match(/\.(pdf|docx)$/i)) {
      this.showError(this.translate.instant('UPLOAD.ERROR_EXTENSION'));
      return;
    }

    this.error = null;
    this.uploadedFile = file;
    this.uploadedFileType = file.type === 'application/pdf' ? 'PDF' : 'DOCX';
    this.isProcessing = false;
    this.progress = 0;

    // Скроллим к блоку информации о файле
    setTimeout(() => {
      const infoBlock = document.getElementById('file-info-block');
      if (infoBlock) {
        infoBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  showError(message: string) {
    this.error = message;
    const errorTitle = this.translate.instant('UPLOAD.ERROR_TITLE');
    this.messageService.add({
      key: 'error',
      severity: 'error',
      summary: errorTitle,
      detail: message,
      life: 3000,
      styleClass: 'bg-[#1A1A1A] text-white border border-[#FF6600]/20 rounded-xl backdrop-blur-lg text-sm'
    });
    this.cdr.detectChanges();
    this.visible = false;
    this.uploadedFile = null;
    this.uploadedFileType = null;
    this.isProcessing = false;
  }

  processData() {
    if (!this.uploadedFile) return;

    this.isProcessing = true;
    this.progress = 0;
    this.visible = true;

    this.messageService.add({
      key: 'confirm',
      sticky: true,
      severity: 'custom',
      summary: this.translate.instant('UPLOAD.PROCESSING'),
      styleClass: 'backdrop-blur-lg rounded-2xl'
    });

    this.cleanup();

    // Правильная симуляция прогресса с целыми числами
    this.interval = setInterval(() => {
      if (this.progress < 100) {
        // Увеличиваем прогресс на 10% каждый раз, но не более 100%
        this.progress = Math.min(this.progress + 10, 100);
        this.progress = Math.round(this.progress); // Обеспечиваем целое число

        console.log('Progress:', this.progress); // Для отладки
      }

      // Когда достигли 100%, завершаем обработку
      if (this.progress >= 100) {
        this.completeProcessing();
      }

      this.cdr.markForCheck();
    }, 500); // Интервал 500ms для плавного прогресса
  }

  private completeProcessing(): void {
    console.log('Complete processing called, progress:', this.progress); // Для отладки

    this.cleanup();

    // Сохраняем данные
    if (this.uploadedFile) {
      localStorage.setItem('tableData', JSON.stringify([
        {
          name: this.uploadedFile.name,
          type: this.uploadedFileType,
          size: this.uploadedFile.size,
          elements: 'Обработанные элементы',
          preset: this.selectedOption,
          uploadDate: new Date().toISOString()
        }
      ]));
    }

    // Даем небольшую задержку чтобы пользователь увидел 100%
    setTimeout(() => {
      this.messageService.clear('confirm');
      this.visible = false;
      this.isProcessing = false;
      this.router.navigate(['/table']).then(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    }, 800);
  }

  onClose() {
    this.cleanup();
    this.visible = false;
    this.isProcessing = false;
    this.progress = 0;
  }

  getPresetLabel(preset: string | null): string {
    switch (preset) {
      case 'basic':
        return this.translate.instant('SETTINGS_UPLOAD.BASIC');
      case 'advanced':
        return this.translate.instant('SETTINGS_UPLOAD.ADVANCED');
      case 'custom':
        return this.translate.instant('SETTINGS_UPLOAD.CUSTOM');
      case 'full':
        return this.translate.instant('SETTINGS_UPLOAD.FULL');
      default:
        return this.translate.instant('SETTINGS_UPLOAD.BASIC');
    }
  }

  getPresetStyle(preset: string | null): { [key: string]: string } {
    switch (preset) {
      case 'basic':
        return {background: 'rgba(255, 102, 0, 0.1)', color: '#FF6600', borderColor: 'rgba(255, 102, 0, 0.3)'};
      case 'advanced':
        return {background: 'rgba(255, 133, 51, 0.1)', color: '#FF8533', borderColor: 'rgba(255, 133, 51, 0.3)'};
      case 'custom':
        return {background: 'rgba(255, 163, 102, 0.1)', color: '#FFA366', borderColor: 'rgba(255, 163, 102, 0.3)'};
      case 'full':
        return {background: 'rgba(255, 193, 182, 0.1)', color: '#FFA399', borderColor: 'rgba(255, 193, 152, 0.3)'};
      default:
        return {background: 'rgba(255, 102, 0, 0.1)', color: '#FF6600', borderColor: 'rgba(255, 102, 0, 0.3)'};
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onPresetChange(preset: string) {
    this.selectedOption = preset;
    localStorage.setItem('settings-upload-preset', preset);
    this.cdr.markForCheck();
  }

  onColumnsChange(event: { preset: string }) {
    this.selectedOption = event.preset;
    localStorage.setItem('settings-upload-preset', event.preset);
    this.cdr.markForCheck();
  }
}
