import { Component, input, output } from '@angular/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type { DataTableActionEvent } from '../../../../shared/components/data-table/data-table.model';
import { ACTIONS, COLUMNS, TabelaMontagemAggregatedRow } from '../../model/tabela-montagem-table';

@Component({
	selector: 'app-tabela-montagem-table',
	templateUrl: './tabela-montagem-table.component.html',
	imports: [DataTableComponent],
})
export class TabelaMontagemTableComponent {
	public readonly rows = input<readonly TabelaMontagemAggregatedRow[]>([]);
	public readonly loading = input(false);

	public readonly actionTriggered = output<DataTableActionEvent<TabelaMontagemAggregatedRow>>();

	public readonly actions = ACTIONS;
	public readonly columns = COLUMNS;

	protected onAction(event: DataTableActionEvent): void {
		if (!this.isAggregatedRow(event.row)) {
			return;
		}
		this.actionTriggered.emit({ ...event, row: event.row });
	}

	private isAggregatedRow(value: unknown): value is TabelaMontagemAggregatedRow {
		if (!value || typeof value !== 'object') {
			return false;
		}
		const row = value as Partial<TabelaMontagemAggregatedRow>;
		return typeof row.clienteId === 'number' && typeof row.nomeCliente === 'string';
	}
}
