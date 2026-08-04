import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type {
	DataTableActionEvent,
	DataTablePaginationChange,
} from '../../../../shared/components/data-table/data-table.model';
import { ACTIONS, COLUMNS } from '../../model/fornecedor-table';
import type { Fornecedor } from '../../models/fornecedor.model';

@Component({
	selector: 'app-fornecedores-table',
	templateUrl: './fornecedores-table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [DataTableComponent],
})
export class FornecedoresTableComponent {
	public readonly rows = input<readonly Fornecedor[]>([]);
	public readonly totalItems = input<number | null>(null);
	public readonly loading = input(false);
	public readonly page = input(1);
	public readonly pageSize = input(10);

	public readonly actionTriggered = output<DataTableActionEvent<Fornecedor>>();
	public readonly paginationChanged = output<DataTablePaginationChange>();

	public readonly actions = ACTIONS;
	public readonly columns = COLUMNS;

	protected onAction(event: DataTableActionEvent): void {
		if (!this.isFornecedor(event.row)) {
			return;
		}
		this.actionTriggered.emit({ ...event, row: event.row });
	}

	protected onPaginationChange(event: DataTablePaginationChange): void {
		this.paginationChanged.emit(event);
	}

	private isFornecedor(value: unknown): value is Fornecedor {
		if (!value || typeof value !== 'object') {
			return false;
		}
		const fornecedor = value as Partial<Fornecedor>;
		return typeof fornecedor.id === 'number' && typeof fornecedor.nome === 'string';
	}
}
