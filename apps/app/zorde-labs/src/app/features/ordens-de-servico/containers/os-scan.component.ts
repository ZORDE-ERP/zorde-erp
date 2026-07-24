import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
	AppAlertComponent,
	AppBrlCurrencyPipe,
	AppButtonDirective,
	AppCardImports,
	AppFieldComponent,
	AppInputDirective,
	AppSearchableSelectComponent,
	AppSpinnerComponent,
	AppToastService,
} from '@repo/angular-ui';
import { finalize } from 'rxjs';
import { ClienteSelectComponent } from '../../../shared/components/cliente-select/cliente-select.component';
import { ClienteFacade } from '../../clientes/cliente.facade';
import type { TabelaMontagemPorQrItem } from '../../clientes/models/cliente.model';
import { parseOsScanInput } from '../model/os-scan-parse';
import { OrdemServicoFacade } from '../ordem-servico.facade';

@Component({
	selector: 'app-os-scan',
	templateUrl: './os-scan.component.html',
	imports: [
		FormsModule,
		...AppCardImports,
		AppButtonDirective,
		AppFieldComponent,
		AppInputDirective,
		AppSpinnerComponent,
		AppAlertComponent,
		AppBrlCurrencyPipe,
		AppSearchableSelectComponent,
		ClienteSelectComponent,
	],
})
export class OsScanComponent implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly clienteFacade = inject(ClienteFacade);
	private readonly ordemFacade = inject(OrdemServicoFacade);
	private readonly toast = inject(AppToastService);

	public readonly wedgeInput = signal('');
	public readonly clienteId = signal<number | null>(null);
	public readonly token = signal<string | null>(null);
	public readonly codigoFolha = signal<string | undefined>(undefined);
	public readonly clienteNome = signal('');
	public readonly itens = signal<readonly TabelaMontagemPorQrItem[]>([]);
	public readonly loading = signal(false);
	public readonly saving = signal(false);
	public readonly errorMessage = signal<string | null>(null);
	public readonly selectedItemId = signal<number | null>(null);

	public readonly selectedItem = computed(() => {
		const id = this.selectedItemId();
		if (id === null) {
			return null;
		}
		return this.itens().find((item) => item.id === id) ?? null;
	});

	public readonly hasSession = computed(() => this.clienteId() !== null && !!this.token());

	public ngOnInit(): void {
		console.log(this.token(), 'token?', this.clienteId());
		const params = this.route.snapshot.queryParamMap;
		console.log(params, 'params');
		const c = Number(params.get('c'));
		const t = params.get('t')?.trim() ?? '';
		const codigoFolha = params.get('f')?.trim() || params.get('codigoFolha')?.trim() || undefined;

		if (Number.isFinite(c) && c > 0 && t) {
			this.startSession(c, t, codigoFolha);
			return;
		}

		// foco no input wedge fica no template via autofocus
	}

	public onWedgeSubmit(): void {
		const parsed = parseOsScanInput(this.wedgeInput());
		if (!parsed) {
			this.errorMessage.set('Código inválido. Bipe o QR ou cole a URL completa (/os/scan?c=...&t=...).');
			return;
		}

		this.wedgeInput.set('');
		void this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { c: parsed.clienteId, t: parsed.token, f: parsed.codigoFolha ?? null },
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
		this.startSession(parsed.clienteId, parsed.token, parsed.codigoFolha);
	}

	public onSelectItem(item: TabelaMontagemPorQrItem): void {
		this.selectedItemId.set(item.id);
	}

	public onSave(): void {
		const clienteId = this.clienteId();
		const token = this.token();
		const item = this.selectedItem();
		if (clienteId === null || !token || !item) {
			return;
		}

		this.saving.set(true);
		this.ordemFacade
			.create({
				clienteId,
				origem: 'QR_SCAN',
				codigoFolha: this.codigoFolha(),
				itens: [
					{
						tabelaMontagemId: item.id,
						quantidade: 1,
						valorUnitario: item.valor,
						origemValor: 'TABELA',
					},
				],
			})
			.pipe(finalize(() => this.saving.set(false)))
			.subscribe({
				next: () => {
					this.toast.show('OS lançada com sucesso!', 'success');
					this.resetToSelection();
				},
				error: () => this.toast.show('Não foi possível lançar a OS.', 'error'),
			});
	}

	public onTrocarCliente(): void {
		this.clienteId.set(null);
		this.token.set(null);
		this.codigoFolha.set(undefined);
		this.itens.set([]);
		this.selectedItemId.set(null);
		this.clienteNome.set('');
		this.errorMessage.set(null);
		void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
	}

	private resetToSelection(): void {
		this.selectedItemId.set(null);
	}

	private startSession(clienteId: number, token: string, codigoFolha?: string): void {
		this.clienteId.set(clienteId);
		this.token.set(token);
		this.codigoFolha.set(codigoFolha);
		this.selectedItemId.set(null);
		this.errorMessage.set(null);
		this.loading.set(true);

		this.clienteFacade
			.tabelaMontagemPorQr(clienteId, token)
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: (response) => {
					const body = response.body;
					this.itens.set(body?.itens ?? []);
					this.clienteFacade.getById(clienteId).subscribe({
						next: (clienteResponse) => {
							this.clienteNome.set(clienteResponse.body?.nome ?? `Cliente #${clienteId}`);
						},
						error: () => this.clienteNome.set(`Cliente #${clienteId}`),
					});
				},
				error: () => {
					this.errorMessage.set('Token inválido ou expirado. Bipe novamente ou use o campo manual.');
					this.itens.set([]);
				},
			});
	}
}
