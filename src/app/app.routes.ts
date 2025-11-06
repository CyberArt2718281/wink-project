import {Routes} from '@angular/router';
import {Layout} from './features/layout/layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full'
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'upload',
        loadComponent: () => import('./features/file-upload/file-upload.component').then(m => m.FileUploadComponent)
      },
      {
        path: 'table',
        loadComponent: () => import('./features/table/table.component').then(m => m.TableComponent)
      },
      {
        path: 'export',
        loadComponent: () => import('./features/export/export.component').then(m => m.ExportComponent)
      }
    ]
  }
];
