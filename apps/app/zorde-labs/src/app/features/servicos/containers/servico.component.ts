import { HttpResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import { LucidePlus } from '@lucide/angular';
import { AppButtonDirective, AppCardImports, AppToastService } from '@repo/angular-ui';
import { finalize } from 'rxjs';
import type {
	DataTableActionEvent,
	DataTablePaginationChange,
	DataTableToolbarActionEvent,
} from '../../../shared/components/data-table/data-table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import type { SummaryCardItem } from '../../../shared/components/summary-cards/summary-card-item.model';
import { SummaryCardsComponent } from '../../../shared/components/summary-cards/summary-cards.component';
import { ServicoFiltroComponent } from '../components/servico-filtro/servico-filtro.component';
import { ServicoFormModalComponent } from '../components/servico-form-modal/servico-form-modal.component';
import { ServicosTableComponent } from '../components/servicos-table/servicos-table.component';
import { ServicoFiltroModel, ServicoFormModel } from '../model/servico';
import type { CreateServicoPayload, Servico, ServicoListResponse, UpdateServicoPayload } from '../models/service.model';
import { ServicoFacade } from '../servico.facade';

const DEFAULT_PAGE_SIZE = 10;

@Component({
	selector: 'app-servico',
	templateUrl: './servico.component.html',
	imports: [
		FormsModule,
		PageHeaderComponent,
		SummaryCardsComponent,
		AppButtonDirective,
		ServicosTableComponent,
		...AppCardImports,
		LucidePlus,
		ServicoFiltroComponent,
		ServicoFormModalComponent,
	],
})
export class ServicoComponent {
	public readonly servicoFacade = inject(ServicoFacade);
	private readonly toast = inject(AppToastService);

	public readonly rows = signal<readonly Servico[]>([]);
	public readonly total = signal(0);
	public readonly loading = signal(false);
	public readonly saving = signal(false);
	public readonly page = signal(1);
	public readonly pageSize = signal(DEFAULT_PAGE_SIZE);

	public readonly modalOpen = signal(false);
	public readonly editingServico = signal<Servico | null>(null);

	private readonly filtroModel = signal<ServicoFiltroModel>({ id: null, nome: '' });
	public readonly filtroForm = form(this.filtroModel);

	private readonly formModel = signal<ServicoFormModel>({ nome: '', descricao: '' });
	public readonly servicoForm = form(this.formModel, (schema) => {
		required(schema.nome, { message: 'Nome é obrigatório' });
	});

	public readonly summaryItems = computed<SummaryCardItem[]>(() => {
		return [
			{
				id: 'total',
				label: 'Total cadastrados',
				value: this.total(),
				icon: 'layers',
				variant: 'default',
				data: { status: null },
			},
		];
	});

	public constructor() {
		this.loadList();
	}

	public loadList(): void {
		this.loading.set(true);
		const search = this.filtroForm().value().nome.trim() || undefined;
		this.servicoFacade
			.list(this.page(), this.pageSize(), search)
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: (response: HttpResponse<ServicoListResponse>) => {
					this.rows.set(response.body?.items ?? []);
					this.total.set(response.body?.total ?? 0);
				},
			});
	}

	public onSummaryClick(_item: SummaryCardItem): void {}

	public onRowAction(event: DataTableActionEvent<Servico>): void {
		if (event.action.value === 'editar') {
			this.openEditModal(event.row);
			return;
		}
		if (event.action.value === 'excluir') {
			this.onDelete(event.row);
		}
	}

	public onPaginationChange(event: DataTablePaginationChange): void {
		this.page.set(event.page);
		this.pageSize.set(event.pageSize);
		this.loadList();
	}

	public onCreate(): void {
		this.editingServico.set(null);
		this.formModel.set({ nome: '', descricao: '' });
		this.servicoForm().reset({ nome: '', descricao: '' });
		this.modalOpen.set(true);
	}

	public onModalClosed(): void {
		this.modalOpen.set(false);
	}

	public onModalSubmit(): void {
		this.servicoForm().markAsTouched();
		if (this.servicoForm().invalid()) {
			return;
		}

		const value = this.servicoForm().value();
		const editing = this.editingServico();
		const nome = value.nome.trim();
		const descricao = value.descricao.trim() || undefined;

		this.saving.set(true);
		const request = editing
			? this.servicoFacade.update(editing.id, { nome, descricao } satisfies UpdateServicoPayload)
			: this.servicoFacade.create({ nome, descricao } satisfies CreateServicoPayload);

		request.pipe(finalize(() => this.saving.set(false))).subscribe({
			next: () => {
				this.toast.show(editing ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!', 'success');
				this.modalOpen.set(false);
				this.loadList();
			},
		});
	}

	public onListAction(_event: DataTableToolbarActionEvent<Servico>): void {
		// Mock visual: as ações globais serão conectadas a e-mail/exportação/impressão na API.
	}

	public onClearFilter(): void {
		this.filtroModel.set({ id: null, nome: '' });
		this.page.set(1);
		this.loadList();
	}

	public onSearch(): void {
		this.page.set(1);
		this.loadList();
	}

	private openEditModal(servico: Servico): void {
		this.editingServico.set(servico);
		const value: ServicoFormModel = { nome: servico.nome, descricao: servico.descricao ?? '' };
		this.formModel.set(value);
		this.servicoForm().reset(value);
		this.modalOpen.set(true);
	}

	private onDelete(servico: Servico): void {
		if (!window.confirm(`Deseja realmente excluir o serviço "${servico.nome}"?`)) {
			return;
		}

		this.servicoFacade.delete(servico.id).subscribe({
			next: () => {
				this.toast.show('Serviço excluído com sucesso!', 'success');
				this.loadList();
			},
		});
	}
}
