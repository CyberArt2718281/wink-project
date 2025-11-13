import {Routes} from '@angular/router';
import {Layout} from './shared/layout/layout/layout';
import {FileUploadComponent} from './features/file-upload/file-upload.component';

export const routes: Routes = [

  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'upload',
        pathMatch: 'full'
      },
      {
        path: 'upload',
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
        loadComponent: () => import('./features/505/internal-server-error.component').then(m => m.InternalServerErrorComponent)
      },
    ]
  },
  {
    path: '**',
    redirectTo: '404',
  }

];
