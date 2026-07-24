import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientConfigService } from '../../../../../shared/providers/httpClient.service';
import { LoginModel, LoginResponse } from '../model/login.model';

@Service()
export class LoginApi {
	private readonly httpService = inject(HttpClientConfigService);

	public login(data: LoginModel): Observable<HttpResponse<LoginResponse>> {
		return this.httpService.post<LoginResponse>('auth/login', data);
	}
}
