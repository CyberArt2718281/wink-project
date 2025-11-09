import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private currentLang$ = new BehaviorSubject<string>('ru');

  setLanguage(lang: string) {
    this.currentLang$.next(lang);
  }

  getLanguage$() {
    return this.currentLang$.asObservable();
  }

  getCurrentLanguage() {
    return this.currentLang$.getValue();
  }
}

