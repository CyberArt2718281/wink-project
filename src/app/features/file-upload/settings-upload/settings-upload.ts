import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';

@Component({
  selector: 'app-settings-upload',
  standalone: true,
  imports: [FormsModule,ButtonModule],
  templateUrl: './settings-upload.html',
  styleUrl: './settings-upload.css',
})
export class SettingsUpload {
  modalOpen = false;
  selectedPreset: string = 'basic';
  @Output() presetChange = new EventEmitter<string>();

  constructor() {
    const savedPreset = localStorage.getItem('settings-upload-preset');
    if (savedPreset) {
      this.selectedPreset = savedPreset;
    }
  }

  openModal() {
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  saveSettings() {
    localStorage.setItem('settings-upload-preset', this.selectedPreset);
    this.presetChange.emit(this.selectedPreset);
    this.closeModal();
  }


}
