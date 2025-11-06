import {ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {Toast} from 'primeng/toast';
import {ButtonModule} from 'primeng/button';
import {MessageService} from 'primeng/api';
import {ProgressBar} from 'primeng/progressbar';
import {SettingsUpload} from './settings-upload/settings-upload';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [Toast, ButtonModule, ProgressBar, SettingsUpload, CommonModule],
  providers: [MessageService],
  styleUrls: ['./file-upload.component.css'],
  template: `
    <p-toast position="top-center" key="confirm" (onClose)="onClose()" [baseZIndex]="5000">
      <ng-template let-message #headless let-closeFn="closeFn">
        <section class="flex flex-col p-4 gap-4 w-full bg-primary/70 rounded-xl">
          <div class="flex items-center gap-5">
            <i class="pi pi-cloud-upload text-white dark:text-black text-2xl"></i>
            <span class="font-bold text-base text-white dark:text-black">{{ message.summary }}</span>
          </div>
          <div class="flex flex-col gap-2">
            @if(!error){
              <p-progressbar [value]="progress" [showValue]="false" [style]="{ height: '4px' }" class="!bg-primary/80"></p-progressbar>
              <label class="text-sm font-bold text-white dark:text-black">{{ progress }}% загружено</label>
            }
          </div>
          <div class="flex gap-4 mb-4 justify-end">
            <p-button label="Отмена" (click)="closeFn($event)" size="small" />
          </div>
        </section>
      </ng-template>
    </p-toast>
    <p-toast position="top-center" key="error" [baseZIndex]="6000"></p-toast>
    <div class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 rounded-xl p-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Загрузка файла (PDF/DOCX)</h2>

      <div class="mb-4 w-full flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-block px-3 py-1 rounded-lg text-sm font-medium shadow-sm"
                [ngStyle]="getPresetStyle(selectedOption)">
            Пресет: <span class="font-bold">{{ getPresetLabel(selectedOption) }}</span>
          </span>
        </div>
        <app-settings-upload (presetChange)="onPresetChange($event)"></app-settings-upload>
      </div>
      <div
        class="w-full flex flex-col items-center justify-center h-40 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer transition hover:border-blue-600 bg-white mb-4 relative"
        (drop)="onDrop($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        [class.bg-blue-50]="isDragOver"
      >
        <svg class="w-12 h-12 text-blue-400 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round"/>
          <rect x="4" y="16" width="16" height="4" rx="2" fill="currentColor"/>
        </svg>
        <span class="text-gray-500 p-4">Перетащите файл сюда или выберите на устройстве</span>
        <input #fileInput type="file" class="absolute inset-0 opacity-0 cursor-pointer file-upload__choose-input"
               (change)="onFileSelected($event)" accept=".pdf,.docx" [disabled]="visible"/>
      </div>

      <button class="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold file-upload__choose-btn"
              (click)="triggerFileInput()" [disabled]="visible">Выбрать файл</button>
      @if (uploadedFile && !visible) {
        <div class="mt-4 text-center">
          <p class="text-gray-800 font-semibold">Загруженный файл:</p>
          <p class="text-gray-700">{{ uploadedFile.name }} ({{ uploadedFileType }})</p>
          <button
            class="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition font-semibold"
            (click)="proceedToTable()">Перейти к таблице
          </button>
        </div>
      }
    </div>
  `,
  styles: []
})
export class FileUploadComponent implements  OnInit{
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  isDragOver = false;
  uploadedFile: File | null = null;
  uploadedFileType: string | null = null;
  progress: number = 0;
  visible: boolean = false;
  interval: any = null;
  error: string | null = null;
  selectedOption: string | null = null;
  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);

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
  ngOnInit(){
    this.selectedOption = localStorage.getItem('settings-upload-preset') || 'basic';
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
      this.error = 'Файл должен быть PDF или DOCX';
      this.messageService.add({
        key: 'error',
        severity: 'error',
        summary: 'Ошибка',
        detail: this.error,
        life: 3000,
        styleClass: 'bg-black text-white rounded-xl',
      });
      this.visible = false;
      this.uploadedFile = null;
      this.uploadedFileType = null;
      return;
    }
    if (file.size > 20 * 1024 * 1024) { // 20MB лимит
      this.error = 'Файл слишком большой (максимум 20MB)';
      this.messageService.add({
        key: 'error',
        severity: 'error',
        summary: 'Ошибка',
        detail: this.error,
        life: 3000,
        styleClass: 'bg-black text-white rounded-xl',
      });
      this.visible = false;
      this.uploadedFile = null;
      this.uploadedFileType = null;
      return;
    }
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      this.error = 'Неверное расширение файла';
      this.messageService.add({
        key: 'error',
        severity: 'error',
        summary: 'Ошибка',
        detail: this.error,
        life: 3000,
        styleClass: 'bg-black text-white rounded-xl',
      });
      this.visible = false;
      this.uploadedFile = null;
      this.uploadedFileType = null;
      return;
    }
    this.error = null;
    this.uploadedFile = file;
    this.uploadedFileType = file.type === 'application/pdf' ? 'PDF' : 'DOCX';
    this.showLoaderToast();
  }

  showLoaderToast() {
    if (!this.visible && !this.error) {
      this.messageService.add({
        key: 'confirm',
        sticky: true,
        severity: 'custom',
        summary: 'Загрузка файла...',
        styleClass: 'backdrop-blur-lg rounded-2xl',
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
      {name: this.uploadedFile.name, elements: 'Моковые элементы'}
    ]));
    window.location.href = '/table';
  }

  getPresetLabel(preset: string | null): string {
    switch (preset) {
      case 'basic': return 'Базовый';
      case 'advanced': return 'Расширенный';
      case 'full': return 'Полный';
      default: return 'Базовый';
    }
  }

  getPresetStyle(preset: string | null): {[key: string]: string} {
    switch (preset) {
      case 'basic':
        return { background: '#dbeafe', color: '#2563eb' };
      case 'advanced':
        return { background: '#fef9c3', color: '#ca8a04' };
      case 'full':
        return { background: '#dcfce7', color: '#22c55e' };
      default:
        return { background: '#dbeafe', color: '#2563eb' };
    }
  }

  onPresetChange(preset: string) {
    this.selectedOption = preset;
    this.cdr.markForCheck();
  }
}
