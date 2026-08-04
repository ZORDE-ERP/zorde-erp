import { Component, input } from '@angular/core';

@Component({
	selector: 'app-skeleton',
	host: {
		class: 'block animate-pulse rounded-sm-sm bg-surface-muted',
		'[class.h-4]': 'size() === "sm"',
		'[class.h-5]': 'size() === "md"',
		'[class.h-8]': 'size() === "lg"',
		'[class.w-full]': 'true',
		'aria-hidden': 'true',
	},
	template: '',
})
export class AppSkeletonComponent {
	public readonly size = input<'sm' | 'md' | 'lg'>('md');
}
