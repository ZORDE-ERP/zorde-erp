import type { HttpResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	LucideCircleCheck,
	LucideDynamicIcon,
	LucidePencil,
	LucideTrash2,
	LucideX,
	provideLucideIcons,
} from '@lucide/angular';
import {
	AppBadgeComponent,
	AppBrlCurrencyMaskDirective,
	AppBrlCurrencyPipe,
	AppButtonDirective,
	AppDateBrPipe,
	AppFieldComponent,
	AppIconButtonDirective,
	AppInputDirective,
	AppModalComponent,
	AppSelectDirective,
	AppSpinnerComponent,
	AppTabItem,
	AppTabsComponent,
	AppToastService,
} from '@repo/angular-ui';
import { finalize } from 'rxjs';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { PessoaFormComponent } from '../../../../shared/components/pessoa-form/pessoa-form.component';
import { EMPTY_PESSOA_FORM_VALUE, PessoaFormValue } from '../../../../shared/components/pessoa-form/pessoa-form.model';
import type { Servico, ServicoListResponse } from '../../../servicos/models/service.model';
import { ServicoFacade } from '../../../servicos/servico.facade';
import type { TabelaMontagem, TabelaMontagemListResponse } from '../../../tabela-montagem/models/tabela-montagem.model';
import { TabelaMontagemFacade } from '../../../tabela-montagem/tabela-montagem.facade';
import { ClienteFacade } from '../../cliente.facade';
import type { Cliente, ClienteQrCodeResponse } from '../../models/cliente.model';

export interface PendingClienteVinculo {
	tempId: number;
	servicoId: number;
	valor: number;
	nomeServico: string;
}

const BASE_TABS: readonly AppTabItem[] = [
	{ id: 'dados', label: 'Dados Pessoais' },
	{ id: 'endereco', label: 'Endereço' },
	{ id: 'imagem', label: 'Imagem' },
	{ id: 'tabela', label: 'Tabela de Montagem' },
];

const QR_TAB: AppTabItem = { id: 'qrcode', label: 'QR Code' };

@Component({
	selector: 'app-cliente-form-modal',
	templateUrl: './cliente-form-modal.component.html',
	imports: [
		FormsModule,
		AppModalComponent,
		AppTabsComponent,
		AppButtonDirective,
		AppBadgeComponent,
		AppDateBrPipe,
		AppFieldComponent,
		AppInputDirective,
		AppSelectDirective,
		AppIconButtonDirective,
		AppSpinnerComponent,
		AppBrlCurrencyMaskDirective,
		AppBrlCurrencyPipe,
		PessoaFormComponent,
		FileUploadComponent,
		LucideDynamicIcon,
	],
	providers: [provideLucideIcons(LucideCircleCheck, LucideX, LucidePencil, LucideTrash2)],
})
export class ClienteFormModalComponent {
	private readonly servicoFacade = inject(ServicoFacade);
	private readonly tabelaMontagemFacade = inject(TabelaMontagemFacade);
	private readonly clienteFacade = inject(ClienteFacade);
	private readonly toast = inject(AppToastService);

	private nextPendingId = 1;

	public readonly open = input(false);
	public readonly clienteId = input<number | null>(null);
	public readonly logoUrl = input<string | null>(null);
	public readonly qrCodeUrl = input<string | null>(null);
	public readonly qrGeradoEm = input<string | Date | null>(null);
	public readonly title = input('Novo Cliente');
	public readonly saving = input(false);

