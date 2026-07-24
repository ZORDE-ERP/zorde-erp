import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	AppBrlCurrencyMaskDirective,
	AppBrlCurrencyPipe,
	AppButtonDirective,
	AppCheckboxDirective,
	AppCnpjMaskDirective,
	AppCnpjPipe,
	AppCpfMaskDirective,
	AppCpfPipe,
	AppFieldComponent,
	AppInputDirective,
	AppPageLayoutComponent,
	AppPreviewBlockComponent,
	AppSelectDirective,
	AppTextareaDirective,
} from '@repo/angular-ui';

@Component({
	selector: 'ds-forms-page',
	imports: [
		FormsModule,
		AppPageLayoutComponent,
		AppPreviewBlockComponent,
		AppFieldComponent,
		AppInputDirective,
		AppTextareaDirective,
		AppSelectDirective,
		AppCheckboxDirective,
		AppButtonDirective,
		AppCpfMaskDirective,
		AppCnpjMaskDirective,
		AppBrlCurrencyMaskDirective,
		AppCpfPipe,
		AppCnpjPipe,
		AppBrlCurrencyPipe,
	],
	templateUrl: './forms.html',
})
export class FormsPage {
	protected readonly name = signal('');
	protected readonly email = signal('');
	protected readonly notes = signal('');
	protected readonly priority = signal('normal');
	protected readonly acceptTerms = signal(false);
	protected readonly submitted = signal(false);
	protected readonly cpf = signal('');
	protected readonly cnpj = signal('');
	protected readonly amount = signal<number | null>(null);

	protected get nameError(): string | undefined {
		return this.submitted() && this.name().trim().length < 3 ? 'Informe ao menos 3 caracteres.' : undefined;
	}

	protected get emailError(): string | undefined {
		return this.submitted() && !this.email().includes('@') ? 'E-mail inválido.' : undefined;
	}

	protected onSubmit(): void {
		this.submitted.set(true);
	}
}
