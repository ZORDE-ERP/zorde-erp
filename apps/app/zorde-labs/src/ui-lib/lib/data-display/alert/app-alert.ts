import { Component, computed, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

export type AppAlertVariant = 'info' | 'success' | 'warning' | 'error';

@Component({
	selector: 'app-alert',
	templateUrl: './app-alert.html',
})
export class AppAlertComponent {
	public readonly variant = input<AppAlertVariant>('info');
	public readonly title = input<string>();

	protected readonly hostClasses = computed((): string => {
		const variants: Record<AppAlertVariant, string> = {
			info: 'border-info bg-info-muted text-info-foreground',
			success: 'border-success bg-success-muted text-success-foreground',
			warning: 'border-warning bg-warning-muted text-warning-foreground',
			error: 'border-error bg-error-muted text-error-foreground',
		};

		return joinClasses('rounded-sm border px-4 py-3 text-sm', variants[this.variant()]);
	});
}