	public readonly value = model<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);
	public readonly pendingLogoFile = model<File | null>(null);
	public readonly pendingVinculos = model<readonly PendingClienteVinculo[]>([]);

	public readonly closed = output<void>();
	public readonly submitted = output<void>();
	public readonly logoChanged = output<Cliente>();
	public readonly qrRevoked = output<Cliente>();

	protected readonly tabs = computed<readonly AppTabItem[]>(() =>
		this.isCreateMode() ? BASE_TABS : [...BASE_TABS, QR_TAB],
	);
	protected readonly activeTab = signal<string>('dados');
	protected readonly logoLoading = signal(false);
	protected readonly currentLogoUrl = signal<string | null>(null);
	protected readonly currentQrCodeUrl = signal<string | null>(null);
	protected readonly currentQrGeradoEm = signal<string | Date | null>(null);
	protected readonly revokingQr = signal(false);

	protected readonly servicos = signal<readonly Servico[]>([]);
	protected readonly servicosLoading = signal(false);
	protected readonly vinculos = signal<readonly TabelaMontagem[]>([]);
	protected readonly vinculosLoading = signal(false);

	protected readonly novoServicoId = signal<number | null>(null);
	protected readonly novoValor = signal<number | null>(null);
	protected readonly editingVinculoId = signal<number | null>(null);
	protected readonly editingValor = signal<number | null>(null);

	protected readonly isCreateMode = computed(() => this.clienteId() === null);

	protected readonly previewLogoUrl = computed(() => this.currentLogoUrl() ?? this.logoUrl());

	protected readonly confirmDisabled = computed(() => {
		if (!this.isCreateMode()) {
			return false;
		}
		if (this.servicosLoading()) {
			return true;
		}
		if (this.servicos().length === 0) {
			return true;
		}
		return this.pendingVinculos().length === 0;
	});

	protected readonly displayVinculos = computed((): readonly TabelaMontagem[] => {
		if (!this.isCreateMode()) {
			return this.vinculos();
		}
		return this.pendingVinculos().map((item) => ({
			id: item.tempId,
			clienteId: 0,
			servicoId: item.servicoId,
			nomeServico: item.nomeServico,
			valor: item.valor,
			createdAt: '',
		}));
	});

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.activeTab.set('dados');
				this.resetVinculoForm();
				this.pendingLogoFile.set(null);
				this.currentLogoUrl.set(this.logoUrl());
				this.currentQrCodeUrl.set(this.qrCodeUrl());
				this.currentQrGeradoEm.set(this.qrGeradoEm());
				this.revokingQr.set(false);
				this.loadServicos();
			}
		});

		effect(() => {
			const clienteId = this.clienteId();
			const tab = this.activeTab();
			if (this.open() && tab === 'tabela' && clienteId !== null) {
				this.loadVinculos(clienteId);
			}
		});
	}

	protected nomeServico(servicoId: number): string {
		return this.servicos().find((servico) => servico.id === servicoId)?.nome ?? `Serviço #${servicoId}`;
	}

	protected onClose(): void {
		this.closed.emit();
	}

	protected onSubmit(): void {
		if (this.isCreateMode()) {
			if (this.servicos().length === 0) {
				this.toast.show('Cadastre ao menos um serviço antes de criar um cliente.', 'warning');
				this.activeTab.set('tabela');
				return;
			}
			if (this.pendingVinculos().length === 0) {
				this.toast.show('Adicione ao menos um serviço na Tabela de Montagem para continuar.', 'warning');
				this.activeTab.set('tabela');
				return;
			}
		}
		this.submitted.emit();
	}

	protected onLogoSelected(file: File): void {
		const clienteId = this.clienteId();
		if (clienteId === null) {
			this.pendingLogoFile.set(file);
			return;
		}

		this.logoLoading.set(true);
		this.clienteFacade.uploadLogo(clienteId, file).subscribe({
			next: (response: HttpResponse<Cliente>) => {
				this.logoLoading.set(false);
				const updated = response.body;
				if (updated) {
					this.currentLogoUrl.set(updated.logoUrl ?? null);
					this.logoChanged.emit(updated);
					this.revokeQrSilently(clienteId, updated);
				}
				this.toast.show('Logo atualizado com sucesso.', 'success');
			},
			error: () => this.logoLoading.set(false),
		});
	}

	protected onLogoCleared(): void {
		const clienteId = this.clienteId();
		if (clienteId === null) {
			this.pendingLogoFile.set(null);
			this.currentLogoUrl.set(null);
			return;
		}

		this.logoLoading.set(true);
		this.clienteFacade.removerLogo(clienteId).subscribe({
			next: (response: HttpResponse<Cliente>) => {
				this.logoLoading.set(false);
				const updated = response.body;
				this.currentLogoUrl.set(null);
				if (updated) {
					this.logoChanged.emit(updated);
					this.revokeQrSilently(clienteId, updated);
				}
				this.toast.show('Logo removido.', 'success');
			},
			error: () => this.logoLoading.set(false),
		});
	}

	protected onRevogarQr(): void {
		const clienteId = this.clienteId();
		if (clienteId === null || this.revokingQr()) {
			return;
		}

		const confirmado = window.confirm(
			'Revogar o QR Code invalida o código atual imediatamente. Folhas de OS já impressas ficarão com o QR desatualizado e precisarão ser reimpressas. Deseja continuar?',
		);
		if (!confirmado) {
			return;
		}

		this.revokingQr.set(true);
		this.clienteFacade
			.gerarQrCode(clienteId)
			.pipe(finalize(() => this.revokingQr.set(false)))
			.subscribe({
				next: (response: HttpResponse<ClienteQrCodeResponse>) => {
					const resultado = response.body;
					if (!resultado) {
						return;
					}
					this.applyQrResult(resultado);
					this.toast.show('QR Code revogado e regenerado com sucesso.', 'success');
				},
				error: () => this.toast.show('Não foi possível revogar o QR Code. Tente novamente.', 'error'),
			});
	}

	private revokeQrSilently(clienteId: number, clienteBase: Cliente): void {
		this.clienteFacade.gerarQrCode(clienteId).subscribe({
			next: (response: HttpResponse<ClienteQrCodeResponse>) => {
				const resultado = response.body;
				if (!resultado) {
					return;
				}
				this.applyQrResult(resultado, clienteBase);
			},
		});
	}

	private applyQrResult(resultado: ClienteQrCodeResponse, clienteBase?: Cliente): void {
		this.currentQrCodeUrl.set(resultado.qrCodeUrl);
		this.currentQrGeradoEm.set(resultado.qrGeradoEm);

		const base = clienteBase ?? {
			id: resultado.clienteId,
			nome: this.value().nome,
			email: this.value().email,
			tipoPessoa: this.value().tipoPessoa,
			documento: this.value().documento,
			status: this.value().status,
			usuarioId: 0,
			createdAt: null,
			logoUrl: this.currentLogoUrl(),
		};

		this.qrRevoked.emit({
			...base,
			id: resultado.clienteId,
			qrCodeUrl: resultado.qrCodeUrl,
			qrGeradoEm: resultado.qrGeradoEm,
		});
	}

	protected addVinculo(): void {
		const servicoId = this.novoServicoId();
		const valor = this.novoValor();

		if (servicoId === null || valor === null || valor <= 0) {
			this.toast.show('Selecione o serviço e informe um valor válido para adicionar.', 'warning');
			return;
		}

		if (this.isCreateMode()) {
			if (this.pendingVinculos().some((item) => item.servicoId === servicoId)) {
				this.toast.show('Este serviço já foi adicionado à tabela de montagem.', 'warning');
				return;
			}

			this.pendingVinculos.update((list) => [
				...list,
				{
					tempId: this.nextPendingId++,
					servicoId,
					valor,
					nomeServico: this.nomeServico(servicoId),
				},
			]);
			this.resetVinculoForm();
			return;
		}

		const clienteId = this.clienteId();
		if (clienteId === null) {
			return;
		}

		if (this.vinculos().some((item) => item.servicoId === servicoId)) {
			this.toast.show('Este serviço já está vinculado a este cliente.', 'warning');
			return;
		}

		this.tabelaMontagemFacade.create({ clienteId, servicoId, valor }).subscribe({
			next: () => {
				this.toast.show('Vínculo adicionado à tabela de montagem.', 'success');
				this.resetVinculoForm();
				this.loadVinculos(clienteId);
			},
		});
	}

	protected startEdit(vinculo: TabelaMontagem): void {
		this.editingVinculoId.set(vinculo.id);
		this.editingValor.set(vinculo.valor);
	}

	protected cancelEdit(): void {
		this.editingVinculoId.set(null);
		this.editingValor.set(null);
	}

	protected saveEdit(): void {
		const id = this.editingVinculoId();
		const valor = this.editingValor();

		if (id === null || valor === null || valor <= 0) {
			this.toast.show('Informe um valor válido.', 'warning');
			return;
		}

		if (this.isCreateMode()) {
			this.pendingVinculos.update((list) =>
				list.map((item) => (item.tempId === id ? { ...item, valor } : item)),
			);
			this.cancelEdit();
			return;
		}

		const clienteId = this.clienteId();
		if (clienteId === null) {
			return;
		}

		this.tabelaMontagemFacade.update(id, { valor }).subscribe({
			next: () => {
				this.toast.show('Valor atualizado.', 'success');
				this.cancelEdit();
				this.loadVinculos(clienteId);
			},
		});
	}

	protected removeVinculo(id: number): void {
		if (this.isCreateMode()) {
			this.pendingVinculos.update((list) => list.filter((item) => item.tempId !== id));
			if (this.editingVinculoId() === id) {
				this.cancelEdit();
			}
			return;
		}

		const clienteId = this.clienteId();
		if (clienteId === null) {
			return;
		}

		this.tabelaMontagemFacade.delete(id).subscribe({
			next: () => {
				this.toast.show('Vínculo removido.', 'success');
				this.loadVinculos(clienteId);
			},
		});
	}

	private resetVinculoForm(): void {
		this.novoServicoId.set(null);
		this.novoValor.set(null);
		this.editingVinculoId.set(null);
		this.editingValor.set(null);
	}

	private loadServicos(): void {
		this.servicosLoading.set(true);
		this.servicoFacade.list(1, 100).subscribe({
			next: (response: HttpResponse<ServicoListResponse>) => {
				this.servicosLoading.set(false);
				this.servicos.set(response.body?.items ?? []);
			},
			error: () => {
				this.servicosLoading.set(false);
				this.servicos.set([]);
			},
		});
	}

	private loadVinculos(clienteId: number): void {
		this.vinculosLoading.set(true);
		this.tabelaMontagemFacade.list({ page: 1, limit: 100, clienteId }).subscribe({
			next: (response: HttpResponse<TabelaMontagemListResponse>) => {
				this.vinculosLoading.set(false);
				this.vinculos.set(response.body?.items ?? []);
			},
			error: () => this.vinculosLoading.set(false),
		});
	}
}
