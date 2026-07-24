import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppFieldComponent, AppInputDirective } from '@repo/angular-ui';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { TabelaMontagemFiltroModel } from '../../model/tabela-montagem-filtro';

@Component({
	selector: 'app-tabela-montagem-filtro',
	templateUrl: './tabela-montagem-filtro.component.html',
	imports: [AppFieldComponent, AppInputDirective, FilterCardComponent, FormsModule, FormField],
})
export class TabelaMontagemFiltroComponent {
	public readonly filterExpanded = model(true);
	public onClearFilter = output<void>();
	public filtroForm = input.required<FieldTree<TabelaMontagemFiltroModel>>();

	public onClearFilters(): void {
		this.onClearFilter.emit();
	}
}
