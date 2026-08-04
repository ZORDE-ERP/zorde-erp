import { Component, input, model, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppFieldComponent, AppInputDirective } from '@repo/angular-ui';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { ServicoFiltroModel } from '../../model/servico';

@Component({
	selector: 'app-servico-filtro',
	templateUrl: './servico-filtro.component.html',
	imports: [AppFieldComponent, AppInputDirective, FilterCardComponent, FormField],
})
export class ServicoFiltroComponent {
	public readonly filterExpanded = model(false);
	public readonly filtroForm = input.required<FieldTree<ServicoFiltroModel>>();

	public readonly onClearFilter = output<void>();
	public readonly onSearch = output<void>();

	private searchTimer: ReturnType<typeof setTimeout> | null = null;

	protected onClearFilters(): void {
		this.onClearFilter.emit();
	}

	protected onSearchInput(): void {
		if (this.searchTimer !== null) {
			clearTimeout(this.searchTimer);
		}
		this.searchTimer = setTimeout(() => {
			this.onSearch.emit();
		}, 300);
	}
}
