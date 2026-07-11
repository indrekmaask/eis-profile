import { Component } from '@angular/core';
import { ProfilePage } from './profile/profile-page';

@Component({
  selector: 'app-profile-root',
  imports: [ProfilePage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'profile-mfe';
}
