import {Component, OnInit} from '@angular/core';
import {Header} from '../header/header';
import {Footer} from '../footer/footer';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [Header, Footer, RouterModule, CommonModule],
  templateUrl: './layout.html',
})
export class Layout implements OnInit {
  isLoading = true;

  ngOnInit(): void {
    // Даем Angular время на инициализацию, затем убираем loader
    setTimeout(() => {
      this.isLoading = false;
    }, 0);
  }
}
