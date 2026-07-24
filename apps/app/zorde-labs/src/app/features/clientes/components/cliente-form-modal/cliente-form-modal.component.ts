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
	AppBrlCurrencyMaskDirective,
	AppBrlCurrencyPipe,
	AppButtonDirective,
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
import { PessoaFormComponent } from '../../../../shared/components/pessoa-form/pessoa-form.component';
import { EMPTY_PESSOA_FORM_VALUE, PessoaFormValue } from '../../../../shared/components/pessoa-form/pessoa-form.model';
import type { Servico, ServicoListResponse } from '../../../servicos/models/service.model';
import { ServicoFacade } from '../../../servicos/servico.facade';
import type { TabelaMontagem, TabelaMontagemListResponse } from '../../../tabela-montagem/models/tabela-montagem.model';
import { TabelaMontagemFacade } from '../../../tabela-montagem/tabela-montagem.facade';

const DADOS_ENDERECO_TABS: readonly AppTabItem[] = [
	{ id: 'dados', label: 'Dados Pessoais' },
	{ id: 'endereco', label: 'Endereço' },
];

@Component({
	selector: 'app-cliente-form-modal',
	templateUrl: './cliente-form-modal.component.html',
	imports: [
		FormsModule,
		AppModalComponent,
		AppTabsComponent,
		AppButtonDirective,
		AppFieldComponent,
		AppInputDirective,
		AppSelectDirective,
		AppIconButtonDirective,
		AppSpinnerComponent,
		AppBrlCurrencyMaskDirective,
		AppBrlCurrencyPipe,
		PessoaFormComponent,
		LucideDynamicIcon,
	],
	providers: [provideLucideIcons(LucideCircleCheck, LucideX, LucidePencil, LucideTrash2)],
})
export class ClienteFormModalComponent {
	private readonly servicoFacade = inject(ServicoFacade);
	private readonly tabelaMontagemFacade = inject(TabelaMontagemFacade);
	private readonly toast = inject(AppToastService);

	public readonly open = input(false);
	public readonly clienteId = input<number | null>(null);
	public readonly title = input('Novo Cliente');
	public readonly saving = input(false);

	public readonly value = model<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);

	public readonly closed = output<void>();
	public readonly submitted = output<void>();

	protected readonly activeTab = signal<string>('dados');

	protected readonly servicos = signal<readonly Servico[]>([]);
	protected readonly vinculos = signal<readonly TabelaMontagem[]>([]);
	protected readonly vinculosLoading = signal(false);

	protected readonly novoServicoId = signal<number | null>(null);
	protected readonly novoValor = signal<number | null>(null);
	protected readonly editingVinculoId = signal<number | null>(null);
	protected readonly editingValor = signal<number | null>(null);

	protected readonly tabs = computed<readonly AppTabItem[]>(() => {
		if (this.clienteId() === null) {
			return DADOS_ENDERECO_TABS;
		}
		return [...DADOS_ENDERECO_TABS, { id: 'tabela', label: 'Tabela de Montagem' }];
	});

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.activeTab.set('dados');
				this.resetVinculoForm();
			}
		});

		effect(() => {
			const clienteId = this.clienteId();
			const tab = this.activeTab();
			if (this.open() && tab === 'tabela' && clienteId !== null) {
				this.loadServicos();
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
		this.submitted.emit();
	}

	protected addVinculo(): void {
		const clienteId = this.clienteId();
		const servicoId = this.novoServicoId();
		const valor = this.novoValor();

		if (clienteId === null || servicoId === null || valor === null) {
			this.toast.show('Selecione o serviço e informe o valor para adicionar.', 'warning');
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
		const clienteId = this.clienteId();

		if (id === null || valor === null || clienteId === null) {
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
		this.servicoFacade.list(1, 100).subscribe({
			next: (response: HttpResponse<ServicoListResponse>) => this.servicos.set(response.body?.items ?? []),
		});
	}

	private loadVinculos(clienteId: number): void {
		this.vinculosLoading.set(true);
		this.tabelaMontagemFacade.list(1, 100).subscribe({
			next: (response: HttpResponse<TabelaMontagemListResponse>) => {
				this.vinculosLoading.set(false);
				const items = response.body?.items ?? [];
				this.vinculos.set(items.filter((item) => item.clienteId === clienteId));
			},
			error: () => this.vinculosLoading.set(false),
		});
	}
}
