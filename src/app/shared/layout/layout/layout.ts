import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

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
