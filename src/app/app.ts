import {Component, signal} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports:[RouterModule],
})
export class App {
  protected readonly title = signal('wink-project');

}
