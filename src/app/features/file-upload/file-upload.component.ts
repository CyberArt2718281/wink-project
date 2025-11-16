import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PostPreset } from '../../../types/Preset/presetType.type';
import { LanguageService } from '../../core/language.service';
import {
  FileProcessing,
  FileProcessingError,
  FileProcessingProgress,
} from '../../shared/services/file-processing';
import { SharedModule } from '../../shared/shared-module';
import { SettingsUpload } from './settings-upload/settings-upload';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [SharedModule, SettingsUpload, CommonModule, TranslateModule, DialogModule],
  providers: [MessageService],
  styleUrls: ['./file-upload.component.css'],
  templateUrl: './file-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  isDragOver = false;
  uploadedFile: File | null = null;
  uploadedFileType: string | null = null;
  progress: number = 0;
  progressMessage: string = '';
  progressStage: string = 'analyzing';
  visible: boolean = false;
  error: string | null = null;
  selectedOption: string | null = null;
  selectedColumns: string[] = [];
  isProcessing: boolean = false;
  showCancelDialog: boolean = false;
  isFileInputDisabled: boolean = false;

  private cancel$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private processingSubscription: any = null;
  private timeOut: ReturnType<typeof setTimeout> | null = null;
  private timeouts: Set<ReturnType<typeof setTimeout>> = new Set();

  private readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  languageService = inject(LanguageService);
  translate = inject(TranslateService);
  fileProcessing = inject(FileProcessing);

  constructor() {
    this.languageService
      .getLanguage$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang) => {
        this.translate.use(lang);
        if (this.visible && !this.error) {
          this.updateProcessingMessage();
        }
      });
  }

  ngOnInit(): void {
    this.selectedOption = localStorage.getItem('settings-upload-preset') ?? 'basic';
    this.selectedColumns = JSON.parse(localStorage.getItem('settings-upload-columns') ?? '[]');
    this.timeOut = setTimeout(() => this.cdr.markForCheck(), 0);
  }

  ngOnDestroy(): void {
    this.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
    this.cancel$.complete();
  }

  private updateProcessingMessage(): void {
    this.translate.get('UPLOAD.PROCESSING').subscribe((processingText: string) => {
      this.messageService.clear('confirm');
      this.messageService.add({
        key: 'confirm',
        sticky: true,
        severity: 'custom',
        summary: processingText,
        styleClass: 'backdrop-blur-lg rounded-2xl',
      });
    });
  }

  private cleanup(): void {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
    this.processingSubscription?.unsubscribe();
    this.processingSubscription = null;
    // Очищаем все ожидающие таймауты
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  showCancelConfirmation(): void {
    this.showCancelDialog = true;
    this.cdr.markForCheck();
  }

  hideCancelConfirmation(): void {
    this.showCancelDialog = false;
    this.cdr.markForCheck();
  }

  confirmCancel(): void {
    this.hideCancelConfirmation();
    this.cancel$.next();
    this.onClose();
  }

  triggerFileInput(): void {
    if (!this.isFileInputDisabled) {
      this.fileInput?.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent): void {
    if (!this.isFileInputDisabled) {
      event.preventDefault();
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!this.isFileInputDisabled && file) {
      this.processFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
      input.value = '';
    }
  }

  processFile(file: File): void {
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
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
    this.cdr.markForCheck();

    setTimeout(() => {
      document
        .getElementById('file-info-block')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  showError(message: string): void {
    this.error = message;
    const errorTitle = this.translate.instant('UPLOAD.ERROR_TITLE');

    this.messageService.clear('confirm');
    this.visible = false;
    this.isProcessing = false;
    this.progress = 0;
    this.isFileInputDisabled = false;
    this.uploadedFile = null;
    this.uploadedFileType = null;
    this.cdr.markForCheck();

    this.messageService.add({
      key: 'error',
      severity: 'error',
      summary: errorTitle,
      detail: message,
      life: 5000,
      styleClass:
        'bg-[#1A1A1A] text-white border border-[#FF6600]/20 rounded-xl backdrop-blur-lg text-sm',
    });
  }

  processData(): void {
    if (!this.uploadedFile) {
      this.showError('Файл не выбран');
      return;
    }

    this.isProcessing = true;
    this.isFileInputDisabled = true;
    this.progress = 10;
    this.visible = true;
    this.error = null;
    this.cdr.markForCheck();

    const processingTitle = this.translate.instant('UPLOAD.PROCESSING');
    this.messageService.add({
      key: 'confirm',
      sticky: true,
      severity: 'custom',
      summary: processingTitle,
      styleClass: 'backdrop-blur-lg rounded-2xl',
    });

    this.cleanup();
    this.cancel$ = new Subject<void>();

    const config: PostPreset = {
      preset: (this.selectedOption ?? 'basic') as 'basic' | 'extended' | 'full' | 'custom',
      ...(this.selectedOption === 'custom' && { custom_columns: this.selectedColumns }),
    };

    this.processingSubscription = this.fileProcessing
      .processFile(
        this.uploadedFile,
        config,
        (progressData: FileProcessingProgress) => this.updateProgress(progressData),
        this.cancel$
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => this.completeProcessing(result),
        error: (error: FileProcessingError | any) => {
          if (error?.isCancelled) {
            this.onClose();
            return;
          }
          this.showError(error?.message ?? this.translate.instant('UPLOAD.ERROR_UNKNOWN'));
        },
      });
  }

  private updateProgress(progressData: FileProcessingProgress): void {
    this.progress = Math.round(progressData.progress);
    this.progressMessage = progressData.message;
    this.progressStage = progressData.stage;
    this.cdr.markForCheck();
  }

  private completeProcessing(result: any): void {
    this.progress = 100;
    this.cdr.markForCheck();

    const processedData = {
      job_id: result.job_id,
      preset: result.preset,
      columns: result.requested_columns,
      table: result.table,
      metadata: result.metadata,
      uploadedFileName: this.uploadedFile?.name,
      uploadedFileType: this.uploadedFileType,
      processedAt: new Date().toISOString(),
    };

    localStorage.setItem('processedTableData', JSON.stringify(processedData));
    localStorage.setItem('jobId', result.job_id);

    // Обновляем стадию на 'retrieving' с небольшой задержкой
    const timeout1 = setTimeout(() => {
      this.progressStage = 'retrieving';
      this.cdr.markForCheck();
      this.timeouts.delete(timeout1);
    }, 100);
    this.timeouts.add(timeout1);

    const timeout2 = setTimeout(() => {
      this.cleanup();
      this.messageService.clear('confirm');
      this.visible = false;
      this.isProcessing = false;
      this.progress = 0;
      this.uploadedFile = null;
      this.uploadedFileType = null;
      this.isFileInputDisabled = false;

      this.router.navigate(['/table']).then(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
      this.timeouts.delete(timeout2);
    }, 800);
    this.timeouts.add(timeout2);
  }

  onClose(): void {
    if (this.isProcessing) {
      this.cancel$.next();
    }

    this.cleanup();
    this.visible = false;
    this.isProcessing = false;
    this.progress = 0;
    this.progressStage = 'analyzing';
    this.progressMessage = '';
    this.messageService.clear('confirm');
    this.isFileInputDisabled = false;
    this.cdr.markForCheck();
  }

  getPresetLabel(preset: string | null): string {
    const labels: { [key: string]: string } = {
      basic: 'SETTINGS_UPLOAD.BASIC',
      extended: 'SETTINGS_UPLOAD.ADVANCED',
      custom: 'SETTINGS_UPLOAD.CUSTOM',
      full: 'SETTINGS_UPLOAD.FULL',
    };
    return this.translate.instant(labels[preset ?? 'basic'] ?? labels['basic']);
  }

  getPresetStyle(preset: string | null): { [key: string]: string } {
    const styles: { [key: string]: { [key: string]: string } } = {
      basic: {
        background: 'rgba(255, 102, 0, 0.1)',
        color: '#FF6600',
        borderColor: 'rgba(255, 102, 0, 0.3)',
      },
      extended: {
        background: 'rgba(255, 133, 51, 0.1)',
        color: '#FF8533',
        borderColor: 'rgba(255, 133, 51, 0.3)',
      },
      custom: {
        background: 'rgba(255, 163, 102, 0.1)',
        color: '#FFA366',
        borderColor: 'rgba(255, 163, 102, 0.3)',
      },
      full: {
        background: 'rgba(255, 193, 182, 0.1)',
        color: '#FFA399',
        borderColor: 'rgba(255, 193, 152, 0.3)',
      },
    };
    return styles[preset ?? 'basic'] ?? styles['basic'];
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onPresetChange(preset: string): void {
    this.selectedOption = preset;
    localStorage.setItem('settings-upload-preset', preset);
    this.cdr.markForCheck();
  }

  onColumnsChange(event: { preset: string }): void {
    this.selectedOption = event.preset;
    localStorage.setItem('settings-upload-preset', event.preset);
    this.cdr.markForCheck();
  }
}
