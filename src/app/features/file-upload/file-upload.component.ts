import {ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MessageService} from 'primeng/api';
import {SettingsUpload} from './settings-upload/settings-upload';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {SharedModule} from '../../shared/shared-module';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '../../core/language.service';
import {DialogModule} from 'primeng/dialog';
import {FileProcessing, FileProcessingError, FileProcessingProgress} from '../../shared/services/file-processing';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {PostPreset} from '../../../types/Preset/presetType.type';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [SharedModule, SettingsUpload, CommonModule, TranslateModule, DialogModule],
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
  timeOut: any = null;
  error: string | null = null;
  selectedOption: string | null = null;
  selectedColumns: string[] = [];
  isProcessing: boolean = false;
  showCancelDialog: boolean = false;
  isFileInputDisabled: boolean = false;

  // Subject для отмены операции
  private cancel$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private processingSubscription: any = null;

  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  languageService = inject(LanguageService);
  translate = inject(TranslateService);
  fileProcessing = inject(FileProcessing);

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
    this.destroy$.next();
    this.destroy$.complete();
    this.cancel$.complete();
  }

  private cleanup(): void {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
    // Отписываемся от текущей обработки
    if (this.processingSubscription) {
      this.processingSubscription.unsubscribe();
      this.processingSubscription = null;
    }
  }

  // Показать модалку подтверждения отмены
  showCancelConfirmation() {
    this.showCancelDialog = true;
  }

  // Скрыть модалку подтверждения отмены
  hideCancelConfirmation() {
    this.showCancelDialog = false;
  }

  // Подтвердить отмену
  confirmCancel() {
    this.hideCancelConfirmation();
    console.log('🛑 Пользователь подтвердил отмену обработки');
    this.cancel$.next(); // Отправляем сигнал отмены
    this.onClose();
  }

  triggerFileInput() {
    if (!this.isFileInputDisabled) {
      this.fileInput?.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent) {
    if (!this.isFileInputDisabled) {
      event.preventDefault();
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (!this.isFileInputDisabled && event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.processFile(input.files[0]);
    input.value = '';
  }

  /**
   * Шаг 1: Валидация файла
   */
  processFile(file: File) {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Валидация типа
    if (!allowedTypes.includes(file.type)) {
      this.showError(this.translate.instant('UPLOAD.ERROR_TYPE'));
      return;
    }

    // Валидация размера (20 MB)
    if (file.size > 20 * 1024 * 1024) {
      this.showError(this.translate.instant('UPLOAD.ERROR_SIZE'));
      return;
    }

    // Валидация расширения
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
        infoBlock.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }, 100);
  }

  showError(message: string) {
    this.error = message;
    const errorTitle = this.translate.instant('UPLOAD.ERROR_TITLE');

    // Закрываем модалку с прогресс баром
    this.messageService.clear('confirm');
    this.visible = false;
    this.isProcessing = false;
    this.progress = 0;
    this.isFileInputDisabled = false;
    this.uploadedFile = null;
    this.uploadedFileType = null;

    this.cdr.detectChanges();

    // Показываем ошибку в виде тоста
    this.messageService.add({
      key: 'error',
      severity: 'error',
      summary: errorTitle,
      detail: message,
      life: 5000,
      styleClass: 'bg-[#1A1A1A] text-white border border-[#FF6600]/20 rounded-xl backdrop-blur-lg text-sm'
    });
  }

  /**
   * Шаг 2: Инициализация обработки и показ модалки
   */
  processData() {
    if (!this.uploadedFile) {
      this.showError('Файл не выбран');
      return;
    }

    // Инициализация обработки
    this.isProcessing = true;
    this.isFileInputDisabled = true;
    this.progress = Math.round(10);
    this.visible = true;
    this.error = null;

    // Показываем модалку с прогрессом
    const processingTitle = this.translate.instant('UPLOAD.PROCESSING');
    this.messageService.add({
      key: 'confirm',
      sticky: true,
      severity: 'custom',
      summary: processingTitle,
      styleClass: 'backdrop-blur-lg rounded-2xl'
    });

    this.cleanup();

    // Создаем новый Subject для отмены на каждую операцию
    this.cancel$ = new Subject<void>();

    // Создаем конфиг для анализа
    const config: PostPreset = {
      preset: (this.selectedOption || 'basic') as 'basic' | 'extended' | 'full' | 'custom',
      ...(this.selectedOption === 'custom' && {custom_columns: this.selectedColumns})
    };

    console.log('🚀 Начинаем обработку файла:', {
      file: this.uploadedFile.name,
      config: config
    });

    /**
     * Шаг 3-4: Отправка на анализ и опрос результата
     */
    this.processingSubscription = this.fileProcessing.processFile(
      this.uploadedFile,
      config,
      (progressData: FileProcessingProgress) => {
        this.updateProgress(progressData);
      },
      this.cancel$ // Передаем Subject для отмены
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        console.log('✅ Обработка завершена успешно:', result);
        /**
         * Шаг 5: При успехе - сохранение данных в localStorage и переход на /table
         */
        this.completeProcessing(result);
      },
      error: (error: FileProcessingError | any) => {
        // Проверяем, если это отмена пользователем - просто закрываем модалку
        if (error && error.isCancelled) {
          console.log('ℹ️ Операция отменена пользователем');
          this.onClose();
          return;
        }

        console.error('❌ Ошибка при обработке:', error);
        /**
         * Шаг 6: При ошибке - показ красного тоста и очистка
         */
        this.showError(error.message || this.translate.instant('UPLOAD.ERROR_UNKNOWN'));
      }
    });
  }

  /**
   * Обновление прогресса из сервиса
   */
  private updateProgress(progressData: FileProcessingProgress): void {
    this.progress = Math.round(progressData.progress);
    console.log(`📊 Прогресс: ${progressData.stage} - ${this.progress}% - ${progressData.message}`);
    this.cdr.markForCheck();
  }

  /**
   * Шаг 5: Завершение обработки - сохранение данных и переход на таблицу
   */
  private completeProcessing(result: any): void {
    console.log('💾 Сохраняем данные в localStorage...');

    // Сразу устанавливаем 100%
    this.progress = 100;
    this.cdr.markForCheck();

    this.cleanup();

    // Сохраняем обработанные данные в localStorage
    const processedData = {
      job_id: result.job_id,
      preset: result.preset,
      columns: result.requested_columns,
      table: result.table,
      metadata: result.metadata,
      uploadedFileName: this.uploadedFile?.name,
      uploadedFileType: this.uploadedFileType,
      processedAt: new Date().toISOString()
    };

    localStorage.setItem('processedTableData', JSON.stringify(processedData));
    // Также сохраняем jobId отдельно для проверки в guard
    localStorage.setItem('jobId', result.job_id);
    console.log('✅ Данные сохранены в localStorage:', {
      job_id: result.job_id,
      rows: result.table.rows.length
    });

    // Даем время пользователю увидеть 100% прогресс
    setTimeout(() => {
      this.messageService.clear('confirm');
      this.visible = false;
      this.isProcessing = false;
      this.progress = 0;
      this.uploadedFile = null;
      this.uploadedFileType = null;
      this.isFileInputDisabled = false;

      // Переход на страницу таблицы
      console.log('🔄 Переходим на страницу таблицы...');
      this.router.navigate(['/table']).then(() => {
        window.scrollTo({top: 0, behavior: 'auto'});
      });
    }, 800);
  }

  /**
   * Закрыть модалку - отмена операции
   */
  onClose() {
    // Проверяем, есть ли активная обработка
    if (this.isProcessing) {
      console.log('🛑 Отмена обработки файла');
      // Отправляем сигнал отмены
      this.cancel$.next();
    }

    this.cleanup();
    this.visible = false;
    this.isProcessing = false;
    this.progress = 0;
    this.messageService.clear('confirm');
    this.isFileInputDisabled = false;
  }

  getPresetLabel(preset: string | null): string {
    switch (preset) {
      case 'basic':
        return this.translate.instant('SETTINGS_UPLOAD.BASIC');
      case 'extended':
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
