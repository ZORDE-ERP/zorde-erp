import { Component, computed, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

export type AppBadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

@Component({
	selector: 'app-badge',
	template: `<span [class]="hostClasses()"><ng-content /></span>`,
})
export class AppBadgeComponent {
	public readonly variant = input<AppBadgeVariant>('neutral');

	protected readonly hostClasses = computed((): string => {
		const variants: Record<AppBadgeVariant, string> = {
			neutral: 'bg-surface-muted text-text-secondary',
			primary: 'bg-primary/10 text-primary',
			success: 'bg-success-muted text-success-foreground',
			warning: 'bg-warning-muted text-warning-foreground',
			error: 'bg-error-muted text-error-foreground',
			info: 'bg-info-muted text-info-foreground',
		};

		return joinClasses('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[this.variant()]);
	});
}
