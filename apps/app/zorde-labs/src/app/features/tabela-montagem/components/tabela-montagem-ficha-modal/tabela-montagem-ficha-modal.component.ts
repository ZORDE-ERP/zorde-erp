import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePlus, LucideTrash2 } from '@lucide/angular';
import {
	AppBrlCurrencyMaskDirective,
	AppBrlCurrencyPipe,
	AppButtonDirective,
	AppFieldComponent,
	AppIconButtonDirective,
	AppInputDirective,
	AppModalComponent,
	AppSearchableSelectOption,
	AppToastService,
} from '@repo/angular-ui';
import { finalize, forkJoin, Observable } from 'rxjs';
import { ServicoSelectComponent } from '../../../../shared/components/servico-select/servico-select.component';
import { TabelaMontagemAggregatedRow } from '../../model/tabela-montagem-table';
import { TabelaMontagem } from '../../models/tabela-montagem.model';
import { TabelaMontagemFacade } from '../../tabela-montagem.facade';

export type TabelaMontagemFichaMode = 'visualizar' | 'editar';

interface DraftVinculo {
	readonly key: string;
	readonly id: number | null;
	readonly servicoId: number;
	readonly nomeServico: string;
	readonly valor: number;
}

const DUPLICATE_VINCULO_MESSAGE = 'Este cliente já possui esse serviço vinculado.';

@Component({
	selector: 'app-tabela-montagem-ficha-modal',
	templateUrl: './tabela-montagem-ficha-modal.component.html',
	imports: [
		FormsModule,
		AppModalComponent,
		AppFieldComponent,
		AppInputDirective,
		AppBrlCurrencyMaskDirective,
		AppBrlCurrencyPipe,
		AppButtonDirective,
		AppIconButtonDirective,
		ServicoSelectComponent,
		LucidePlus,
		LucideTrash2,
	],
})
export class TabelaMontagemFichaModalComponent {
	private readonly tabelaMontagemFacade = inject(TabelaMontagemFacade);
	private readonly toast = inject(AppToastService);

	public readonly open = input(false);
	public readonly row = input<TabelaMontagemAggregatedRow | null>(null);
	public readonly mode = input<TabelaMontagemFichaMode>('visualizar');

	public readonly closed = output<void>();
	public readonly saved = output<void>();

	public readonly draftItens = signal<readonly DraftVinculo[]>([]);
	public readonly novoServicoId = signal<number | null>(null);
	public readonly novoServicoOption = signal<AppSearchableSelectOption | null>(null);
	public readonly novoValor = signal<number | null>(null);
	public readonly saving = signal(false);

	public readonly isEditMode = computed((): boolean => this.mode() === 'editar');

	public readonly novoIsDuplicate = computed((): boolean => {
		const servicoId = this.novoServicoId();
		if (servicoId === null) {
			return false;
		}
		return this.draftItens().some((item) => item.servicoId === servicoId);
	});

	public readonly canAddNovo = computed((): boolean => {
		return this.novoServicoId() !== null && (this.novoValor() ?? 0) > 0 && !this.novoIsDuplicate();
	});

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.resetDraft();
			}
		});
	}

	public onClose(): void {
		this.closed.emit();
	}

	public onNovoServicoOptionChange(option: AppSearchableSelectOption | null): void {
		this.novoServicoOption.set(option);
	}

	public removeItem(key: string): void {
		this.draftItens.update((itens) => itens.filter((item) => item.key !== key));
	}

	public updateValor(key: string, valor: number | null): void {
		this.draftItens.update((itens) => itens.map((item) => (item.key === key ? { ...item, valor: valor ?? 0 } : item)));
	}

	public addNovoVinculo(): void {
		const servicoId = this.novoServicoId();
		const valor = this.novoValor();
		if (servicoId === null || valor === null || valor <= 0) {
			return;
		}
		if (this.novoIsDuplicate()) {
			this.toast.show(DUPLICATE_VINCULO_MESSAGE, 'error');
			return;
		}

		const nomeServico = this.novoServicoOption()?.label ?? `Serviço #${servicoId}`;
		this.draftItens.update((itens) => [
			...itens,
			{ key: `new-${servicoId}-${Date.now()}`, id: null, servicoId, nomeServico, valor },
		]);
		this.novoServicoId.set(null);
		this.novoServicoOption.set(null);
		this.novoValor.set(null);
	}

	public onSave(): void {
		const currentRow = this.row();
		if (!currentRow || this.saving()) {
			return;
		}

		const draft = this.draftItens();
		const currentIds = new Set(draft.filter((item) => item.id !== null).map((item) => item.id as number));
		const idsToDelete = currentRow.itens.map((item) => item.id).filter((id) => !currentIds.has(id));

		const toUpdate = draft.filter((item): item is DraftVinculo & { id: number } => {
			if (item.id === null) {
				return false;
			}
			const original = currentRow.itens.find((orig) => orig.id === item.id);
			return original !== undefined && original.valor !== item.valor;
		});
		const toCreate = draft.filter((item) => item.id === null);

		const requests: Observable<unknown>[] = [
			...idsToDelete.map((id) => this.tabelaMontagemFacade.delete(id)),
			...toUpdate.map((item) => this.tabelaMontagemFacade.update(item.id, { valor: item.valor })),
			...toCreate.map((item) =>
				this.tabelaMontagemFacade.create({
					clienteId: currentRow.clienteId,
					servicoId: item.servicoId,
					valor: item.valor,
				}),
			),
		];

		if (requests.length === 0) {
			this.closed.emit();
			return;
		}

		this.saving.set(true);
		forkJoin(requests)
			.pipe(finalize(() => this.saving.set(false)))
			.subscribe({
				next: () => {
					this.toast.show('Alterações salvas com sucesso!', 'success');
					this.saved.emit();
				},
			});
	}

	private resetDraft(): void {
		const itens: readonly TabelaMontagem[] = this.row()?.itens ?? [];
		this.draftItens.set(
			itens.map((item) => ({
				key: `existing-${item.id}`,
				id: item.id,
				servicoId: item.servicoId,
				nomeServico: item.nomeServico?.trim() || `Serviço #${item.servicoId}`,
				valor: item.valor,
			})),
		);
		this.novoServicoId.set(null);
		this.novoServicoOption.set(null);
		this.novoValor.set(null);
	}
}
