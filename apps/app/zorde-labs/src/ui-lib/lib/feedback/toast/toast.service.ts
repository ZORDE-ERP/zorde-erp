import { Injectable, signal } from '@angular/core';
import type { AppToast, AppToastVariant } from './toast.model';

@Injectable({ providedIn: 'root' })
export class AppToastService {
	private nextId = 0;

	public readonly toasts = signal<readonly AppToast[]>([]);

	public show(message: string, variant: AppToastVariant = 'info'): void {
		const toast: AppToast = {
			id: `toast-${this.nextId++}`,
			message,
			variant,
		};

		this.toasts.update((current) => [...current, toast]);

		globalThis.setTimeout(() => {
			this.dismiss(toast.id);
		}, 4000);
	}

	public dismiss(id: string): void {
		this.toasts.update((current) => current.filter((toast) => toast.id !== id));
	}
}
