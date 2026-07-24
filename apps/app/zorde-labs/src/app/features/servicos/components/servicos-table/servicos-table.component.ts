import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type {
	DataTableActionEvent,
	DataTablePaginationChange,
	DataTableToolbarActionEvent,
} from '../../../../shared/components/data-table/data-table.model';
import { ACTIONS, COLUMNS, TOOLBAR_ACTIONS } from '../../model/servico-table';
import type { Servico } from '../../models/service.model';

@Component({
	selector: 'app-servicos-table',
	templateUrl: './servicos-table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [DataTableComponent],
})
export class ServicosTableComponent {
	public readonly rows = input<readonly Servico[]>([]);
	public readonly totalItems = input<number | null>(null);
	public readonly loading = input(false);
	public readonly page = input(1);
	public readonly pageSize = input(10);

	public readonly actionTriggered = output<DataTableActionEvent<Servico>>();
	public readonly toolbarActionTriggered = output<DataTableToolbarActionEvent<Servico>>();
	public readonly paginationChanged = output<DataTablePaginationChange>();

	public readonly actions = ACTIONS;
	public readonly toolbarActions = TOOLBAR_ACTIONS;
	public readonly columns = COLUMNS;

	protected onAction(event: DataTableActionEvent): void {
		if (!this.isServico(event.row)) {
			return;
		}
		this.actionTriggered.emit({ ...event, row: event.row });
	}

	protected onToolbarAction(event: DataTableToolbarActionEvent): void {
		if (!event.selectedRows.every((row) => this.isServico(row))) {
			return;
		}
		this.toolbarActionTriggered.emit({ ...event, selectedRows: event.selectedRows });
	}

	protected onPaginationChange(event: DataTablePaginationChange): void {
		this.paginationChanged.emit(event);
	}

	private isServico(value: unknown): value is Servico {
		if (!value || typeof value !== 'object') {
			return false;
		}
		const servico = value as Partial<Servico>;
		return typeof servico.id === 'number' && typeof servico.nome === 'string';
	}
}
