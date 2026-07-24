import { computed, Directive, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

@Directive({
	selector: 'input[app-checkbox]',
	host: {
		'[class]': 'hostClasses()',
		type: 'checkbox',
	},
})
export class AppCheckboxDirective {
	/** Visual error state. Named `hasError` so it does not collide with FormField's reserved `invalid` input. */
	public readonly hasError = input(false);

	protected readonly hostClasses = computed((): string => {
		return joinClasses(
			'h-5 w-5 rounded border border-border-strong text-primary',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
			'disabled:cursor-not-allowed disabled:opacity-50',
			this.hasError() ? 'border-error' : null,
		);
	});
}
