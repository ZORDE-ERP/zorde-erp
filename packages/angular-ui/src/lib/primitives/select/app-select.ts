import { computed, Directive, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

@Directive({
	selector: 'select[app-select]',
	host: {
		'[class]': 'hostClasses()',
		'[attr.aria-invalid]': 'invalid() ? "true" : null',
	},
})
export class AppSelectDirective {
	public readonly invalid = input(false);

	protected readonly hostClasses = computed((): string => {
		return joinClasses(
			'flex h-11 w-full rounded-sm border bg-surface px-3 py-2 text-sm text-text-primary',
			'motion-safe:transition-colors',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
			'disabled:cursor-not-allowed disabled:opacity-50',
			this.invalid() ? 'border-error' : 'border-border-strong',
		);
	});
}
