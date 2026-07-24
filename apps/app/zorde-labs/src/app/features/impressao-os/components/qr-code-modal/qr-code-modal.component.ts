import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import {
	AppBadgeComponent,
	AppButtonDirective,
	AppDateBrPipe,
	AppModalComponent,
	AppToastService,
} from '@repo/angular-ui';
import { finalize } from 'rxjs';
import { ClienteFacade } from '../../../clientes/cliente.facade';
import type { Cliente } from '../../../clientes/models/cliente.model';

@Component({
	selector: 'app-qr-code-modal',
	templateUrl: './qr-code-modal.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [AppModalComponent, AppButtonDirective, AppBadgeComponent, AppDateBrPipe],
})
export class QrCodeModalComponent {
	private readonly clienteFacade = inject(ClienteFacade);
	private readonly toast = inject(AppToastService);

	public readonly open = input(false);
	public readonly cliente = input<Cliente | null>(null);

	public readonly closed = output<void>();
	public readonly regenerated = output<Cliente>();

	protected readonly regenerating = signal(false);

	protected onClose(): void {
		if (this.regenerating()) {
			return;
		}
		this.closed.emit();
	}

	protected onRegenerar(): void {
		const cliente = this.cliente();
		if (!cliente) {
			return;
		}

		const confirmado = window.confirm(
			`Gerar um novo QR Code para "${cliente.nome}" invalida o QR Code atual. Clientes que já possuem o código impresso precisarão do novo. Deseja continuar?`,
		);
		if (!confirmado) {
			return;
		}

		this.regenerating.set(true);
		this.clienteFacade
			.gerarQrCode(cliente.id)
			.pipe(finalize(() => this.regenerating.set(false)))
			.subscribe({
				next: (response) => {
					const resultado = response.body;
					if (!resultado) {
						return;
					}
					this.toast.show('QR Code regenerado com sucesso.', 'success');
					this.regenerated.emit({
						...cliente,
						qrCodeUrl: resultado.qrCodeUrl,
						qrGeradoEm: resultado.qrGeradoEm,
					});
				},
				error: () => this.toast.show('Não foi possível regenerar o QR Code. Tente novamente.', 'error'),
			});
	}
}
