import { Component, OnInit } from '@angular/core';
import { AppStore, Notification } from '../../core/store/app.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  template: `
    <div class="notifications-container">
      <div *ngFor="let notification of notifications$ | async"
           class="notification"
           [ngClass]="notification.type"
           (click)="dismissNotification(notification.id)">
        <mat-icon>{{getIcon(notification.type)}}</mat-icon>
        <span class="message">{{notification.message}}</span>
        <button mat-icon-button class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .notification {
      display: flex;
      align-items: center;
      padding: 12px 24px;
      margin-bottom: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .notification.success {
      background-color: #4caf50;
      color: white;
    }

    .notification.error {
      background-color: #f44336;
      color: white;
    }

    .notification.warning {
      background-color: #ff9800;
      color: white;
    }

    .notification.info {
      background-color: #2196f3;
      color: white;
    }

    .message {
      margin: 0 12px;
    }

    .close-button {
      margin-left: auto;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<Notification[]>;

  constructor(private appStore: AppStore) {
    this.notifications$ = this.appStore.getState().pipe(
      map(state => state.notifications)
    );
  }

  ngOnInit(): void {}

  dismissNotification(id: number) {
    this.appStore.removeNotification(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notification_important';
    }
  }
}


