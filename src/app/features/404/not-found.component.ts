import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonModule, TranslateModule,RouterModule],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    window.history.back();
  }
}
