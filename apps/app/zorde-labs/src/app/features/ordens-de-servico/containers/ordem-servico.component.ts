import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { LucidePlus } from '@lucide/angular';
import { AppButtonDirective, AppCardImports, AppToastService } from '@repo/angular-ui';
import { finalize } from 'rxjs';
import type {
	DataTableActionEvent,
	DataTablePaginationChange,
} from '../../../shared/components/data-table/data-table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import type { SummaryCardItem } from '../../../shared/components/summary-cards/summary-card-item.model';
import { SummaryCardsComponent } from '../../../shared/components/summary-cards/summary-cards.component';
import { OrdemServicoCreateModalComponent } from '../components/ordem-servico-create-modal/ordem-servico-create-modal.component';
import { OrdemServicoFiltroComponent } from '../components/ordem-servico-filtro/ordem-servico-filtro.component';
import { OrdensServicoTableComponent } from '../components/ordens-servico-table/ordens-servico-table.component';
import { OrdemServicoFiltroModel } from '../model/ordem-servico-filtro';
import type { ListOrdensQuery, OrdemServico, StatusOrdemServico } from '../models/ordem-servico.model';
import { OrdemServicoFacade } from '../ordem-servico.facade';

const DEFAULT_PAGE_SIZE = 10;

@Component({
	selector: 'app-ordem-servico',
	templateUrl: './ordem-servico.component.html',
	imports: [
		FormsModule,
		PageHeaderComponent,
		SummaryCardsComponent,
		AppButtonDirective,
		...AppCardImports,
		LucidePlus,
		OrdemServicoFiltroComponent,
		OrdensServicoTableComponent,
		OrdemServicoCreateModalComponent,
	],
})
export class OrdemServicoComponent {
	private readonly ordemFacade = inject(OrdemServicoFacade);
	private readonly toast = inject(AppToastService);

	public readonly rows = signal<readonly OrdemServico[]>([]);
	public readonly total = signal(0);
	public readonly loading = signal(false);
	public readonly page = signal(1);
	public readonly pageSize = signal(DEFAULT_PAGE_SIZE);

	public readonly createOpen = signal(false);

	private readonly filtroModel = signal<OrdemServicoFiltroModel>({
		status: '',
		clienteId: null,
		dataInicio: '',
		dataFim: '',
	});
	public readonly filtroForm = form(this.filtroModel);

	public readonly summaryItems = computed<SummaryCardItem[]>(() => [
		{
			id: 'total',
			label: 'Total no filtro',
			value: this.total(),
			icon: 'layers',
			variant: 'default',
		},
	]);

	public constructor() {
		this.loadList();
	}

	public loadList(): void {
		this.loading.set(true);
		const filtro = this.filtroForm().value();
		const query: ListOrdensQuery = {
			page: this.page(),
			limit: this.pageSize(),
			status: filtro.status || undefined,
			clienteId: filtro.clienteId ?? undefined,
			dataInicio: filtro.dataInicio || undefined,
			dataFim: filtro.dataFim || undefined,
		};

		this.ordemFacade
			.list(query)
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: (response) => {
					this.rows.set(response.body?.items ?? []);
					this.total.set(response.body?.total ?? 0);
				},
			});
	}

	public onSummaryClick(_item: SummaryCardItem): void {}

	public onClearFilter(): void {
		this.filtroModel.set({ status: '', clienteId: null, dataInicio: '', dataFim: '' });
		this.page.set(1);
		this.loadList();
	}

	public onSearch(): void {
		this.page.set(1);
		this.loadList();
	}

	public onPaginationChange(event: DataTablePaginationChange): void {
		this.page.set(event.page);
		this.pageSize.set(event.pageSize);
		this.loadList();
	}

	public onCreate(): void {
		this.createOpen.set(true);
	}

	public onCreateClosed(): void {
		this.createOpen.set(false);
	}

	public onCreated(): void {
		this.toast.show('Ordem de serviço criada com sucesso!', 'success');
		this.createOpen.set(false);
		this.loadList();
	}

	public onRowAction(event: DataTableActionEvent<OrdemServico>): void {
		const action = event.action.value;
		if (action === 'excluir') {
			this.onDelete(event.row);
			return;
		}
		if (action === 'editar-obs') {
			this.onEditObservacao(event.row);
			return;
		}
		if (action === 'status-lancada') {
			this.onChangeStatus(event.row, 'LANCADA');
			return;
		}
		if (action === 'status-faturada') {
			this.onChangeStatus(event.row, 'FATURADA');
			return;
		}
		if (action === 'status-cancelada') {
			this.onChangeStatus(event.row, 'CANCELADA');
		}
	}

	private onChangeStatus(ordem: OrdemServico, status: StatusOrdemServico): void {
		if (ordem.status === status) {
			return;
		}
		if (!window.confirm(`Alterar status da OS ${ordem.codigoOs} para ${status}?`)) {
			return;
		}
		this.ordemFacade.update({ id: ordem.id, status }).subscribe({
			next: () => {
				this.toast.show('Status atualizado.', 'success');
				this.loadList();
			},
		});
	}

	private onEditObservacao(ordem: OrdemServico): void {
		const value = window.prompt('Observação da OS:', ordem.observacao ?? '');
		if (value === null) {
			return;
		}
		this.ordemFacade.update({ id: ordem.id, observacao: value }).subscribe({
			next: () => {
				this.toast.show('Observação atualizada.', 'success');
				this.loadList();
			},
		});
	}

	private onDelete(ordem: OrdemServico): void {
		if (!window.confirm(`Excluir a OS ${ordem.codigoOs}?`)) {
			return;
		}
		this.ordemFacade.delete(ordem.id).subscribe({
			next: () => {
				this.toast.show('OS excluída.', 'success');
				this.loadList();
			},
		});
	}
}
