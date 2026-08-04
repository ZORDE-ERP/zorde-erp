import { Component, signal } from '@angular/core';
import type { AppSearchableSelectOption } from '@repo/angular-ui';
import {
	AppFieldComponent,
	AppPageLayoutComponent,
	AppPreviewBlockComponent,
	AppSearchableSelectComponent,
} from '@repo/angular-ui';

@Component({
	selector: 'ds-searchable-select-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent, AppFieldComponent, AppSearchableSelectComponent],
	templateUrl: './searchable-select.html',
})
export class SearchableSelectPage {
	protected readonly clients: readonly AppSearchableSelectOption[] = [
		{ value: 1, label: 'Laboratório Vida Clara' },
		{ value: 2, label: 'Clínica Bem Estar' },
		{ value: 3, label: 'Ótica Ponto de Vista' },
		{ value: 4, label: 'Hospital São Lucas' },
		{ value: 5, label: 'Consultório Dr. André Souza' },
	];

	protected readonly selectedClient = signal<string | number | null>(null);
}
