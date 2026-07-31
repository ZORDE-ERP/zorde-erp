import { computed, Directive, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

@Directive({
	selector: 'button[app-icon-button], a[app-icon-button]',
	host: {
		'[class]': 'hostClasses()',
		'[attr.disabled]': 'isDisabled() ? true : null',
		'[attr.aria-disabled]': 'isDisabled() ? "true" : null',
		'[attr.aria-label]': 'label()',
	},
})
export class AppIconButtonDirective {
	public readonly isDisabled = input(false);
	public readonly label = input.required<string>();

	protected readonly hostClasses = computed((): string => {
		return joinClasses(
			'inline-flex h-11 w-11 items-center justify-center rounded-sm-sm text-text-primary',
			'motion-safe:transition-colors hover:bg-surface-muted',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
			'disabled:pointer-events-none disabled:opacity-50',
		);
	});
}
