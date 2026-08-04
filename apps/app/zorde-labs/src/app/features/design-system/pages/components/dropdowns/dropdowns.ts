import { Component } from '@angular/core';
import type { AppDropdownItem } from '@repo/angular-ui';
import { AppDropdownMenuComponent, AppPageLayoutComponent, AppPreviewBlockComponent } from '@repo/angular-ui';

@Component({
	selector: 'ds-dropdowns-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent, AppDropdownMenuComponent],
	templateUrl: './dropdowns.html',
})
export class DropdownsPage {
	protected readonly actions: readonly AppDropdownItem[] = [
		{ label: 'Editar', value: 'edit' },
		{ label: 'Duplicar', value: 'duplicate' },
		{ label: 'Arquivar', value: 'archive', disabled: true },
		{ label: 'Excluir', value: 'delete' },
	];
}
