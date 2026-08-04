import { Component, input, model, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppButtonDirective, AppFieldComponent, AppInputDirective, AppSelectDirective } from '@repo/angular-ui';
import { ClienteSelectComponent } from '../../../../shared/components/cliente-select/cliente-select.component';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { OrdemServicoFiltroModel } from '../../model/ordem-servico-filtro';

@Component({
	selector: 'app-ordem-servico-filtro',
	templateUrl: './ordem-servico-filtro.component.html',
	imports: [
		AppFieldComponent,
		AppInputDirective,
		AppSelectDirective,
		AppButtonDirective,
		FilterCardComponent,
		ClienteSelectComponent,
		FormField,
	],
})
export class OrdemServicoFiltroComponent {
	public readonly filterExpanded = model(true);
	public readonly filtroForm = input.required<FieldTree<OrdemServicoFiltroModel>>();

	public readonly onClearFilter = output<void>();
	public readonly onSearch = output<void>();

	protected onClearFilters(): void {
		this.onClearFilter.emit();
	}

	protected onApply(): void {
		this.onSearch.emit();
	}

	protected onClienteIdChange(clienteId: number | null): void {
		this.filtroForm().clienteId().value.set(clienteId);
	}
}
