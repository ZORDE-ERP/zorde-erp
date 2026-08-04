import { Component, input, model, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { AppFieldComponent } from '@repo/angular-ui';
import { ClienteSelectComponent } from '../../../../shared/components/cliente-select/cliente-select.component';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { TabelaMontagemFiltroModel } from '../../model/tabela-montagem-filtro';

@Component({
	selector: 'app-tabela-montagem-filtro',
	templateUrl: './tabela-montagem-filtro.component.html',
	imports: [AppFieldComponent, FilterCardComponent, ClienteSelectComponent],
})
export class TabelaMontagemFiltroComponent {
	public readonly filterExpanded = model(false);
	public readonly filtroForm = input.required<FieldTree<TabelaMontagemFiltroModel>>();

	public readonly onClearFilter = output<void>();
	public readonly onSearch = output<void>();

	protected onClearFilters(): void {
		this.onClearFilter.emit();
	}

	protected onClienteIdChange(clienteId: number | null): void {
		this.filtroForm().clienteId().value.set(clienteId);
		this.onSearch.emit();
	}
}
