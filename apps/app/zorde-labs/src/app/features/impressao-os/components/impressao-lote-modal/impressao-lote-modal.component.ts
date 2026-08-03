import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePlus, LucideTrash2 } from '@lucide/angular';
import {
	AppBadgeComponent,
	AppButtonDirective,
	AppFieldComponent,
	AppIconButtonDirective,
	AppInputDirective,
	AppModalComponent,
	AppSpinnerComponent,
	AppToastService,
} from '@repo/angular-ui';
import { firstValueFrom } from 'rxjs';
import { ClienteSelectComponent } from '../../../../shared/components/cliente-select/cliente-select.component';
import { downloadBlob } from '../../../../shared/utils/download-blob';
import { ClienteFacade } from '../../../clientes/cliente.facade';

export interface ImpressaoLoteRow {
	readonly id: string;
	readonly clienteId: number | null;
	readonly quantidade: number;
}

export interface ImpressaoLoteProgress {
	readonly current: number;
	readonly total: number;
}

export interface ImpressaoLoteResultado {
	readonly clienteId: number;
	readonly nome: string;
	readonly sucesso: boolean;
}

let nextRowId = 0;

function createRow(): ImpressaoLoteRow {
	return { id: `lote-row-${nextRowId++}`, clienteId: null, quantidade: 1 };
}

@Component({
	selector: 'app-impressao-lote-modal',
	templateUrl: './impressao-lote-modal.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		FormsModule,
		AppModalComponent,
		AppButtonDirective,
		AppFieldComponent,
		AppInputDirective,
		AppIconButtonDirective,
		AppSpinnerComponent,
		AppBadgeComponent,
		ClienteSelectComponent,
		LucidePlus,
		LucideTrash2,
	],
})
export class ImpressaoLoteModalComponent {
	private readonly clienteFacade = inject(ClienteFacade);
	private readonly toast = inject(AppToastService);

	public readonly open = input(false);

	public readonly closed = output<void>();
	public readonly completed = output<readonly ImpressaoLoteResultado[]>();

	public readonly rows = signal<readonly ImpressaoLoteRow[]>([createRow()]);
	public readonly printing = signal(false);
	public readonly progress = signal<ImpressaoLoteProgress>({ current: 0, total: 0 });
	public readonly resultados = signal<readonly ImpressaoLoteResultado[] | null>(null);

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.rows.set([createRow()]);
				this.resultados.set(null);
				this.progress.set({ current: 0, total: 0 });
			}
		});
	}

	public addRow(): void {
		this.rows.update((rows) => [...rows, createRow()]);
	}

	public removeRow(id: string): void {
		this.rows.update((rows) => rows.filter((row) => row.id !== id));
	}

	public setClienteId(id: string, clienteId: number | null): void {
		this.rows.update((rows) => rows.map((row) => (row.id === id ? { ...row, clienteId } : row)));
	}

	public setQuantidade(id: string, quantidade: number): void {
		const value = Number.isFinite(quantidade) && quantidade > 0 ? Math.trunc(quantidade) : 1;
		this.rows.update((rows) => rows.map((row) => (row.id === id ? { ...row, quantidade: value } : row)));
	}

	public onClose(): void {
		if (this.printing()) {
			return;
		}
		this.closed.emit();
	}

	public async onConfirm(): Promise<void> {
		const validRows = this.rows().filter(
			(row): row is ImpressaoLoteRow & { clienteId: number } => row.clienteId !== null && row.quantidade > 0,
		);

		if (validRows.length === 0) {
			this.toast.show('Adicione ao menos um cliente com quantidade válida.', 'warning');
			return;
		}

		this.printing.set(true);
		this.resultados.set(null);
		this.progress.set({ current: 0, total: validRows.length });

		const resultados: ImpressaoLoteResultado[] = [];

		for (const row of validRows) {
			const nome = await this.resolveNomeCliente(row.clienteId);

			try {
				const response = await firstValueFrom(this.clienteFacade.imprimirFolhasOs(row.clienteId, row.quantidade));
				const blob = response.body;
				if (blob) {
					downloadBlob(blob, `folhas-os-${nome}.pdf`);
				}
				resultados.push({ clienteId: row.clienteId, nome, sucesso: true });
			} catch {
				resultados.push({ clienteId: row.clienteId, nome, sucesso: false });
			}

			this.progress.update((current) => ({ ...current, current: current.current + 1 }));
		}

		this.printing.set(false);
		this.resultados.set(resultados);

		const falhas = resultados.filter((resultado) => !resultado.sucesso).length;
		if (falhas === 0) {
			this.toast.show(`Impressão em lote concluída: ${resultados.length} cliente(s) processado(s).`, 'success');
		} else {
			this.toast.show(`Impressão em lote concluída com ${falhas} falha(s) de ${resultados.length}.`, 'warning');
		}

		this.completed.emit(resultados);
	}

	public onNovaImpressao(): void {
		this.rows.set([createRow()]);
		this.resultados.set(null);
		this.progress.set({ current: 0, total: 0 });
	}

	private readonly nomeClienteCache = new Map<number, string>();

	private async resolveNomeCliente(clienteId: number): Promise<string> {
		const cached = this.nomeClienteCache.get(clienteId);
		if (cached) {
			return cached;
		}

		const fallback = `Cliente #${clienteId}`;
		try {
			const response = await firstValueFrom(this.clienteFacade.getById(clienteId));
			const nome = response.body?.nome ?? fallback;
			this.nomeClienteCache.set(clienteId, nome);
			return nome;
		} catch {
			return fallback;
		}
	}
}
