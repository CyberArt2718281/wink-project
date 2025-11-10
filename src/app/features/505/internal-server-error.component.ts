import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-internal-server-error',
  standalone: true,
  imports: [ButtonModule, TranslateModule,RouterModule],
  templateUrl: './internal-server-error.component.html',

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
