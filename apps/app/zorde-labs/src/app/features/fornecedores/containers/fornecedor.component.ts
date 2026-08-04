import type { HttpResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { LucidePlus } from '@lucide/angular';
import { AppButtonDirective, AppCardImports, AppToastService } from '@repo/angular-ui';
import type {
	DataTableActionEvent,
	DataTablePaginationChange,
} from '../../../shared/components/data-table/data-table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EMPTY_PESSOA_FORM_VALUE, PessoaFormValue } from '../../../shared/components/pessoa-form/pessoa-form.model';
import type { SummaryCardItem } from '../../../shared/components/summary-cards/summary-card-item.model';
import { SummaryCardsComponent } from '../../../shared/components/summary-cards/summary-cards.component';
import { FornecedorFiltroComponent } from '../components/fornecedor-filtro/fornecedor-filtro.component';
import { FornecedorFormModalComponent } from '../components/fornecedor-form-modal/fornecedor-form-modal.component';
import { FornecedoresTableComponent } from '../components/fornecedores-table/fornecedores-table.component';
import { FornecedorFacade } from '../fornecedor.facade';
import { FornecedorFiltroModel } from '../model/fornecedor-filtro';
import type {
	CreateFornecedorPayload,
	Fornecedor,
	FornecedorListResponse,
	FornecedorStatusCounts,
} from '../models/fornecedor.model';

const DEFAULT_PAGE_SIZE = 10;

@Component({
	selector: 'app-fornecedor',
	templateUrl: './fornecedor.component.html',
	imports: [
		FormsModule,
		PageHeaderComponent,
		SummaryCardsComponent,
		AppButtonDirective,
		FornecedoresTableComponent,
		...AppCardImports,
		LucidePlus,
		FornecedorFiltroComponent,
		FornecedorFormModalComponent,
	],
})
export class FornecedorComponent {
	private readonly fornecedorFacade = inject(FornecedorFacade);
	private readonly toast = inject(AppToastService);

	protected readonly fornecedores = signal<readonly Fornecedor[]>([]);
	protected readonly total = signal(0);
	protected readonly counts = signal<FornecedorStatusCounts>({ total: 0, ativos: 0, inativos: 0 });
	protected readonly loading = signal(false);
	protected readonly saving = signal(false);
	protected readonly page = signal(1);
	protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

	protected readonly modalOpen = signal(false);
	protected readonly editingFornecedor = signal<Fornecedor | null>(null);
	protected readonly formValue = signal<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);
	protected readonly pendingLogoFile = signal<File | null>(null);

	private readonly filtroModel = signal<FornecedorFiltroModel>({ nome: '', status: '' });
	protected filtroForm = form(this.filtroModel);

	protected readonly summaryItems = computed<SummaryCardItem[]>(() => {
		const counts = this.counts();
		return [
			{
				id: 'total',
				label: 'Total cadastrados',
				value: counts.total,
				icon: 'users',
				variant: 'default',
			},
			{
				id: 'ativos',
				label: 'Ativos',
				value: counts.ativos,
				icon: 'circle-check',
				variant: 'success',
			},
			{
				id: 'inativos',
				label: 'Inativos',
				value: counts.inativos,
				icon: 'circle-x',
				variant: 'error',
			},
		];
	});

	protected readonly modalTitle = computed(() => (this.editingFornecedor() ? 'Editar Fornecedor' : 'Novo Fornecedor'));

	public constructor() {
		this.load();
	}

	protected onSummaryClick(item: SummaryCardItem): void {
		if (item.id === 'ativos') {
			this.filtroModel.update((current) => ({ ...current, status: 'ATIVO' }));
		} else if (item.id === 'inativos') {
			this.filtroModel.update((current) => ({ ...current, status: 'INATIVO' }));
		} else if (item.id === 'total') {
			this.filtroModel.update((current) => ({ ...current, status: '' }));
		}
		this.onSearch();
	}

	protected onCreate(): void {
		this.editingFornecedor.set(null);
		this.formValue.set({ ...EMPTY_PESSOA_FORM_VALUE });
		this.pendingLogoFile.set(null);
		this.modalOpen.set(true);
	}

	protected onRowAction(event: DataTableActionEvent<Fornecedor>): void {
		if (event.action.value === 'editar') {
			this.openEdit(event.row);
			return;
		}
		if (event.action.value === 'excluir') {
			this.onDelete(event.row);
		}
	}

	protected onClearFilter(): void {
		this.filtroModel.set({ nome: '', status: '' });
		this.page.set(1);
		this.load();
	}

	protected onSearch(): void {
		this.page.set(1);
		this.load();
	}

	protected onPaginationChange(event: DataTablePaginationChange): void {
		this.page.set(event.page);
		this.pageSize.set(event.pageSize);
		this.load();
	}

	protected onModalClosed(): void {
		this.modalOpen.set(false);
		this.pendingLogoFile.set(null);
	}

	protected onLogoChanged(fornecedor: Fornecedor): void {
		this.editingFornecedor.set(fornecedor);
		this.fornecedores.update((list) => list.map((item) => (item.id === fornecedor.id ? fornecedor : item)));
	}

	protected onModalSubmit(): void {
		const value = this.formValue();
		if (!value.nome.trim() || !value.email.trim() || !value.documento.trim()) {
			this.toast.show('Preencha nome, e-mail e documento para continuar.', 'warning');
			return;
		}

		this.saving.set(true);
		const editing = this.editingFornecedor();
		const payload = this.toPayload(value);
		const pendingLogo = this.pendingLogoFile();

		if (editing) {
			this.fornecedorFacade.update({ id: editing.id, ...payload }).subscribe({
				next: () => {
					this.saving.set(false);
					this.modalOpen.set(false);
					this.toast.show('Fornecedor atualizado com sucesso.', 'success');
					this.load();
				},
				error: () => this.saving.set(false),
			});
			return;
		}

		this.fornecedorFacade.create(payload).subscribe({
			next: (response: HttpResponse<Fornecedor>) => {
				const created = response.body;
				if (!created) {
					this.saving.set(false);
					this.toast.show('Fornecedor criado, mas resposta inválida.', 'warning');
					this.load();
					return;
				}

				if (!pendingLogo) {
					this.saving.set(false);
					this.modalOpen.set(false);
					this.toast.show('Fornecedor criado com sucesso.', 'success');
					this.load();
					return;
				}

				this.fornecedorFacade.uploadLogo(created.id, pendingLogo).subscribe({
					next: () => {
						this.saving.set(false);
						this.modalOpen.set(false);
						this.pendingLogoFile.set(null);
						this.toast.show('Fornecedor criado com sucesso.', 'success');
						this.load();
					},
					error: () => {
						this.saving.set(false);
						this.modalOpen.set(false);
						this.toast.show('Fornecedor criado, mas o upload do logo falhou.', 'warning');
						this.load();
					},
				});
			},
			error: () => this.saving.set(false),
		});
	}

	private load(): void {
		this.loading.set(true);
		const filtro = this.filtroForm().value();
		this.fornecedorFacade
			.list({
				page: this.page(),
				limit: this.pageSize(),
				search: filtro.nome.trim() || undefined,
				status: filtro.status || undefined,
			})
			.subscribe({
				next: (response: HttpResponse<FornecedorListResponse>) => {
					this.loading.set(false);
					this.fornecedores.set(response.body?.items ?? []);
					this.total.set(response.body?.total ?? 0);
					this.counts.set(response.body?.counts ?? { total: 0, ativos: 0, inativos: 0 });
				},
				error: () => this.loading.set(false),
			});
	}

	private openEdit(fornecedor: Fornecedor): void {
		this.editingFornecedor.set(fornecedor);
		this.formValue.set(this.toFormValue(fornecedor));
		this.modalOpen.set(true);
	}

	private onDelete(fornecedor: Fornecedor): void {
		if (!window.confirm(`Deseja realmente excluir o fornecedor "${fornecedor.nome}"?`)) {
			return;
		}

		this.fornecedorFacade.delete(fornecedor.id).subscribe({
			next: () => {
				this.toast.show('Fornecedor removido com sucesso.', 'success');
				this.load();
			},
		});
	}

	private toFormValue(fornecedor: Fornecedor): PessoaFormValue {
		return {
			nome: fornecedor.nome,
			email: fornecedor.email,
			contato: fornecedor.contato ?? '',
			tipoPessoa: fornecedor.tipoPessoa,
			documento: fornecedor.documento,
			status: fornecedor.status,
			razaoSocial: fornecedor.razaoSocial ?? '',
			nomeFantasia: fornecedor.nomeFantasia ?? '',
			cep: fornecedor.cep ?? '',
			uf: fornecedor.uf ?? '',
			cidade: fornecedor.cidade ?? '',
			logradouro: fornecedor.logradouro ?? '',
			numero: fornecedor.numeroEndereco ?? '',
			complemento: fornecedor.complemento ?? '',
			bairro: fornecedor.bairro ?? '',
			ibge: fornecedor.ibge ?? '',
			observacao: fornecedor.observacao ?? '',
			numeroEndereco: fornecedor.numeroEndereco ?? '',
		};
	}

	private toPayload(value: PessoaFormValue): CreateFornecedorPayload {
		return {
			nome: value.nome,
			email: value.email,
			tipoPessoa: value.tipoPessoa,
			documento: value.documento,
			status: value.status,
			contato: value.contato || undefined,
			razaoSocial: value.razaoSocial || undefined,
			nomeFantasia: value.nomeFantasia || undefined,
			cep: value.cep || undefined,
			uf: value.uf || undefined,
			cidade: value.cidade || undefined,
			logradouro: value.logradouro || undefined,
			numero: value.numero || undefined,
			complemento: value.complemento || undefined,
			bairro: value.bairro || undefined,
			ibge: value.ibge || undefined,
			observacao: value.observacao || undefined,
			numeroEndereco: value.numeroEndereco || undefined,
		};
	}
}
