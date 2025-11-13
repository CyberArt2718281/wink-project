import {Component} from '@angular/core';
import {Header} from '../header/header';
import {Footer} from '../footer/footer';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [Header, Footer, RouterModule],
  templateUrl: './layout.html',
})
export class Layout {

}
