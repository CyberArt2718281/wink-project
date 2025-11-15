import { Routes } from '@angular/router';
import { TableDataGuard } from './core/guard/table-data.guard';
import { NotFoundComponent } from './features/404/not-found.component';
import { InternalServerErrorComponent } from './features/505/internal-server-error.component';
import { FileUploadComponent } from './features/file-upload/file-upload.component';
import { Layout } from './shared/layout/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        component: FileUploadComponent,
      },
      {
        path: 'table',
        canActivate: [TableDataGuard],
        loadComponent: () =>
          import('./features/table/table.component').then((m) => m.TableComponent),
      },
    ],
  },
  {
    path: 'error/404',
    component: NotFoundComponent,
  },
  {
    path: 'error/500',
    component: InternalServerErrorComponent,
  },
  {
    path: '505',
    component: InternalServerErrorComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
