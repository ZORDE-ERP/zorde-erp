import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import {
	AppAlertComponent,
	AppBrlCurrencyPipe,
	AppButtonDirective,
	AppCardImports,
	AppFieldComponent,
	AppInputDirective,
	AppSelectDirective,
	AppSpinnerComponent,
	AppToastService,
} from '@repo/angular-ui';
import { finalize, switchMap } from 'rxjs';
import { ClienteFacade } from '../../clientes/cliente.facade';
import type { TabelaMontagemPorQrItem } from '../../clientes/models/cliente.model';
import { parseOsScanInput } from '../model/os-scan-parse';
import { OrdemServicoFacade } from '../ordem-servico.facade';

export interface OsScanFormModel {
	wedgeInput: string;
	selectedItemId: string;
}

@Component({
	selector: 'app-os-scan',
	templateUrl: './os-scan.component.html',
	imports: [
		FormsModule,
		FormField,
		...AppCardImports,
		AppButtonDirective,
		AppFieldComponent,
		AppInputDirective,
		AppSelectDirective,
		AppSpinnerComponent,
		AppAlertComponent,
		AppBrlCurrencyPipe,
	],
})
export class OsScanComponent implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly clienteFacade = inject(ClienteFacade);
	private readonly ordemFacade = inject(OrdemServicoFacade);
	private readonly toast = inject(AppToastService);

	public readonly scanInputEl = viewChild<ElementRef<HTMLInputElement>>('scanInput');

	public readonly scanModel = signal<OsScanFormModel>({
		wedgeInput: '',
		selectedItemId: '',
	});

	public readonly scanForm = form(this.scanModel);

	public readonly clienteId = signal<number | null>(null);
	public readonly token = signal<string | null>(null);
	public readonly codigoFolha = signal<string | null>(null);
	public readonly clienteNome = signal('');
	public readonly itens = signal<readonly TabelaMontagemPorQrItem[]>([]);
	public readonly loading = signal(false);
	public readonly saving = signal(false);
	public readonly errorMessage = signal<string | null>(null);

	public readonly selectedItem = computed(() => {
		const id = this.scanModel().selectedItemId;
		if (!id) {
			return null;
		}
		const numericId = Number(id);
		if (Number.isNaN(numericId)) {
			return null;
		}
		return this.itens().find((item) => item.id === numericId) ?? null;
	});

	public readonly hasSession = computed(() => this.clienteId() !== null && !!this.token() && !!this.codigoFolha());

	public readonly canSave = computed(() => this.hasSession() && this.selectedItem() !== null && !this.errorMessage());

	public ngOnInit(): void {
		const params = this.route.snapshot.queryParamMap;
		const c = Number(params.get('c'));
		const t = params.get('t')?.trim() ?? '';
		const codigoFolha = params.get('f')?.trim() || params.get('codigoFolha')?.trim() || '';

		if (Number.isFinite(c) && c > 0 && t && codigoFolha) {
			this.startSession(c, t, codigoFolha);
			return;
		}

		// TODO: remover mock — preview da tela com dados após scan do QR
		this.applyMockSession();
	}

	/** Preview local: estado pós-scan com cliente e serviços da tabela de montagem. */
	private applyMockSession(): void {
		this.clienteId.set(42);
		this.token.set('mock-token-preview');
		this.codigoFolha.set('OS-42-000137');
		this.clienteNome.set('Ótica Visão Clara Ltda');
		this.itens.set([
			{ id: 101, servicoId: 1, nomeServico: 'Montagem lente monofocal', valor: 45 },
			{ id: 102, servicoId: 2, nomeServico: 'Montagem lente multifocal', valor: 85 },
			{ id: 103, servicoId: 3, nomeServico: 'Surfaçagem digital', valor: 120 },
			{ id: 104, servicoId: 4, nomeServico: 'Tratamento antirreflexo', valor: 65.5 },
			{ id: 105, servicoId: 5, nomeServico: 'Ajuste de armação', valor: 25 },
		]);
		this.loading.set(false);
		this.errorMessage.set(null);
	}

	public onWedgeSubmit(): void {
		const rawInput = this.scanModel().wedgeInput ?? '';
		const parsed = parseOsScanInput(rawInput);
		if (!parsed) {
			this.errorMessage.set('Código inválido. Bipe o QR da folha impressa (URL com c, t e f) ou cole a URL completa.');
			return;
		}

		this.scanModel.update((m) => ({ ...m, wedgeInput: '' }));
		void this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { c: parsed.clienteId, t: parsed.token, f: parsed.codigoFolha },
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
		this.startSession(parsed.clienteId, parsed.token, parsed.codigoFolha);
	}

	public onSave(): void {
		const clienteId = this.clienteId();
		const codigoFolha = this.codigoFolha();
		const item = this.selectedItem();
		if (clienteId === null || !codigoFolha || !item) {
			return;
		}

		this.saving.set(true);
		this.ordemFacade
			.create({
				clienteId,
				origem: 'QR_SCAN',
				codigoFolha,
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
					this.onTrocarCliente();
				},
			});
	}

	public onTrocarCliente(): void {
		this.resetSession();
		void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
		setTimeout(() => {
			this.scanInputEl()?.nativeElement.focus();
		}, 0);
	}

	private resetSession(): void {
		this.clienteId.set(null);
		this.token.set(null);
		this.codigoFolha.set(null);
		this.itens.set([]);
		this.scanModel.set({ wedgeInput: '', selectedItemId: '' });
		this.clienteNome.set('');
		this.errorMessage.set(null);
	}

	private startSession(clienteId: number, token: string, codigoFolha: string): void {
		this.clienteId.set(clienteId);
		this.token.set(token);
		this.codigoFolha.set(codigoFolha);
		this.scanModel.update((m) => ({ ...m, selectedItemId: '' }));
		this.errorMessage.set(null);
		this.loading.set(true);

		this.clienteFacade
			.statusFolhaOs(codigoFolha, clienteId)
			.pipe(
				switchMap(() => this.clienteFacade.tabelaMontagemPorQr(clienteId, token)),
				finalize(() => this.loading.set(false)),
			)
			.subscribe({
				next: (response: { body?: { itens?: TabelaMontagemPorQrItem[] } | null }) => {
					const body = response.body;
					this.itens.set(body?.itens ?? []);
					this.clienteFacade.getById(clienteId).subscribe({
						next: (clienteResponse: { body?: { nome?: string } | null }) => {
							this.clienteNome.set(clienteResponse.body?.nome ?? `Cliente #${clienteId}`);
						},
						error: () => this.clienteNome.set(`Cliente #${clienteId}`),
					});
				},
				error: (error: HttpErrorResponse) => {
					if (error.status === 409) {
						this.errorMessage.set('Esta OS impressa já foi lançada');
						this.itens.set([]);
						return;
					}
					if (error.status === 404) {
						this.errorMessage.set('Cliente inválido');
						this.itens.set([]);
						return;
					}
					if (error.status === 403) {
						this.errorMessage.set('Token inválido ou expirado. Bipe novamente ou use o campo manual.');
						this.itens.set([]);
						return;
					}
					this.errorMessage.set('Não foi possível validar a folha impressa. Tente novamente.');
					this.itens.set([]);
				},
			});
	}
}
