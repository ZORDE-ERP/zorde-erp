import { HttpResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { LucidePlus } from '@lucide/angular';
import { AppButtonDirective, AppCardImports } from '@repo/angular-ui';
import type { DataTableActionEvent } from '../../../shared/components/data-table/data-table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TabelaMontagemCreateModalComponent } from '../components/tabela-montagem-create-modal/tabela-montagem-create-modal.component';
import {
	TabelaMontagemFichaModalComponent,
	TabelaMontagemFichaMode,
} from '../components/tabela-montagem-ficha-modal/tabela-montagem-ficha-modal.component';
import { TabelaMontagemFiltroComponent } from '../components/tabela-montagem-filtro/tabela-montagem-filtro.component';
import { TabelaMontagemTableComponent } from '../components/tabela-montagem-table/tabela-montagem-table.component';
import { TabelaMontagemFiltroModel } from '../model/tabela-montagem-filtro';
import { aggregateTabelaMontagemPorCliente, TabelaMontagemAggregatedRow } from '../model/tabela-montagem-table';
import { TabelaMontagem, TabelaMontagemListResponse } from '../models/tabela-montagem.model';
import { TabelaMontagemFacade } from '../tabela-montagem.facade';

const LIST_PAGE_LIMIT = 500;

@Component({
	selector: 'app-tabela-montagem',
	templateUrl: './tabela-montagem.component.html',
	imports: [
		FormsModule,
		PageHeaderComponent,
		AppButtonDirective,
		...AppCardImports,
		LucidePlus,
		TabelaMontagemFiltroComponent,
		TabelaMontagemTableComponent,
		TabelaMontagemFichaModalComponent,
		TabelaMontagemCreateModalComponent,
	],
})
export class TabelaMontagemComponent {
	private readonly tabelaMontagemFacade = inject(TabelaMontagemFacade);

	public readonly items = signal<readonly TabelaMontagem[]>([]);
	public readonly loading = signal(false);

	private readonly filtroModel = signal<TabelaMontagemFiltroModel>({ clienteId: null });
	public readonly filtroForm = form(this.filtroModel);

	public readonly aggregatedRows = computed((): readonly TabelaMontagemAggregatedRow[] =>
		aggregateTabelaMontagemPorCliente(this.items()),
	);

	public readonly fichaOpen = signal(false);
	public readonly fichaMode = signal<TabelaMontagemFichaMode>('visualizar');
	public readonly fichaRow = signal<TabelaMontagemAggregatedRow | null>(null);

	public readonly createOpen = signal(false);

	public constructor() {
		this.loadList();
	}

	public loadList(): void {
		this.loading.set(true);
		const clienteId = this.filtroForm().value().clienteId;
		this.tabelaMontagemFacade
			.list({ page: 1, limit: LIST_PAGE_LIMIT, clienteId: clienteId ?? undefined })
			.subscribe({
				next: (response: HttpResponse<TabelaMontagemListResponse>) => {
					this.items.set(response.body?.items ?? []);
				},
				error: () => this.loading.set(false),
				complete: () => this.loading.set(false),
			});
	}

	public onRowAction(event: DataTableActionEvent<TabelaMontagemAggregatedRow>): void {
		if (event.action.value !== 'visualizar' && event.action.value !== 'editar') {
			return;
		}
		this.fichaMode.set(event.action.value);
		this.fichaRow.set(event.row);
		this.fichaOpen.set(true);
	}

	public onCreate(): void {
		this.createOpen.set(true);
	}

	public onClearFilter(): void {
		this.filtroModel.set({ clienteId: null });
		this.loadList();
	}

	public onSearch(): void {
		this.loadList();
	}

	public onFichaClosed(): void {
		this.fichaOpen.set(false);
	}

	public onFichaSaved(): void {
		this.fichaOpen.set(false);
		this.loadList();
	}

	public onCreateClosed(): void {
		this.createOpen.set(false);
	}

	public onCreateCreated(): void {
		this.createOpen.set(false);
		this.loadList();
	}
}
