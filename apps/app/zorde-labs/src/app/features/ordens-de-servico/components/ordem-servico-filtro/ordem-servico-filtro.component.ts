import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
		FormsModule,
		FormField,
	],
})
export class OrdemServicoFiltroComponent {
	public readonly filterExpanded = model(true);
	public filtroForm = input.required<FieldTree<OrdemServicoFiltroModel>>();
	public readonly clienteId = model<number | null>(null);

	public onClearFilter = output<void>();
	public onSearch = output<void>();

	public onClearFilters(): void {
		this.onClearFilter.emit();
	}

	public onApply(): void {
		this.onSearch.emit();
	}
}
