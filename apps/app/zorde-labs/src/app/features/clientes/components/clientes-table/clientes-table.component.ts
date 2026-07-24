import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type { DataTableActionEvent } from '../../../../shared/components/data-table/data-table.model';
import { ACTIONS, COLUMNS } from '../../model/cliente-table';
import type { Cliente } from '../../models/cliente.model';

@Component({
	selector: 'app-clientes-table',
	templateUrl: './clientes-table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [DataTableComponent],
})
export class ClientesTableComponent {
	public readonly rows = input<readonly Cliente[]>([]);
	public readonly loading = input(false);

	public readonly actionTriggered = output<DataTableActionEvent<Cliente>>();

	public readonly actions = ACTIONS;
	public readonly columns = COLUMNS;

	protected onAction(event: DataTableActionEvent): void {
		if (!this.isCliente(event.row)) {
			return;
		}
		this.actionTriggered.emit({ ...event, row: event.row });
	}

	private isCliente(value: unknown): value is Cliente {
		if (!value || typeof value !== 'object') {
			return false;
		}
		const cliente = value as Partial<Cliente>;
		return typeof cliente.id === 'number' && typeof cliente.nome === 'string';
	}
}
