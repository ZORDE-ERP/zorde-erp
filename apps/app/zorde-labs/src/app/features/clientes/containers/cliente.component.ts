import type { HttpResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { LucidePlus } from '@lucide/angular';
import { AppButtonDirective, AppCardImports, AppToastService } from '@repo/angular-ui';
import { catchError, forkJoin, map, of, switchMap, type Observable } from 'rxjs';
import type {
	DataTableActionEvent,
	DataTablePaginationChange,
} from '../../../shared/components/data-table/data-table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EMPTY_PESSOA_FORM_VALUE, PessoaFormValue } from '../../../shared/components/pessoa-form/pessoa-form.model';
import type { SummaryCardItem } from '../../../shared/components/summary-cards/summary-card-item.model';
import { SummaryCardsComponent } from '../../../shared/components/summary-cards/summary-cards.component';
import { TabelaMontagemFacade } from '../../tabela-montagem/tabela-montagem.facade';
import { ClienteFacade } from '../cliente.facade';
import { ClienteFiltroComponent } from '../components/cliente-filtro/cliente-filtro.component';
import {
	ClienteFormModalComponent,
	type PendingClienteVinculo,
} from '../components/cliente-form-modal/cliente-form-modal.component';
import { ClientesTableComponent } from '../components/clientes-table/clientes-table.component';
import { ClienteFiltroModel } from '../model/cliente-filtro';
import type { Cliente, ClienteListResponse, ClienteStatusCounts, CreateClientePayload } from '../models/cliente.model';

const DEFAULT_PAGE_SIZE = 10;

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
	private readonly tabelaMontagemFacade = inject(TabelaMontagemFacade);
	private readonly toast = inject(AppToastService);

	protected readonly clientes = signal<readonly Cliente[]>([]);
	protected readonly total = signal(0);
	protected readonly counts = signal<ClienteStatusCounts>({ total: 0, ativos: 0, inativos: 0 });
	protected readonly loading = signal(false);
	protected readonly saving = signal(false);
	protected readonly page = signal(1);
	protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

	protected readonly modalOpen = signal(false);
	protected readonly editingCliente = signal<Cliente | null>(null);
	protected readonly formValue = signal<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);
	protected readonly pendingLogoFile = signal<File | null>(null);
	protected readonly pendingVinculos = signal<readonly PendingClienteVinculo[]>([]);

	private readonly filtroModel = signal<ClienteFiltroModel>({ nome: '', status: '' });
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

	protected readonly modalTitle = computed(() => (this.editingCliente() ? 'Editar Cliente' : 'Novo Cliente'));

	public constructor() {
		this.loadList();
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
		this.editingCliente.set(null);
		this.formValue.set({ ...EMPTY_PESSOA_FORM_VALUE });
		this.pendingLogoFile.set(null);
		this.pendingVinculos.set([]);
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
		this.filtroModel.set({ nome: '', status: '' });
		this.page.set(1);
		this.loadList();
	}

	protected onSearch(): void {
		this.page.set(1);
		this.loadList();
	}

	protected onPaginationChange(event: DataTablePaginationChange): void {
		this.page.set(event.page);
		this.pageSize.set(event.pageSize);
		this.loadList();
	}

	protected onModalClosed(): void {
		this.modalOpen.set(false);
		this.pendingLogoFile.set(null);
		this.pendingVinculos.set([]);
	}

	protected onLogoChanged(cliente: Cliente): void {
		this.editingCliente.set(cliente);
		this.clientes.update((list) => list.map((item) => (item.id === cliente.id ? cliente : item)));
	}

	protected onQrRevoked(cliente: Cliente): void {
		const current = this.editingCliente();
		const merged: Cliente = current
			? { ...current, qrCodeUrl: cliente.qrCodeUrl, qrGeradoEm: cliente.qrGeradoEm }
			: cliente;
		this.editingCliente.set(merged);
		this.clientes.update((list) =>
			list.map((item) =>
				item.id === merged.id
					? { ...item, qrCodeUrl: merged.qrCodeUrl, qrGeradoEm: merged.qrGeradoEm }
					: item,
			),
		);
	}

	protected onModalSubmit(): void {
		const value = this.formValue();
		if (!value.nome.trim() || !value.email.trim() || !value.documento.trim()) {
			this.toast.show('Preencha nome, e-mail e documento para continuar.', 'warning');
			return;
		}

		const editing = this.editingCliente();
		const pendingVinculos = this.pendingVinculos();

		if (!editing && pendingVinculos.length === 0) {
			this.toast.show('Adicione ao menos um serviço na Tabela de Montagem para continuar.', 'warning');
			return;
		}

		this.saving.set(true);
		const payload = this.toPayload(value);
		const pendingLogo = this.pendingLogoFile();

		if (editing) {
			const dataChanged = this.hasClienteDataChanged(editing, payload);
			this.clienteFacade
				.update({ id: editing.id, ...payload })
				.pipe(switchMap(() => this.revokeQrAfterDataChange(editing.id, dataChanged)))
				.subscribe({
					next: (revokeResult: 'skipped' | 'revoked' | 'failed') => {
						this.saving.set(false);
						this.modalOpen.set(false);
						if (revokeResult === 'failed') {
							this.toast.show(
								'Cliente atualizado, mas não foi possível revogar o QR Code automaticamente.',
								'warning',
							);
						} else {
							this.toast.show('Cliente atualizado com sucesso.', 'success');
						}
						this.loadList();
					},
					error: () => this.saving.set(false),
				});
			return;
		}

		this.clienteFacade
			.create(payload)
			.pipe(
				switchMap((response: HttpResponse<Cliente>) => {
					const created = response.body;
					if (!created) {
						throw new Error('INVALID_CREATE_RESPONSE');
					}

					return forkJoin(
						pendingVinculos.map((item) =>
							this.tabelaMontagemFacade.create({
								clienteId: created.id,
								servicoId: item.servicoId,
								valor: item.valor,
							}),
						),
					).pipe(
						switchMap(() => {
							if (!pendingLogo) {
								return of({ logoOk: true });
							}
							return this.clienteFacade.uploadLogo(created.id, pendingLogo).pipe(
								map(() => ({ logoOk: true })),
								catchError(() => of({ logoOk: false })),
							);
						}),
					);
				}),
			)
			.subscribe({
				next: (result: { logoOk: boolean }) => {
					this.saving.set(false);
					this.modalOpen.set(false);
					this.pendingLogoFile.set(null);
					this.pendingVinculos.set([]);
					this.toast.show(
						result.logoOk
							? 'Cliente criado com sucesso.'
							: 'Cliente criado, mas o upload do logo falhou.',
						result.logoOk ? 'success' : 'warning',
					);
					this.loadList();
				},
				error: (error: unknown) => {
					this.saving.set(false);
					if (error instanceof Error && error.message === 'INVALID_CREATE_RESPONSE') {
						this.toast.show('Cliente criado, mas resposta inválida.', 'warning');
						this.loadList();
					}
				},
			});
	}

	private loadList(): void {
		this.loading.set(true);
		const filtro = this.filtroForm().value();
		this.clienteFacade
			.list({
				page: this.page(),
				limit: this.pageSize(),
				search: filtro.nome.trim() || undefined,
				status: filtro.status || undefined,
			})
			.subscribe({
				next: (response: HttpResponse<ClienteListResponse>) => {
					this.loading.set(false);
					this.clientes.set(response.body?.items ?? []);
					this.total.set(response.body?.total ?? 0);
					this.counts.set(response.body?.counts ?? { total: 0, ativos: 0, inativos: 0 });
				},
				error: () => this.loading.set(false),
			});
	}

	private openEdit(cliente: Cliente): void {
		this.editingCliente.set(cliente);
		this.formValue.set(this.toFormValue(cliente));
		this.pendingLogoFile.set(null);
		this.pendingVinculos.set([]);
		this.modalOpen.set(true);
	}

	private onDelete(cliente: Cliente): void {
		this.clienteFacade.delete(cliente.id).subscribe({
			next: () => {
				this.toast.show('Cliente removido com sucesso.', 'success');
				this.loadList();
			},
		});
	}

	private revokeQrAfterDataChange(
		clienteId: number,
		dataChanged: boolean,
	): Observable<'skipped' | 'revoked' | 'failed'> {
		if (!dataChanged) {
			return of('skipped');
		}
		return this.clienteFacade.gerarQrCode(clienteId).pipe(
			map(() => 'revoked' as const),
			catchError(() => of('failed' as const)),
		);
	}

	private hasClienteDataChanged(original: Cliente, payload: CreateClientePayload): boolean {
		const norm = (value: string | null | undefined): string => (value ?? '').trim();
		return (
			original.nome !== payload.nome ||
			original.email !== payload.email ||
			original.tipoPessoa !== payload.tipoPessoa ||
			original.documento !== payload.documento ||
			original.status !== (payload.status ?? original.status) ||
			norm(original.contato) !== norm(payload.contato) ||
			norm(original.razaoSocial) !== norm(payload.razaoSocial) ||
			norm(original.nomeFantasia) !== norm(payload.nomeFantasia) ||
			norm(original.cep) !== norm(payload.cep) ||
			norm(original.uf) !== norm(payload.uf) ||
			norm(original.cidade) !== norm(payload.cidade) ||
			norm(original.logradouro) !== norm(payload.logradouro) ||
			norm(original.numero) !== norm(payload.numero) ||
			norm(original.complemento) !== norm(payload.complemento) ||
			norm(original.bairro) !== norm(payload.bairro) ||
			norm(original.ibge) !== norm(payload.ibge) ||
			norm(original.observacao) !== norm(payload.observacao) ||
			norm(original.numeroEndereco) !== norm(payload.numeroEndereco)
		);
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
