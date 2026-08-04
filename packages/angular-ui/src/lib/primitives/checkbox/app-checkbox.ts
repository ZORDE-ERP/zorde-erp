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
	public readonly invalid = input(false);

	protected readonly hostClasses = computed((): string => {
		return joinClasses(
			'h-5 w-5 rounded-sm border border-border-strong text-primary',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
			'disabled:cursor-not-allowed disabled:opacity-50',
			this.invalid() ? 'border-error' : null,
		);
	});
}
