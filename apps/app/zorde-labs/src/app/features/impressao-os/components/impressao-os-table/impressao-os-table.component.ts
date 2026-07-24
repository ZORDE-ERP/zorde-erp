import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type { DataTableActionEvent } from '../../../../shared/components/data-table/data-table.model';
import { ACTIONS, COLUMNS } from '../../model/impressao-os-table';
import type { Cliente } from '../../../clientes/models/cliente.model';

@Component({
	selector: 'app-impressao-os-table',
	templateUrl: './impressao-os-table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [DataTableComponent],
})
export class ImpressaoOsTableComponent {
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
