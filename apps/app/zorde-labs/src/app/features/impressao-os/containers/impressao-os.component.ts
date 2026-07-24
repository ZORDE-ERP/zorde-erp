import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { LucidePrinter } from '@lucide/angular';
import { AppButtonDirective, AppCardImports, AppToastService } from '@repo/angular-ui';
import { finalize } from 'rxjs';
import type { DataTableActionEvent } from '../../../shared/components/data-table/data-table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { downloadBlob } from '../../../shared/utils/download-blob';
import { ClienteFacade } from '../../clientes/cliente.facade';
import type { Cliente } from '../../clientes/models/cliente.model';
import { ImpressaoLoteModalComponent } from '../components/impressao-lote-modal/impressao-lote-modal.component';
import { ImpressaoOsFiltroComponent } from '../components/impressao-os-filtro/impressao-os-filtro.component';
import { ImpressaoOsTableComponent } from '../components/impressao-os-table/impressao-os-table.component';
import { QrCodeModalComponent } from '../components/qr-code-modal/qr-code-modal.component';
import { ImpressaoOsFiltroModel } from '../model/impressao-os-filtro';

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
		QrCodeModalComponent,
		ImpressaoLoteModalComponent,
	],
})
export class ImpressaoOsComponent {
	private readonly clienteFacade = inject(ClienteFacade);
	private readonly toast = inject(AppToastService);

	public readonly clientes = signal<readonly Cliente[]>([]);
	public readonly loading = signal(false);

	public readonly qrModalOpen = signal(false);
	public readonly selectedCliente = signal<Cliente | null>(null);

	public readonly loteModalOpen = signal(false);

	private readonly filtroModel = signal<ImpressaoOsFiltroModel>({ nome: '' });
	public readonly filtroForm = form(this.filtroModel);

	public readonly filteredClientes = computed<readonly Cliente[]>(() => {
		const nome = this.filtroModel().nome.trim().toLowerCase();
		if (!nome) {
			return this.clientes();
		}
		return this.clientes().filter((cliente) => cliente.nome.toLowerCase().includes(nome));
	});

	public constructor() {
		this.load();
	}

	public onClearFilter(): void {
		this.filtroModel.set({ nome: '' });
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
		if (event.action.value === 'ver-qr') {
			this.selectedCliente.set(event.row);
			this.qrModalOpen.set(true);
			return;
		}
		if (event.action.value === 'imprimir-folhas') {
			this.onImprimirFolhas(event.row);
		}
	}

	public onQrModalClosed(): void {
		this.qrModalOpen.set(false);
	}

	public onQrRegenerated(cliente: Cliente): void {
		this.selectedCliente.set(cliente);
		this.clientes.update((lista) => lista.map((item) => (item.id === cliente.id ? cliente : item)));
	}

	public load(): void {
		this.loading.set(true);
		this.clienteFacade
			.list()
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: (response) => this.clientes.set(response.body ?? []),
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
			next: (response) => {
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
