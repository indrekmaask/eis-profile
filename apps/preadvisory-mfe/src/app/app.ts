import { Component } from '@angular/core';
import { PreAdvisory } from './pre-advisory/pre-advisory';

@Component({
  selector: 'app-preadvisory-root',
  imports: [PreAdvisory],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'preadvisory-mfe';
}
