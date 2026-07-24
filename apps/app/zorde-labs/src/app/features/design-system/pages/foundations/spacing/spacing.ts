import { Component } from '@angular/core';
import { AppPageLayoutComponent, AppPreviewBlockComponent } from '@repo/angular-ui';

@Component({
	selector: 'ds-spacing-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent],
	templateUrl: './spacing.html',
})
export class SpacingPage {
	protected readonly spacingScale = ['1', '2', '3', '4', '6', '8', '12', '16'] as const;
	protected readonly semanticSpacing = [
		{ label: 'section', className: 'p-section', variable: '--spacing-section' },
		{ label: 'stack-sm', className: 'gap-stack-sm', variable: '--spacing-stack-sm' },
		{ label: 'stack-md', className: 'gap-stack-md', variable: '--spacing-stack-md' },
		{ label: 'stack-lg', className: 'gap-stack-lg', variable: '--spacing-stack-lg' },
		{ label: 'stack-xl', className: 'gap-stack-xl', variable: '--spacing-stack-xl' },
	] as const;
}
