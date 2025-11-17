import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-internal-server-error',
  standalone: true,
  imports: [ButtonModule, TranslateModule, RouterModule],
  templateUrl: './internal-server-error.component.html',
  styleUrls: ['./internal-server-error.component.css'],
})
export class InternalServerErrorComponent implements OnInit {
  private router = inject(Router);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  ngOnInit(): void {
    const currentLang =
      localStorage.getItem('app-language') ?? this.languageService.getCurrentLanguage() ?? 'ru';
    this.translate.use(currentLang);
  }

  goHome(): void {
    // Очищаем состояние ошибки перед переходом на главную
    localStorage.removeItem('processedTableData');
    localStorage.removeItem('jobId');
    this.router.navigate(['/']);
  }

  reloadPage(): void {
    // Очищаем состояние ошибки перед перезагрузкой
    localStorage.removeItem('processedTableData');
    localStorage.removeItem('jobId');
    // Устанавливаем флаг, чтобы перенаправить на главную после перезагрузки
    localStorage.setItem('redirectAfterReload', 'true');
    // Небольшая задержка для гарантии очистки, затем перезагружаем
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  contactSupport(): void {
    console.log('Contact support');
  }
}
