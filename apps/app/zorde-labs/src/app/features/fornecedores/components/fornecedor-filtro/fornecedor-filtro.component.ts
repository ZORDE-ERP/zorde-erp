import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppFieldComponent, AppInputDirective } from '@repo/angular-ui';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { FornecedorFiltroModel } from '../../model/fornecedor-filtro';

@Component({
	selector: 'app-fornecedor-filtro',
	templateUrl: './fornecedor-filtro.component.html',
	imports: [AppFieldComponent, AppInputDirective, FilterCardComponent, FormsModule, FormField],
})
export class FornecedorFiltroComponent {
	public readonly filterExpanded = model(true);
	public filtroForm = input.required<FieldTree<FornecedorFiltroModel>>();

	public onClearFilter = output<void>();

	public onClearFilters(): void {
		this.onClearFilter.emit();
	}
}
