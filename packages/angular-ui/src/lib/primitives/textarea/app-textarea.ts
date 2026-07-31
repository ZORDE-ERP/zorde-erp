import { computed, Directive, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

@Directive({
	selector: 'textarea[app-textarea]',
	host: {
		'[class]': 'hostClasses()',
		'[attr.aria-invalid]': 'invalid() ? "true" : null',
	},
})
export class AppTextareaDirective {
	public readonly invalid = input(false);

	protected readonly hostClasses = computed((): string => {
		return joinClasses(
			'flex min-h-28 w-full rounded-sm-sm border bg-surface px-3 py-2 text-sm text-text-primary',
			'placeholder:text-text-muted',
			'motion-safe:transition-colors',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'read-only:bg-surface-muted',
			this.invalid() ? 'border-error' : 'border-border-strong',
		);
	});
}
