import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterModule],
})
export class App implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {
    // Если был флаг перезагрузки с 505 страницы, перенаправляем на главную
    if (localStorage.getItem('redirectAfterReload') === 'true') {
      localStorage.removeItem('redirectAfterReload');
      this.router.navigate(['/']);
    }
  }
}
