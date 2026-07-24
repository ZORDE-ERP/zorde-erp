import { Component, effect, inject, input, model, OnInit, output, signal } from '@angular/core';
import { AppSearchableSelectComponent, AppSearchableSelectOption } from '@repo/angular-ui';
import { ServicoFacade } from '../../../features/servicos/servico.facade';

const SERVICO_SELECT_PAGE_LIMIT = 200;

@Component({
	selector: 'app-servico-select',
	templateUrl: './servico-select.component.html',
	imports: [AppSearchableSelectComponent],
})
export class ServicoSelectComponent implements OnInit {
	private readonly servicoFacade = inject(ServicoFacade);

	public readonly value = model<number | null>(null);
	public readonly placeholder = input('Buscar serviço...');
	public readonly disabled = input(false);

	/** Emite a opção (id + nome) selecionada sempre que `value` ou a lista de opções mudar. */
	public readonly selectedOption = output<AppSearchableSelectOption | null>();

	protected readonly loading = signal(false);
	protected readonly options = signal<readonly AppSearchableSelectOption[]>([]);

	public constructor() {
		effect(() => {
			const selected = this.options().find((option) => option.value === this.value()) ?? null;
			this.selectedOption.emit(selected);
		});
	}

	public ngOnInit(): void {
		this.loadServicos();
	}

	private loadServicos(): void {
		this.loading.set(true);
		this.servicoFacade.list(1, SERVICO_SELECT_PAGE_LIMIT).subscribe({
			next: (response) => {
				const servicos = response.body?.items ?? [];
				this.options.set(servicos.map((servico) => ({ value: servico.id, label: servico.nome })));
			},
			error: () => this.loading.set(false),
			complete: () => this.loading.set(false),
		});
	}
}
