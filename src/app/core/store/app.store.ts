import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IAppState {
  loading: boolean;
  error: string | null;
  notifications: Notification[];
}

export interface INotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  private state = new BehaviorSubject<AppState>({
    loading: false,
    error: null,
    notifications: []
  });

  constructor() {
    // Initialisation du store
  }

  // Actions
  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  addNotification(notification: Omit<Notification, 'id'>): void {
    const notifications = [
      ...this.state.value.notifications,
      {
        ...notification,
        id: Date.now()
      }
    ];
    this.updateState({ notifications });
  }

  removeNotification(id: number): void {
    const notifications = this.state.value.notifications.filter(n => n.id !== id);
    this.updateState({ notifications });
  }

  // Getters
  getState() {
    return this.state.asObservable();
  }

  private updateState(partialState: Partial<AppState>): void {
    this.state.next({
      ...this.state.value,
      ...partialState
    });
  }
}




// Auto-generated aliases for backward compatibility
export type AppState = IAppState;
export type Notification = INotification;
