import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Store} from '@ngrx/store';
import {startAnalysis} from '../../store/script/actions';
import {selectAnalysisResult, selectLoading} from '../../store/script/selectors';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analysis-container">
      <h2>Анализ файла</h2>
      <div *ngIf="loading$ | async" class="progress">Обработка файла...</div>
      <div *ngIf="result$ | async as result">
        <div>Этапы анализа завершены!</div>
        <div>Результат: {{ result.summary }}</div>
        <button (click)="goToTable()">Перейти к таблице</button>
      </div>
    </div>
  `,
  styles: [`
    .analysis-container { padding: 2rem; border: 1px solid #ccc; border-radius: 8px; }
    .progress { color: #007bff; margin-top: 1rem; }
  `]
})
export class AnalysisComponent {
  private store = inject(Store);
  private router = inject(Router);
  loading$: Observable<boolean> = this.store.select(selectLoading);
  result$: Observable<any> = this.store.select(selectAnalysisResult);

  constructor() {
    // Имитация запуска анализа при входе на страницу
    this.store.dispatch(startAnalysis({ file: null as any })); // file берётся из store, заглушка
  }

  goToTable() {
    this.router.navigate(['/table']);
  }
}

