import { computed, Directive, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'lg';

@Directive({
	selector: 'button[app-button], a[app-button]',
	host: {
		'[class]': 'hostClasses()',
		'[attr.disabled]': 'isDisabled() || loading() ? true : null',
		'[attr.aria-disabled]': 'isDisabled() || loading() ? "true" : null',
		'[attr.aria-busy]': 'loading() ? "true" : null',
	},
})
export class AppButtonDirective {
	public readonly variant = input<AppButtonVariant>('primary');
	public readonly size = input<AppButtonSize>('md');
	public readonly isDisabled = input(false);
	public readonly loading = input(false);

	protected readonly hostClasses = computed((): string => {
		const base =
			'inline-flex min-h-11 items-center justify-center gap-2 font-medium motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

		const variants: Record<AppButtonVariant, string> = {
			primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
			outline: 'border border-border-strong bg-surface text-text-primary hover:bg-surface-muted',
			ghost: 'bg-transparent text-text-primary hover:bg-surface-muted',
			danger: 'bg-error text-white hover:bg-error/90',
		};

		const sizes: Record<AppButtonSize, string> = {
			sm: 'h-9 rounded-sm-sm px-3 text-sm',
			md: 'h-11 rounded-sm-sm px-4 text-sm',
			lg: 'h-12 rounded-sm-lg px-6 text-base',
		};

		return joinClasses(base, variants[this.variant()], sizes[this.size()]);
	});
}
