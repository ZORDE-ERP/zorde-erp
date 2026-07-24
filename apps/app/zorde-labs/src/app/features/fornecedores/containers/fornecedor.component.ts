import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { LucidePlus } from '@lucide/angular';
import { AppButtonDirective, AppCardImports, AppToastService } from '@repo/angular-ui';
import type { DataTableActionEvent } from '../../../shared/components/data-table/data-table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EMPTY_PESSOA_FORM_VALUE, PessoaFormValue } from '../../../shared/components/pessoa-form/pessoa-form.model';
import type { SummaryCardItem } from '../../../shared/components/summary-cards/summary-card-item.model';
import { SummaryCardsComponent } from '../../../shared/components/summary-cards/summary-cards.component';
import { FornecedorFiltroComponent } from '../components/fornecedor-filtro/fornecedor-filtro.component';
import { FornecedorFormModalComponent } from '../components/fornecedor-form-modal/fornecedor-form-modal.component';
import { FornecedoresTableComponent } from '../components/fornecedores-table/fornecedores-table.component';
import { FornecedorFacade } from '../fornecedor.facade';
import { FornecedorFiltroModel } from '../model/fornecedor-filtro';
import type { CreateFornecedorPayload, Fornecedor } from '../models/fornecedor.model';

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
	protected readonly loading = signal(false);
	protected readonly saving = signal(false);

	protected readonly modalOpen = signal(false);
	protected readonly editingFornecedor = signal<Fornecedor | null>(null);
	protected readonly formValue = signal<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);

	private readonly filtroModel = signal<FornecedorFiltroModel>({ nome: '' });
	protected filtroForm = form(this.filtroModel);

	protected readonly filteredFornecedores = computed<readonly Fornecedor[]>(() => {
		const nome = this.filtroModel().nome.trim().toLowerCase();
		if (!nome) {
			return this.fornecedores();
		}
		return this.fornecedores().filter((fornecedor) => fornecedor.nome.toLowerCase().includes(nome));
	});

	protected readonly summaryItems = computed<SummaryCardItem[]>(() => {
		const fornecedores = this.fornecedores();
		const ativos = fornecedores.filter((fornecedor) => fornecedor.status === 'ATIVO').length;
		return [
			{
				id: 'total',
				label: 'Total cadastrados',
				value: fornecedores.length,
				icon: 'users',
				variant: 'default',
			},
			{
				id: 'ativos',
				label: 'Ativos',
				value: ativos,
				icon: 'circle-check',
				variant: 'success',
			},
			{
				id: 'inativos',
				label: 'Inativos',
				value: fornecedores.length - ativos,
				icon: 'circle-x',
				variant: 'error',
			},
		];
	});

	protected readonly modalTitle = computed(() => (this.editingFornecedor() ? 'Editar Fornecedor' : 'Novo Fornecedor'));

	public constructor() {
		this.load();
	}

	protected onSummaryClick(_item: SummaryCardItem): void {}

	protected onCreate(): void {
		this.editingFornecedor.set(null);
		this.formValue.set({ ...EMPTY_PESSOA_FORM_VALUE });
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
		this.filtroModel.set({ nome: '' });
	}

	protected onModalClosed(): void {
		this.modalOpen.set(false);
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

		const request = editing
			? this.fornecedorFacade.update({ id: editing.id, ...payload })
			: this.fornecedorFacade.create(payload);

		request.subscribe({
			next: () => {
				this.saving.set(false);
				this.modalOpen.set(false);
				this.toast.show(editing ? 'Fornecedor atualizado com sucesso.' : 'Fornecedor criado com sucesso.', 'success');
				this.load();
			},
			error: () => this.saving.set(false),
		});
	}

	private load(): void {
		this.loading.set(true);
		this.fornecedorFacade.list().subscribe({
			next: (response) => {
				this.loading.set(false);
				this.fornecedores.set(response.body ?? []);
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
