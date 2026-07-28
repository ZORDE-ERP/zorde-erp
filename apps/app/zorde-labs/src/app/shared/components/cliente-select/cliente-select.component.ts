import { HttpResponse } from '@angular/common/http';
import { Component, effect, inject, input, model, OnDestroy, signal } from '@angular/core';
import { AppSearchableSelectComponent, AppSearchableSelectOption } from '@repo/angular-ui';
import { ClienteFacade } from '../../../features/clientes/cliente.facade';
import { Cliente, ClienteListResponse } from '../../../features/clientes/models/cliente.model';

const LOOKUP_LIMIT = 20;

@Component({
	selector: 'app-cliente-select',
	templateUrl: './cliente-select.component.html',
	imports: [AppSearchableSelectComponent],
})
export class ClienteSelectComponent implements OnDestroy {
	private readonly clienteFacade = inject(ClienteFacade);

	public readonly value = model<number | null>(null);
	public readonly placeholder = input('Buscar cliente...');
	public readonly disabled = input(false);

	protected readonly loading = signal(false);
	protected readonly options = signal<readonly AppSearchableSelectOption[]>([]);

	private searchTimer: ReturnType<typeof setTimeout> | null = null;
	private lastQuery = '';

	public constructor() {
		effect(() => {
			const selectedId = this.value();
			if (selectedId == null) {
				return;
			}
			const exists = this.options().some((option) => option.value === selectedId);
			if (!exists) {
				this.ensureSelectedOption(selectedId);
			}
		});

		this.searchClientes('');
	}

	public ngOnDestroy(): void {
		if (this.searchTimer !== null) {
			clearTimeout(this.searchTimer);
		}
	}

	protected onQueryChange(query: string): void {
		if (this.searchTimer !== null) {
			clearTimeout(this.searchTimer);
		}
		this.searchTimer = setTimeout(() => {
			this.searchClientes(query);
		}, 300);
	}

	private searchClientes(query: string): void {
		const term = query.trim();
		this.lastQuery = term;
		this.loading.set(true);
		this.clienteFacade.list({ page: 1, limit: LOOKUP_LIMIT, search: term || undefined }).subscribe({
			next: (response: HttpResponse<ClienteListResponse>) => {
				if (this.lastQuery !== term) {
					return;
				}
				const items = response.body?.items ?? [];
				this.options.set(this.mergeSelected(items.map((cliente) => ({ value: cliente.id, label: cliente.nome }))));
			},
			error: () => this.loading.set(false),
			complete: () => this.loading.set(false),
		});
	}

	private ensureSelectedOption(clienteId: number): void {
		this.clienteFacade.getById(clienteId).subscribe({
			next: (response: HttpResponse<Cliente>) => {
				const cliente = response.body;
				if (!cliente) {
					return;
				}
				this.options.update((current) => {
					if (current.some((option) => option.value === cliente.id)) {
						return current;
					}
					return [{ value: cliente.id, label: cliente.nome }, ...current];
				});
			},
		});
	}

	private mergeSelected(options: readonly AppSearchableSelectOption[]): readonly AppSearchableSelectOption[] {
		const selectedId = this.value();
		if (selectedId == null) {
			return options;
		}
		const selected = this.options().find((option) => option.value === selectedId);
		if (!selected || options.some((option) => option.value === selectedId)) {
			return options;
		}
		return [selected, ...options];
	}
}
