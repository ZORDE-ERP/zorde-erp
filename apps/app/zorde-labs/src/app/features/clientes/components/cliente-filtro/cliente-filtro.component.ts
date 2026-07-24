import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppFieldComponent, AppInputDirective } from '@repo/angular-ui';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { ClienteFiltroModel } from '../../model/cliente-filtro';

@Component({
	selector: 'app-cliente-filtro',
	templateUrl: './cliente-filtro.component.html',
	imports: [AppFieldComponent, AppInputDirective, FilterCardComponent, FormsModule, FormField],
})
export class ClienteFiltroComponent {
	public readonly filterExpanded = model(true);
	public filtroForm = input.required<FieldTree<ClienteFiltroModel>>();

	public onClearFilter = output<void>();

	public onClearFilters(): void {
		this.onClearFilter.emit();
	}
}
