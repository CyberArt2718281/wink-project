import {Routes} from '@angular/router';
import {Layout} from './shared/layout/layout/layout';
import {FileUploadComponent} from './features/file-upload/file-upload.component';
import {serverErrorGuard} from './core/guard/server-error.guard';

export const routes: Routes = [

  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        component: FileUploadComponent
      },
      {
        path: 'table',
        loadComponent: () => import('./features/table/table.component').then(m => m.TableComponent)
      },
      {
        path: '404',
        loadComponent: () => import('./features/404/not-found.component').then(m => m.NotFoundComponent)
      },
      {
        path: '505',
        canActivate: [serverErrorGuard],
        loadComponent: () => import('./features/505/internal-server-error.component').then(m => m.InternalServerErrorComponent),
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }

];
