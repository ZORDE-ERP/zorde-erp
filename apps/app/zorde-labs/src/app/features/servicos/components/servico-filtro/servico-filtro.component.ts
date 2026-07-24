import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppFieldComponent, AppInputDirective } from '@repo/angular-ui';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { ServicoFiltroModel } from '../../model/servico';

@Component({
	selector: 'app-servico-filtro',
	templateUrl: './servico-filtro.component.html',
	imports: [AppFieldComponent, AppInputDirective, FilterCardComponent, FormsModule, FormField],
})
export class ServicoFiltroComponent {
	public readonly filterExpanded = model(true);
	public onClearFilter = output<void>();
	public onSearch = output<void>();
	public filtroForm = input.required<FieldTree<ServicoFiltroModel>>();

	public onClearFilters(): void {
		this.onClearFilter.emit();
	}

	protected onSearchInput(): void {
		this.onSearch.emit();
	}
}
