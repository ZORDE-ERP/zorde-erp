import type { HttpResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { LucidePrinter } from '@lucide/angular';
import { AppButtonDirective, AppCardImports, AppToastService } from '@repo/angular-ui';
import { finalize } from 'rxjs';
import type {
	DataTableActionEvent,
	DataTablePaginationChange,
} from '../../../shared/components/data-table/data-table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { downloadBlob } from '../../../shared/utils/download-blob';
import { ClienteFacade } from '../../clientes/cliente.facade';
import type { Cliente, ClienteListResponse } from '../../clientes/models/cliente.model';
import { ImpressaoLoteModalComponent } from '../components/impressao-lote-modal/impressao-lote-modal.component';
import { ImpressaoOsFiltroComponent } from '../components/impressao-os-filtro/impressao-os-filtro.component';
import { ImpressaoOsTableComponent } from '../components/impressao-os-table/impressao-os-table.component';
import { ImpressaoOsFiltroModel } from '../model/impressao-os-filtro';

const DEFAULT_PAGE_SIZE = 10;

@Component({
	selector: 'app-impressao-os',
	templateUrl: './impressao-os.component.html',
	imports: [
		FormsModule,
		PageHeaderComponent,
		AppButtonDirective,
		...AppCardImports,
		LucidePrinter,
		ImpressaoOsFiltroComponent,
		ImpressaoOsTableComponent,
		ImpressaoLoteModalComponent,
	],
})
export class ImpressaoOsComponent {
	private readonly clienteFacade = inject(ClienteFacade);
	private readonly toast = inject(AppToastService);

	public readonly clientes = signal<readonly Cliente[]>([]);
	public readonly total = signal(0);
	public readonly loading = signal(false);
	public readonly page = signal(1);
	public readonly pageSize = signal(DEFAULT_PAGE_SIZE);

	public readonly loteModalOpen = signal(false);

	private readonly filtroModel = signal<ImpressaoOsFiltroModel>({ clienteId: null });
	public readonly filtroForm = form(this.filtroModel);

	public constructor() {
		this.load();
	}

	public onClearFilter(): void {
		this.filtroModel.set({ clienteId: null });
		this.page.set(1);
		this.load();
	}

	public onSearch(): void {
		this.page.set(1);
		this.load();
	}

	public onPaginationChange(event: DataTablePaginationChange): void {
		this.page.set(event.page);
		this.pageSize.set(event.pageSize);
		this.load();
	}

	public onOpenLote(): void {
		this.loteModalOpen.set(true);
	}

	public onLoteModalClosed(): void {
		this.loteModalOpen.set(false);
	}

	public onLoteCompleted(): void {
		this.loteModalOpen.set(false);
	}

	public onRowAction(event: DataTableActionEvent<Cliente>): void {
		if (event.action.value === 'imprimir-folhas') {
			this.onImprimirFolhas(event.row);
		}
	}

	public load(): void {
		this.loading.set(true);
		const clienteId = this.filtroForm().value().clienteId;
		this.clienteFacade
			.list({ page: this.page(), limit: this.pageSize(), id: clienteId ?? undefined })
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: (response: HttpResponse<ClienteListResponse>) => {
					this.clientes.set(response.body?.items ?? []);
					this.total.set(response.body?.total ?? 0);
				},
			});
	}

	private onImprimirFolhas(cliente: Cliente): void {
		const input = window.prompt(`Quantidade de folhas de OS para "${cliente.nome}":`, '1');
		if (input === null) {
			return;
		}

		const quantidade = Number(input);
		if (!Number.isFinite(quantidade) || quantidade <= 0) {
			this.toast.show('Informe uma quantidade válida.', 'warning');
			return;
		}

		this.clienteFacade.imprimirFolhasOs(cliente.id, Math.trunc(quantidade)).subscribe({
			next: (response: HttpResponse<Blob>) => {
				const blob = response.body;
				if (!blob) {
					return;
				}
				downloadBlob(blob, `folhas-os-${cliente.nome}.pdf`);
				this.toast.show('Folhas de OS geradas com sucesso.', 'success');
			},
			error: () => this.toast.show('Não foi possível gerar as folhas de OS.', 'error'),
		});
	}
}
