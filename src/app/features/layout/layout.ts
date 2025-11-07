import {Component} from '@angular/core';
import {Header} from '../../shared/layout/header/header';
import {Footer} from '../../shared/layout/footer/footer';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [Header, Footer, RouterModule],
  templateUrl: './layout.html',
})
export class Layout {

}
