import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  analyze(file: File): Observable<any> {
    // Заглушка: имитируем анализ файла с задержкой
    const fakeResult = {
      scenes: [
        { id: 1, name: 'Сцена 1', elements: ['A', 'B'] },
        { id: 2, name: 'Сцена 2', elements: ['C', 'D'] }
      ],
      summary: 'Анализ завершён успешно'
    };
    return of(fakeResult).pipe(delay(2000));
  }
}
