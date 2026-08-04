import { Component, input, model, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppFieldComponent, AppInputDirective, AppSelectDirective } from '@repo/angular-ui';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { FornecedorFiltroModel } from '../../model/fornecedor-filtro';

@Component({
	selector: 'app-fornecedor-filtro',
	templateUrl: './fornecedor-filtro.component.html',
	imports: [AppFieldComponent, AppInputDirective, AppSelectDirective, FilterCardComponent, FormField],
})
export class FornecedorFiltroComponent {
	public readonly filterExpanded = model(false);
	public readonly filtroForm = input.required<FieldTree<FornecedorFiltroModel>>();

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
