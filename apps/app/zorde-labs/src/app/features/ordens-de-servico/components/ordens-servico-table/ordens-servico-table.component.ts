import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type {
	DataTableActionEvent,
	DataTablePaginationChange,
} from '../../../../shared/components/data-table/data-table.model';
import { ACTIONS, COLUMNS } from '../../model/ordem-servico-table';
import type { OrdemServico } from '../../models/ordem-servico.model';

@Component({
	selector: 'app-ordens-servico-table',
	templateUrl: './ordens-servico-table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [DataTableComponent],
})
export class OrdensServicoTableComponent {
	public readonly rows = input<readonly OrdemServico[]>([]);
	public readonly totalItems = input<number | null>(null);
	public readonly loading = input(false);
	public readonly page = input(1);
	public readonly pageSize = input(10);

	public readonly actionTriggered = output<DataTableActionEvent<OrdemServico>>();
	public readonly paginationChanged = output<DataTablePaginationChange>();

	public readonly actions = ACTIONS;
	public readonly columns = COLUMNS;

	protected onAction(event: DataTableActionEvent): void {
		if (!this.isOrdem(event.row)) {
			return;
		}
		this.actionTriggered.emit({ ...event, row: event.row });
	}

	protected onPaginationChange(event: DataTablePaginationChange): void {
		this.paginationChanged.emit(event);
	}

	private isOrdem(value: unknown): value is OrdemServico {
		if (!value || typeof value !== 'object') {
			return false;
		}
		const ordem = value as Partial<OrdemServico>;
		return typeof ordem.id === 'number' && typeof ordem.codigoOs === 'string';
	}
}
