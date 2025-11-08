import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FilmingTableComponent} from '../../shared/components/scene-table.component';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FilmingTableComponent],
  template: `
      <app-filming-table></app-filming-table>
      `,
  styleUrls: ['./table.component.css'],
})
export class TableComponent {}
