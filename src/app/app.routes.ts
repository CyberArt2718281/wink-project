import {Routes} from '@angular/router';
import {Layout} from './features/layout/layout';

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
        loadComponent: () => import('./features/file-upload/file-upload.component').then(m => m.FileUploadComponent)
      },
      {
        path: 'table',
        loadComponent: () => import('./features/table/table.component').then(m => m.TableComponent)
      },


    ]
  }
];
