import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <div
        *ngFor="let toast of toasts$ | async"
        [ngClass]="{
          'bg-green-500': toast.type === 'success',
          'bg-red-500': toast.type === 'error',
          'bg-blue-500': toast.type === 'info',
          'bg-yellow-500': toast.type === 'warning'
        }"
        class="text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div class="flex items-center gap-3">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span>{{ toast.message }}</span>
        </div>
        <button
          (click)="onClose(toast.id)"
          class="flex-shrink-0 hover:opacity-75 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class ToastContainerComponent implements OnInit {
  private toastService = inject(ToastService);
  toasts$: Observable<Toast[]>;

  ngOnInit(): void {
    this.toasts$ = this.toastService.getToasts();
  }

  onClose(id: string): void {
    this.toastService.removeToast(id);
  }
}
