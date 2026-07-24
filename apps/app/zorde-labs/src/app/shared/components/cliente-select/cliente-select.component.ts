import { HttpResponse } from '@angular/common/http';
import { Component, inject, input, model, OnInit, signal } from '@angular/core';
import { AppSearchableSelectComponent, AppSearchableSelectOption } from '@repo/angular-ui';
import { ClienteFacade } from '../../../features/clientes/cliente.facade';
import { Cliente } from '../../../features/clientes/models/cliente.model';

@Component({
	selector: 'app-cliente-select',
	templateUrl: './cliente-select.component.html',
	imports: [AppSearchableSelectComponent],
})
export class ClienteSelectComponent implements OnInit {
	private readonly clienteFacade = inject(ClienteFacade);

	public readonly value = model<number | null>(null);
	public readonly placeholder = input('Buscar cliente...');
	public readonly disabled = input(false);

	protected readonly loading = signal(false);
	protected readonly options = signal<readonly AppSearchableSelectOption[]>([]);

	public ngOnInit(): void {
		this.loadClientes();
	}

	private loadClientes(): void {
		this.loading.set(true);
		this.clienteFacade.list().subscribe({
			next: (response: HttpResponse<Cliente[]>) => {
				const clientes = response.body ?? [];
				this.options.set(clientes.map((cliente: Cliente) => ({ value: cliente.id, label: cliente.nome })));
			},
			error: () => this.loading.set(false),
			complete: () => this.loading.set(false),
		});
	}
}
