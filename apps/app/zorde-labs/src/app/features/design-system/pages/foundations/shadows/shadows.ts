import { Component } from '@angular/core';
import { AppPageLayoutComponent, AppPreviewBlockComponent } from '@repo/angular-ui';

@Component({
	selector: 'ds-shadows-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent],
	templateUrl: './shadows.html',
})
export class ShadowsPage {
	protected readonly shadowTokens = [
		{ label: 'xs', className: 'shadow-xs', variable: '--shadow-xs' },
		{ label: 'sm', className: 'shadow-sm', variable: '--shadow-sm' },
		{ label: 'md', className: 'shadow-md', variable: '--shadow-md' },
		{ label: 'lg', className: 'shadow-lg', variable: '--shadow-lg' },
		{ label: 'xl', className: 'shadow-xl', variable: '--shadow-xl' },
	] as const;
}
