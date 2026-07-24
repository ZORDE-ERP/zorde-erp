import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import {
	AppButtonDirective,
	AppFieldComponent,
	AppInputDirective,
	AppModalComponent,
	AppTextareaDirective,
} from '@repo/angular-ui';
import { ServicoFormModel } from '../../model/servico';

@Component({
	selector: 'app-servico-form-modal',
	templateUrl: './servico-form-modal.component.html',
	imports: [
		FormsModule,
		FormField,
		AppModalComponent,
		AppFieldComponent,
		AppInputDirective,
		AppTextareaDirective,
		AppButtonDirective,
	],
})
export class ServicoFormModalComponent {
	public readonly open = input(false);
	public readonly editing = input(false);
	public readonly saving = input(false);
	public readonly servicoForm = input.required<FieldTree<ServicoFormModel>>();

	public readonly closed = output<void>();
	public readonly submitted = output<void>();

	protected onSubmit(): void {
		this.submitted.emit();
	}

	protected onClose(): void {
		this.closed.emit();
	}
}
