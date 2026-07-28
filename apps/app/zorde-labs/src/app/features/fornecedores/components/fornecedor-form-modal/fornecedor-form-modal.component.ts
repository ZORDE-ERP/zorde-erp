import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppModalComponent, AppTabItem, AppTabsComponent, AppToastService } from '@repo/angular-ui';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { PessoaFormComponent } from '../../../../shared/components/pessoa-form/pessoa-form.component';
import { EMPTY_PESSOA_FORM_VALUE, PessoaFormValue } from '../../../../shared/components/pessoa-form/pessoa-form.model';
import { FornecedorFacade } from '../../fornecedor.facade';
import type { Fornecedor } from '../../models/fornecedor.model';

const TABS: readonly AppTabItem[] = [
	{ id: 'dados', label: 'Dados Pessoais' },
	{ id: 'endereco', label: 'Endereço' },
	{ id: 'imagem', label: 'Imagem' },
];

@Component({
	selector: 'app-fornecedor-form-modal',
	templateUrl: './fornecedor-form-modal.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule, AppModalComponent, AppTabsComponent, PessoaFormComponent, FileUploadComponent],
})
export class FornecedorFormModalComponent {
	private readonly fornecedorFacade = inject(FornecedorFacade);
	private readonly toast = inject(AppToastService);

	public readonly open = input(false);
	public readonly fornecedorId = input<number | null>(null);
	public readonly logoUrl = input<string | null>(null);
	public readonly title = input('Novo Fornecedor');
	public readonly saving = input(false);

	public readonly value = model<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);
	public readonly pendingLogoFile = model<File | null>(null);

	public readonly closed = output<void>();
	public readonly submitted = output<void>();
	public readonly logoChanged = output<Fornecedor>();

	protected readonly activeTab = signal<string>('dados');
	protected readonly tabs = signal<readonly AppTabItem[]>(TABS);
	protected readonly logoLoading = signal(false);
	protected readonly currentLogoUrl = signal<string | null>(null);

	protected readonly previewLogoUrl = computed(() => this.currentLogoUrl() ?? this.logoUrl());

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.activeTab.set('dados');
				this.pendingLogoFile.set(null);
				this.currentLogoUrl.set(this.logoUrl());
			}
		});
	}

	protected onClose(): void {
		this.closed.emit();
	}

	protected onSubmit(): void {
		this.submitted.emit();
	}

	protected onLogoSelected(file: File): void {
		const fornecedorId = this.fornecedorId();
		if (fornecedorId === null) {
			this.pendingLogoFile.set(file);
			return;
		}

		this.logoLoading.set(true);
		this.fornecedorFacade.uploadLogo(fornecedorId, file).subscribe({
			next: (response) => {
				this.logoLoading.set(false);
				const updated = response.body;
				if (updated) {
					this.currentLogoUrl.set(updated.logoUrl ?? null);
					this.logoChanged.emit(updated);
				}
				this.toast.show('Logo atualizado com sucesso.', 'success');
			},
			error: () => this.logoLoading.set(false),
		});
	}

	protected onLogoCleared(): void {
		const fornecedorId = this.fornecedorId();
		if (fornecedorId === null) {
			this.pendingLogoFile.set(null);
			this.currentLogoUrl.set(null);
			return;
		}

		this.logoLoading.set(true);
		this.fornecedorFacade.removerLogo(fornecedorId).subscribe({
			next: (response) => {
				this.logoLoading.set(false);
				this.currentLogoUrl.set(null);
				if (response.body) {
					this.logoChanged.emit(response.body);
				}
				this.toast.show('Logo removido.', 'success');
			},
			error: () => this.logoLoading.set(false),
		});
	}
}
