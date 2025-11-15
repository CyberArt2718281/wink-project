import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { filter, Subscription } from 'rxjs';
import { LanguageService } from '../../../core/language.service';

interface LanguageOption {
  code: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule, SelectModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit, OnDestroy {
  menuOpen: boolean = false;
  currentRoute: string = '';

  languageService = inject(LanguageService);
  translate = inject(TranslateService);
  router = inject(Router);

  languageOptions: LanguageOption[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ];

  selectedLanguage: LanguageOption = this.languageOptions[0];

  private routerSubscription!: Subscription;
  private languageSubscription!: Subscription;

  ngOnInit() {
    const currentLang =
      localStorage.getItem('app-language') || this.languageService.getCurrentLanguage() || 'ru';
    this.languageService.setLanguage(currentLang);
    this.selectedLanguage =
      this.languageOptions.find((lang) => lang.code === currentLang) || this.languageOptions[0];

    this.currentRoute = this.router.url;

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });

    this.languageSubscription = this.languageService.getLanguage$().subscribe((lang) => {
      this.translate.use(lang);
      this.selectedLanguage =
        this.languageOptions.find((option) => option.code === lang) || this.languageOptions[0];
      localStorage.setItem('app-language', lang);
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onLanguageChange(event: any): void {
    if (event.value?.code) {
      this.languageService.setLanguage(event.value.code);
      localStorage.setItem('app-language', event.value.code);
    }
  }

  setLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute === route;
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.languageSubscription?.unsubscribe();
  }
}
