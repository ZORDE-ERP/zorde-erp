import { HttpResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	AppBrlCurrencyMaskDirective,
	AppBrlCurrencyPipe,
	AppButtonDirective,
	AppFieldComponent,
	AppInputDirective,
	AppModalComponent,
	AppSelectDirective,
	AppSpinnerComponent,
	AppTextareaDirective,
} from '@repo/angular-ui';
import { finalize } from 'rxjs';
import { ClienteSelectComponent } from '../../../../shared/components/cliente-select/cliente-select.component';
import { TabelaMontagem, TabelaMontagemListResponse } from '../../../tabela-montagem/models/tabela-montagem.model';
import { TabelaMontagemFacade } from '../../../tabela-montagem/tabela-montagem.facade';
import { calcItensTotal, toCreateItemPayload } from '../../model/ordem-servico-itens';
import type { CreateOrdemServicoPayload } from '../../models/ordem-servico.model';
import { OrdemServicoFacade } from '../../ordem-servico.facade';

export interface OrdemItemDraft {
	readonly key: string;
	tabelaMontagemId: number;
	nomeServico: string;
	quantidade: number;
	valorTabela: number;
	valorUnitario: number;
}

@Component({
	selector: 'app-ordem-servico-create-modal',
	templateUrl: './ordem-servico-create-modal.component.html',
	imports: [
		FormsModule,
		AppModalComponent,
		AppFieldComponent,
		AppInputDirective,
		AppSelectDirective,
		AppTextareaDirective,
		AppBrlCurrencyMaskDirective,
		AppBrlCurrencyPipe,
		AppButtonDirective,
		AppSpinnerComponent,
		ClienteSelectComponent,
	],
})
export class OrdemServicoCreateModalComponent {
	private readonly ordemFacade = inject(OrdemServicoFacade);
	private readonly tabelaFacade = inject(TabelaMontagemFacade);

	public readonly open = input(false);
	public readonly closed = output<void>();
	public readonly created = output<void>();

	public readonly clienteId = signal<number | null>(null);
	public readonly codigoOS = signal('');
	public readonly observacao = signal('');
	public readonly itens = signal<OrdemItemDraft[]>([]);
	public readonly tabelaItens = signal<readonly TabelaMontagem[]>([]);
	public readonly loadingTabela = signal(false);
	public readonly saving = signal(false);

	public readonly selectedTabelaId = signal<number | null>(null);
	public readonly draftQuantidade = signal(1);
	public readonly draftValor = signal<number | null>(null);

	public readonly total = computed(() => calcItensTotal(this.itens()));

	public readonly selectedTabelaItem = computed(() => {
		const id = this.selectedTabelaId();
		if (id === null) {
			return null;
		}
		return this.tabelaItens().find((item) => item.id === id) ?? null;
	});

	public readonly canAddItem = computed(() => {
		const selected = this.selectedTabelaItem();
		const qty = this.draftQuantidade();
		const valor = this.draftValor();
		return selected !== null && qty >= 1 && valor !== null && valor >= 0;
	});

	public readonly canSubmit = computed(() => this.clienteId() !== null && this.itens().length > 0);

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.reset();
			}
		});

		effect(() => {
			const clienteId = this.clienteId();
			if (!this.open() || clienteId === null) {
				this.tabelaItens.set([]);
				return;
			}
			this.loadTabela(clienteId);
		});

		effect(() => {
			const selected = this.selectedTabelaItem();
			if (selected) {
				this.draftValor.set(selected.valor);
			}
		});
	}

	public onClose(): void {
		this.closed.emit();
	}

	public onAddItem(): void {
		const selected = this.selectedTabelaItem();
		const quantidade = this.draftQuantidade();
		const valorUnitario = this.draftValor();
		if (!selected || quantidade < 1 || valorUnitario === null) {
			return;
		}

		this.itens.update((list) => [
			...list,
			{
				key: `${selected.id}-${Date.now()}`,
				tabelaMontagemId: selected.id,
				nomeServico: selected.nomeServico ?? `Serviço #${selected.servicoId}`,
				quantidade,
				valorTabela: selected.valor,
				valorUnitario,
			},
		]);

		this.selectedTabelaId.set(null);
		this.draftQuantidade.set(1);
		this.draftValor.set(null);
	}

	public onRemoveItem(key: string): void {
		this.itens.update((list) => list.filter((item) => item.key !== key));
	}

	public onSubmit(): void {
		const clienteId = this.clienteId();
		const itens = this.itens();
		if (clienteId === null || itens.length === 0) {
			return;
		}

		const payload: CreateOrdemServicoPayload = {
			clienteId,
			origem: 'MANUAL',
			codigoOS: this.codigoOS().trim() || undefined,
			observacao: this.observacao().trim() || undefined,
			itens: itens.map((item) => toCreateItemPayload(item)),
		};

		this.saving.set(true);
		this.ordemFacade
			.create(payload)
			.pipe(finalize(() => this.saving.set(false)))
			.subscribe({
				next: () => {
					this.created.emit();
					this.closed.emit();
				},
			});
	}

	private loadTabela(clienteId: number): void {
		this.loadingTabela.set(true);
		this.tabelaFacade
			.list(1, 500)
			.pipe(finalize(() => this.loadingTabela.set(false)))
			.subscribe({
				next: (response: HttpResponse<TabelaMontagemListResponse>) => {
					const items = (response.body?.items ?? []).filter((item) => item.clienteId === clienteId);
					this.tabelaItens.set(items);
				},
			});
	}

	private reset(): void {
		this.clienteId.set(null);
		this.codigoOS.set('');
		this.observacao.set('');
		this.itens.set([]);
		this.tabelaItens.set([]);
		this.selectedTabelaId.set(null);
		this.draftQuantidade.set(1);
		this.draftValor.set(null);
	}
}
