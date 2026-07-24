import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	AppBrlCurrencyMaskDirective,
	AppBrlCurrencyPipe,
	AppFieldComponent,
	AppInputDirective,
	AppModalComponent,
	AppToastService,
} from '@repo/angular-ui';
import { finalize } from 'rxjs';
import { ClienteSelectComponent } from '../../../../shared/components/cliente-select/cliente-select.component';
import { ServicoSelectComponent } from '../../../../shared/components/servico-select/servico-select.component';
import { TabelaMontagem } from '../../models/tabela-montagem.model';
import { TabelaMontagemFacade } from '../../tabela-montagem.facade';

const DUPLICATE_VINCULO_MESSAGE = 'Este cliente já possui esse serviço vinculado.';

@Component({
	selector: 'app-tabela-montagem-create-modal',
	templateUrl: './tabela-montagem-create-modal.component.html',
	imports: [
		FormsModule,
		AppModalComponent,
		AppFieldComponent,
		AppInputDirective,
		AppBrlCurrencyMaskDirective,
		AppBrlCurrencyPipe,
		ClienteSelectComponent,
		ServicoSelectComponent,
	],
})
export class TabelaMontagemCreateModalComponent {
	private readonly tabelaMontagemFacade = inject(TabelaMontagemFacade);
	private readonly toast = inject(AppToastService);

	public readonly open = input(false);
	public readonly existingItens = input<readonly TabelaMontagem[]>([]);

	public readonly closed = output<void>();
	public readonly created = output<void>();

	public readonly clienteId = signal<number | null>(null);
	public readonly servicoId = signal<number | null>(null);
	public readonly valor = signal<number | null>(null);
	public readonly saving = signal(false);

	public readonly clienteVinculos = computed((): readonly TabelaMontagem[] => {
		const clienteId = this.clienteId();
		if (clienteId === null) {
			return [];
		}
		return this.existingItens().filter((item) => item.clienteId === clienteId);
	});

	public readonly isDuplicate = computed((): boolean => {
		const servicoId = this.servicoId();
		if (servicoId === null) {
			return false;
		}
		return this.clienteVinculos().some((item) => item.servicoId === servicoId);
	});

	public readonly canSubmit = computed((): boolean => {
		return this.clienteId() !== null && this.servicoId() !== null && (this.valor() ?? 0) > 0;
	});

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.resetForm();
			}
		});
	}

	public onClose(): void {
		this.closed.emit();
	}

	public onSubmit(): void {
		const clienteId = this.clienteId();
		const servicoId = this.servicoId();
		const valor = this.valor();

		if (clienteId === null || servicoId === null || valor === null || valor <= 0) {
			return;
		}

		if (this.isDuplicate()) {
			this.toast.show(DUPLICATE_VINCULO_MESSAGE, 'error');
			return;
		}

		this.saving.set(true);
		this.tabelaMontagemFacade
			.create({ clienteId, servicoId, valor })
			.pipe(finalize(() => this.saving.set(false)))
			.subscribe({
				next: () => {
					this.toast.show('Vínculo criado com sucesso!', 'success');
					this.resetForm();
					this.created.emit();
				},
				// Erros (ex.: 409 de vínculo duplicado) já geram toast pelo httpErrorInterceptor global.
			});
	}

	private resetForm(): void {
		this.clienteId.set(null);
		this.servicoId.set(null);
		this.valor.set(null);
	}
}
