import { booleanAttribute, computed, Directive, HostAttributeToken, inject, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

function userClass(): string | null {
	return inject(new HostAttributeToken('class'), { optional: true });
}

@Directive({
	selector: '[app-card]',
	host: {
		'[class]': 'hostClasses()',
	},
})
export class AppCardDirective {
	private readonly extraClass = userClass();

	public readonly elevated = input(false, { transform: booleanAttribute });

	protected readonly hostClasses = computed((): string =>
		joinClasses(
			'overflow-hidden rounded-sm border border-border bg-surface text-text-secondary',
			this.elevated() ? 'shadow-md' : 'shadow-sm',
			this.extraClass,
		),
	);
}

@Directive({
	selector: '[app-card-header]',
	host: {
		'[class]': 'hostClasses()',
	},
})
export class AppCardHeaderDirective {
	private readonly extraClass = userClass();

	protected readonly hostClasses = computed((): string => joinClasses('border-b border-border px-5 py-4', this.extraClass));
}

@Directive({
	selector: '[app-card-title]',
	host: {
		'[class]': 'hostClasses()',
	},
})
export class AppCardTitleDirective {
	private readonly extraClass = userClass();

	protected readonly hostClasses = computed((): string =>
		joinClasses('font-heading text-base font-semibold text-text-primary', this.extraClass),
	);
}

@Directive({
	selector: '[app-card-description]',
	host: {
		'[class]': 'hostClasses()',
	},
})
export class AppCardDescriptionDirective {
	private readonly extraClass = userClass();

	protected readonly hostClasses = computed((): string => joinClasses('mt-1 text-sm text-text-muted', this.extraClass));
}

@Directive({
	selector: '[app-card-body]',
	host: {
		'[class]': 'hostClasses()',
	},
})
export class AppCardBodyDirective {
	private readonly extraClass = userClass();

	protected readonly hostClasses = computed((): string => joinClasses('p-5 text-text-secondary', this.extraClass));
}

@Directive({
	selector: '[app-card-footer]',
	host: {
		'[class]': 'hostClasses()',
	},
})
export class AppCardFooterDirective {
	private readonly extraClass = userClass();

	protected readonly hostClasses = computed((): string => joinClasses('border-t border-border px-5 py-4', this.extraClass));
}

export const AppCardImports = [
	AppCardDirective,
	AppCardHeaderDirective,
	AppCardTitleDirective,
	AppCardDescriptionDirective,
	AppCardBodyDirective,
	AppCardFooterDirective,
] as const;
