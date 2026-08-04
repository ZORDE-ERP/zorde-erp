import { computed, Directive, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

@Directive({
	selector: 'select[app-select]',
	host: {
		'[class]': 'hostClasses()',
		'[attr.aria-invalid]': 'hasError() ? "true" : null',
	},
})
export class AppSelectDirective {
	/** Visual error state. Named `hasError` so it does not collide with FormField's reserved `invalid` input. */
	public readonly hasError = input(false);

	protected readonly hostClasses = computed((): string => {
		return joinClasses(
			'flex h-11 w-full rounded-sm-sm border bg-surface px-3 py-2 text-sm text-text-primary',
			'motion-safe:transition-colors',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
			'disabled:cursor-not-allowed disabled:opacity-50',
			this.hasError() ? 'border-error' : 'border-border-strong',
		);
	});
}
