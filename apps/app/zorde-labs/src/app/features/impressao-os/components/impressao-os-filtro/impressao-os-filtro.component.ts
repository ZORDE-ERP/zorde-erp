import { Component, input, model, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { AppFieldComponent } from '@repo/angular-ui';
import { ClienteSelectComponent } from '../../../../shared/components/cliente-select/cliente-select.component';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { ImpressaoOsFiltroModel } from '../../model/impressao-os-filtro';

@Component({
	selector: 'app-impressao-os-filtro',
	templateUrl: './impressao-os-filtro.component.html',
	imports: [AppFieldComponent, FilterCardComponent, ClienteSelectComponent],
})
export class ImpressaoOsFiltroComponent {
	public readonly filterExpanded = model(false);
	public readonly filtroForm = input.required<FieldTree<ImpressaoOsFiltroModel>>();

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
