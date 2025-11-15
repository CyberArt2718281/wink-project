import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-internal-server-error',
  standalone: true,
  imports: [ButtonModule, TranslateModule, RouterModule],
  templateUrl: './internal-server-error.component.html',
  styleUrls: ['./internal-server-error.component.css'],
})
export class InternalServerErrorComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }

  reloadPage() {
    window.location.reload();
  }

  contactSupport() {
    // Здесь можно добавить логику для связи с поддержкой
    console.log('Contact support');
  }
}
