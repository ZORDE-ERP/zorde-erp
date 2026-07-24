import type { HttpResponse } from '@angular/common/http';
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
import { ClienteFacade } from '../cliente.facade';
import { ClienteFiltroComponent } from '../components/cliente-filtro/cliente-filtro.component';
import { ClienteFormModalComponent } from '../components/cliente-form-modal/cliente-form-modal.component';
import { ClientesTableComponent } from '../components/clientes-table/clientes-table.component';
import { ClienteFiltroModel } from '../model/cliente-filtro';
import type { Cliente, CreateClientePayload } from '../models/cliente.model';

@Component({
	selector: 'app-cliente',
	templateUrl: './cliente.component.html',
	imports: [
		FormsModule,
		PageHeaderComponent,
		SummaryCardsComponent,
		AppButtonDirective,
		ClientesTableComponent,
		...AppCardImports,
		LucidePlus,
		ClienteFiltroComponent,
		ClienteFormModalComponent,
	],
})
export class ClienteComponent {
	private readonly clienteFacade = inject(ClienteFacade);
	private readonly toast = inject(AppToastService);

	protected readonly clientes = signal<readonly Cliente[]>([]);
	protected readonly loading = signal(false);
	protected readonly saving = signal(false);

	protected readonly modalOpen = signal(false);
	protected readonly editingCliente = signal<Cliente | null>(null);
	protected readonly formValue = signal<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);

	private readonly filtroModel = signal<ClienteFiltroModel>({ nome: '' });
	protected filtroForm = form(this.filtroModel);

	protected readonly filteredClientes = computed<readonly Cliente[]>(() => {
		const nome = this.filtroModel().nome.trim().toLowerCase();
		if (!nome) {
			return this.clientes();
		}
		return this.clientes().filter((cliente) => cliente.nome.toLowerCase().includes(nome));
	});

	protected readonly summaryItems = computed<SummaryCardItem[]>(() => {
		const clientes = this.clientes();
		const ativos = clientes.filter((cliente) => cliente.status === 'ATIVO').length;
		return [
			{
				id: 'total',
				label: 'Total cadastrados',
				value: clientes.length,
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
				value: clientes.length - ativos,
				icon: 'circle-x',
				variant: 'error',
			},
		];
	});

	protected readonly modalTitle = computed(() => (this.editingCliente() ? 'Editar Cliente' : 'Novo Cliente'));

	public constructor() {
		this.load();
	}

	protected onSummaryClick(_item: SummaryCardItem): void {}

	protected onCreate(): void {
		this.editingCliente.set(null);
		this.formValue.set({ ...EMPTY_PESSOA_FORM_VALUE });
		this.modalOpen.set(true);
	}

	protected onRowAction(event: DataTableActionEvent<Cliente>): void {
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
		const editing = this.editingCliente();
		const payload = this.toPayload(value);

		const request = editing ? this.clienteFacade.update({ id: editing.id, ...payload }) : this.clienteFacade.create(payload);

		request.subscribe({
			next: () => {
				this.saving.set(false);
				this.modalOpen.set(false);
				this.toast.show(editing ? 'Cliente atualizado com sucesso.' : 'Cliente criado com sucesso.', 'success');
				this.load();
			},
			error: () => this.saving.set(false),
		});
	}

	private load(): void {
		this.loading.set(true);
		this.clienteFacade.list().subscribe({
			next: (response: HttpResponse<Cliente[]>) => {
				this.loading.set(false);
				this.clientes.set(response.body ?? []);
			},
			error: () => this.loading.set(false),
		});
	}

	private openEdit(cliente: Cliente): void {
		this.editingCliente.set(cliente);
		this.formValue.set(this.toFormValue(cliente));
		this.modalOpen.set(true);
	}

	private onDelete(cliente: Cliente): void {
		this.clienteFacade.delete(cliente.id).subscribe({
			next: () => {
				this.toast.show('Cliente removido com sucesso.', 'success');
				this.load();
			},
		});
	}

	private toFormValue(cliente: Cliente): PessoaFormValue {
		return {
			nome: cliente.nome,
			email: cliente.email,
			contato: cliente.contato ?? '',
			tipoPessoa: cliente.tipoPessoa,
			documento: cliente.documento,
			status: cliente.status,
			razaoSocial: cliente.razaoSocial ?? '',
			nomeFantasia: cliente.nomeFantasia ?? '',
			cep: cliente.cep ?? '',
			uf: cliente.uf ?? '',
			cidade: cliente.cidade ?? '',
			logradouro: cliente.logradouro ?? '',
			numero: cliente.numero ?? '',
			complemento: cliente.complemento ?? '',
			bairro: cliente.bairro ?? '',
			ibge: cliente.ibge ?? '',
			observacao: cliente.observacao ?? '',
			numeroEndereco: cliente.numeroEndereco ?? '',
		};
	}

	private toPayload(value: PessoaFormValue): CreateClientePayload {
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
