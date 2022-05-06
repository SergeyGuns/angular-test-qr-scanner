import { Component } from '@angular/core';
import { PATHS } from './app.routes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-webcam-scanner';
  PATHS = PATHS
}
