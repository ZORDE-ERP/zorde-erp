import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppToastService } from '@repo/angular-ui';
import { finalize } from 'rxjs';
import { UserAuthService } from '../../../../shared/providers/UserAuth.service';
import { LoginApi } from './api/login.api';
import { LoginModel, LoginResponse } from './model/login.model';

@Service()
export class LoginFacade {
	private readonly loginApi = inject(LoginApi);
	private readonly toast = inject(AppToastService);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);
	private readonly userAuthService = inject(UserAuthService);
	public authError = signal<string | null>(null);

	public readonly loading = signal(false);

	public login(data: LoginModel): void {
		this.loading.set(true);
		this.loginApi
			.login(data)
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: (response: HttpResponse<LoginResponse>) => {
					const body = response.body;
					if (!body) {
						return;
					}
					const { usuario, accessToken } = body;
					this.userAuthService.login(usuario, accessToken);
					this.toast.show('Login realizado com sucesso!', 'success');
					const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
					void this.router.navigateByUrl(returnUrl?.startsWith('/') ? returnUrl : '/home');
				},
				error: (error: HttpErrorResponse) => {
					this.authError.set(error.error.message);
				},
			});
	}
}
