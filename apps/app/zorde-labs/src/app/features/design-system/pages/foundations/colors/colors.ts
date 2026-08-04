import { Component } from '@angular/core';
import { AppPageLayoutComponent, AppPreviewBlockComponent } from '@repo/angular-ui';

interface ColorToken {
	readonly name: string;
	readonly className: string;
	readonly variable: string;
}

interface ColorGroup {
	readonly title: string;
	readonly tokens: readonly ColorToken[];
}

@Component({
	selector: 'ds-colors-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent],
	templateUrl: './colors.html',
})
export class ColorsPage {
	protected readonly groups: readonly ColorGroup[] = [
		{
			title: 'Superfícies',
			tokens: [
				{ name: 'Surface', className: 'bg-surface', variable: '--color-surface' },
				{ name: 'Surface Muted', className: 'bg-surface-muted', variable: '--color-surface-muted' },
				{ name: 'Surface Elevated', className: 'bg-surface-elevated', variable: '--color-surface-elevated' },
				{ name: 'Surface Inverse', className: 'bg-surface-inverse', variable: '--color-surface-inverse' },
			],
		},
		{
			title: 'Texto',
			tokens: [
				{ name: 'Text Primary', className: 'bg-text-primary', variable: '--color-text-primary' },
				{ name: 'Text Secondary', className: 'bg-text-secondary', variable: '--color-text-secondary' },
				{ name: 'Text Muted', className: 'bg-text-muted', variable: '--color-text-muted' },
				{ name: 'Text Link', className: 'bg-text-link', variable: '--color-text-link' },
			],
		},
		{
			title: 'Ações',
			tokens: [
				{ name: 'Primary', className: 'bg-primary', variable: '--color-primary' },
				{ name: 'Primary Hover', className: 'bg-primary-hover', variable: '--color-primary-hover' },
				{ name: 'Secondary', className: 'bg-secondary', variable: '--color-secondary' },
				{ name: 'Accent', className: 'bg-accent', variable: '--color-accent' },
			],
		},
		{
			title: 'Feedback',
			tokens: [
				{ name: 'Success', className: 'bg-success', variable: '--color-success' },
				{ name: 'Warning', className: 'bg-warning', variable: '--color-warning' },
				{ name: 'Error', className: 'bg-error', variable: '--color-error' },
				{ name: 'Info', className: 'bg-info', variable: '--color-info' },
			],
		},
	];
}
