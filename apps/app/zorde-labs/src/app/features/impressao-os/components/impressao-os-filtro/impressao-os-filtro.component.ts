import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { AppFieldComponent, AppInputDirective } from '@repo/angular-ui';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { ImpressaoOsFiltroModel } from '../../model/impressao-os-filtro';

@Component({
	selector: 'app-impressao-os-filtro',
	templateUrl: './impressao-os-filtro.component.html',
	imports: [AppFieldComponent, AppInputDirective, FilterCardComponent, FormsModule, FormField],
})
export class ImpressaoOsFiltroComponent {
	public readonly filterExpanded = model(true);
	public readonly filtroForm = input.required<FieldTree<ImpressaoOsFiltroModel>>();

	public readonly onClearFilter = output<void>();

	protected onClearFilters(): void {
		this.onClearFilter.emit();
	}
}
