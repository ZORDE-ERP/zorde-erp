import { Component, input, model, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppFieldComponent, AppInputDirective, AppSelectDirective } from '@repo/angular-ui';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { ClienteFiltroModel } from '../../model/cliente-filtro';

@Component({
	selector: 'app-cliente-filtro',
	templateUrl: './cliente-filtro.component.html',
	imports: [AppFieldComponent, AppInputDirective, AppSelectDirective, FilterCardComponent, FormField],
})
export class ClienteFiltroComponent {
	public readonly filterExpanded = model(false);
	public readonly filtroForm = input.required<FieldTree<ClienteFiltroModel>>();

	public readonly onClearFilter = output<void>();
	public readonly onSearch = output<void>();

	private searchTimer: ReturnType<typeof setTimeout> | null = null;

	protected onClearFilters(): void {
		this.onClearFilter.emit();
	}

	protected onNomeInput(): void {
		if (this.searchTimer !== null) {
			clearTimeout(this.searchTimer);
		}
		this.searchTimer = setTimeout(() => this.onSearch.emit(), 300);
	}

	protected onStatusChange(): void {
		this.onSearch.emit();
	}
}
