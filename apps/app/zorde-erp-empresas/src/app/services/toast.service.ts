export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  success(message: string, duration = 3000): void {
    this.addToast('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.addToast('error', message, duration);
  }

  info(message: string, duration = 3000): void {
    this.addToast('info', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.addToast('warning', message, duration);
  }

  removeToast(id: string): void {
    const current = this.toasts$.value;
    this.toasts$.next(current.filter(t => t.id !== id));
  }

  private addToast(type: Toast['type'], message: string, duration: number): void {
    const id = this.generateId();
    const toast: Toast = { id, type, message, duration };

    const current = this.toasts$.value;
    this.toasts$.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
