import { Component } from '@angular/core';
import { NotificationComponent } from './components/notification/notification.component';
import { MatCardModule } from '@angular/material/card';
import { provideAnimations } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NotificationComponent, MatCardModule],
  template: `
    <mat-card>
      <mat-card-content>
        <app-notification></app-notification>
      </mat-card-content>
    </mat-card>
  `,
})
export class AppComponent { }