import { ChangeDetectionStrategy, Component, effect, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppButtonDirective, AppModalComponent, AppTabItem, AppTabsComponent } from '@repo/angular-ui';
import { PessoaFormComponent } from '../../../../shared/components/pessoa-form/pessoa-form.component';
import { EMPTY_PESSOA_FORM_VALUE, PessoaFormValue } from '../../../../shared/components/pessoa-form/pessoa-form.model';

const DADOS_ENDERECO_TABS: readonly AppTabItem[] = [
	{ id: 'dados', label: 'Dados Pessoais' },
	{ id: 'endereco', label: 'Endereço' },
];

@Component({
	selector: 'app-fornecedor-form-modal',
	templateUrl: './fornecedor-form-modal.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule, AppModalComponent, AppTabsComponent, AppButtonDirective, PessoaFormComponent],
})
export class FornecedorFormModalComponent {
	public readonly open = input(false);
	public readonly fornecedorId = input<number | null>(null);
	public readonly title = input('Novo Fornecedor');
	public readonly saving = input(false);

	public readonly value = model<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);

	public readonly closed = output<void>();
	public readonly submitted = output<void>();

	protected readonly activeTab = signal<string>('dados');
	protected readonly tabs = signal<readonly AppTabItem[]>(DADOS_ENDERECO_TABS);

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.activeTab.set('dados');
			}
		});
	}

	protected onClose(): void {
		this.closed.emit();
	}

	protected onSubmit(): void {
		this.submitted.emit();
	}
}
