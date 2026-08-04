import { computed, Directive, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

export type AppLinkVariant = 'default' | 'muted' | 'inverse';

@Directive({
	selector: 'a[app-link]',
	host: {
		'[class]': 'hostClasses()',
	},
})
export class AppLinkDirective {
	public readonly variant = input<AppLinkVariant>('default');

	protected readonly hostClasses = computed((): string => {
		const variants: Record<AppLinkVariant, string> = {
			default: 'text-text-link hover:underline',
			muted: 'text-text-muted hover:text-text-primary hover:underline',
			inverse: 'text-text-inverse hover:underline',
		};

		return joinClasses(
			'inline-flex items-center gap-1 text-sm font-medium motion-safe:transition-colors',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 rounded-sm-sm',
			variants[this.variant()],
		);
	});
}
