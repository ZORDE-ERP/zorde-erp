import { Component } from '@angular/core';
import { AppPageLayoutComponent, AppPreviewBlockComponent } from '@repo/angular-ui';

@Component({
	selector: 'ds-borders-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent],
	templateUrl: './borders.html',
})
export class BordersPage {
	protected readonly radiusTokens = [
		{ label: 'sm', className: 'rounded-sm', variable: '--radius-sm' },
		{ label: 'md', className: 'rounded-sm', variable: '--radius-md' },
		{ label: 'lg', className: 'rounded-lg', variable: '--radius-lg' },
		{ label: 'xl', className: 'rounded-xl', variable: '--radius-xl' },
		{ label: '2xl', className: 'rounded-2xl', variable: '--radius-2xl' },
		{ label: 'full', className: 'rounded-full', variable: '--radius-full' },
	] as const;
}
