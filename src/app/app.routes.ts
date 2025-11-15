import {Routes} from '@angular/router';
import {Layout} from './shared/layout/layout/layout';
import {FileUploadComponent} from './features/file-upload/file-upload.component';
import {TableDataGuard} from './core/guard/table-data.guard';


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
        canActivate: [TableDataGuard],
        loadComponent: () => import('./features/table/table.component').then(m => m.TableComponent)
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }

];
