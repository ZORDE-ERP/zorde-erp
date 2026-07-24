import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { email, FormField, form, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import {
	AppAuthLayoutComponent,
	AppButtonDirective,
	AppCardImports,
	AppCheckboxDirective,
	AppFieldComponent,
	AppInputDirective,
	AppLinkDirective,
	AppSpinnerComponent,
} from '@repo/angular-ui';
import { LoginFacade } from './login.facade';
import { LoginModel } from './model/login.model';

@Component({
	selector: 'app-login',
	templateUrl: './login.html',
	imports: [
		FormsModule,
		RouterLink,
		AppAuthLayoutComponent,
		...AppCardImports,
		AppFieldComponent,
		AppInputDirective,
		AppCheckboxDirective,
		AppButtonDirective,
		AppLinkDirective,
		FormField,
		AppSpinnerComponent,
	],
})
export class LoginComponent {
	public readonly loginFacade = inject(LoginFacade);
	public loginModel = signal<LoginModel>({ email: '', senha: '', remember: false });
	public loginForm = form(this.loginModel, (name) => {
		required(name.email, { message: 'E-mail é obrigatório' });
		email(name.email, { message: 'E-mail inválido' });
		required(name.senha, { message: 'Senha é obrigatória' });
	});

	public salvar(): void {
		this.loginForm().markAsTouched();
		if (this.loginForm().valid()) {
			this.loginFacade.login(this.loginForm().value());
		}
	}
}
