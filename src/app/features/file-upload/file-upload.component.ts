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

  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  languageService = inject(LanguageService);
  translate = inject(TranslateService);

  constructor() {
    this.languageService.getLanguage$().subscribe(lang => {
      this.translate.use(lang);
      // Если тост активен, обновить summary
      if (this.visible && !this.error) {
        this.translate.get('UPLOAD.LOADING').subscribe((loadingText: string) => {
          this.messageService.clear('confirm');
          this.messageService.add({
            key: 'confirm',
            sticky: true,
            severity: 'custom',
            summary: loadingText,
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
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.timeOut) {
      clearTimeout(this.timeOut);
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
    this.showLoaderToast();
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
  }

  showLoaderToast() {
    if (!this.visible && !this.error) {
      this.messageService.add({
        key: 'confirm',
        sticky: true,
        severity: 'custom',
        summary: this.translate.instant('UPLOAD.LOADING'),
        styleClass: 'backdrop-blur-lg rounded-2xl'
      });
      this.visible = true;
      this.progress = 0;

      if (this.interval) {
        clearInterval(this.interval);
      }

      this.interval = setInterval(() => {
        if (this.progress < 100) {
          this.progress = this.progress + 20;
        }
        if (this.progress >= 100) {
          this.progress = 100;
          clearInterval(this.interval);
          setTimeout(() => {
            this.messageService.clear('confirm');
            this.visible = false;
            this.cdr.markForCheck();
          }, 800);
        }
        this.cdr.markForCheck();
      }, 600);
    }
  }

  onClose() {
    this.visible = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.uploadedFile = null;
    this.uploadedFileType = null;
    this.error = null;
  }

  proceedToTable() {
    if (!this.uploadedFile) return;
    localStorage.setItem('tableData', JSON.stringify([
      {
        name: this.uploadedFile.name,
        type: this.uploadedFileType,
        size: this.uploadedFile.size,
        elements: 'Моковые элементы'
      }
    ]));
    this.router.navigate(['/table']);
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
