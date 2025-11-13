import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {SelectModule} from 'primeng/select';
import {FormsModule} from '@angular/forms';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {filter, Subscription} from 'rxjs';
import {LanguageService} from '../../../core/language.service';

interface LanguageOption {
  code: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    SelectModule,
    FormsModule,

  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  menuOpen: boolean = false;
  currentRoute: string = '';

  languageService = inject(LanguageService);
  translate = inject(TranslateService);
  router = inject(Router);
  selectStyleOption={
    select: {
      option: {
        selectedBackground: '#FF6600', // активный/выбранный фон
        hoverBackground: '#FFD5B3'    // фон при наведении
      },
      panel: {
        background: '#232323',        // фон выпадающего
        border: '#FF6600'             // бордер панельки
      }
    }
  }
  languageOptions: LanguageOption[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
  ];

  selectedLanguage: LanguageOption = this.languageOptions[0];

  private routerSubscription!: Subscription;
  private languageSubscription!: Subscription;

  ngOnInit() {
    // Инициализация выбранного языка
    let currentLang = localStorage.getItem('app-language') || this.languageService.getCurrentLanguage();
    if (!currentLang) currentLang = 'ru';
    this.languageService.setLanguage(currentLang); // Установить язык в сервисе
    this.selectedLanguage = this.languageOptions.find(lang => lang.code === currentLang) || this.languageOptions[0];

    // Инициализация текущего маршрута сразу
    this.currentRoute = this.router.url;

    // Отслеживание изменений маршрута
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });

    // Отслеживание изменений языка
    this.languageSubscription = this.languageService.getLanguage$().subscribe(lang => {
      this.translate.use(lang);
      this.selectedLanguage = this.languageOptions.find(option => option.code === lang) || this.languageOptions[0];
      localStorage.setItem('app-language', lang); // Сохранять язык в localStorage
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  onLanguageChange(event: any) {
    if (event.value && event.value.code) {
      this.languageService.setLanguage(event.value.code);
      localStorage.setItem('app-language', event.value.code); // Сохранять язык при смене
    }
  }

  setLanguage(lang: string) {
    this.languageService.setLanguage(lang);
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute === route;
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }
}
