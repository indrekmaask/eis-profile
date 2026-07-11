import { Component } from '@angular/core';
import { DdsShowcase } from './dds-showcase/dds-showcase';

@Component({
  selector: 'app-profile-root',
  imports: [DdsShowcase],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'profile-mfe';
}
