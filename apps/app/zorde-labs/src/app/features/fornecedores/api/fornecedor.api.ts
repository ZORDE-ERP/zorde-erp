import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientConfigService } from '../../../shared/providers/httpClient.service';
import { CreateFornecedorPayload, Fornecedor, UpdateFornecedorPayload } from '../models/fornecedor.model';

@Service()
export class FornecedorApi {
	private readonly httpService = inject(HttpClientConfigService);

	public create(body: CreateFornecedorPayload): Observable<HttpResponse<Fornecedor>> {
		return this.httpService.post<Fornecedor>(`fornecedores`, body);
	}

	public list(): Observable<HttpResponse<Fornecedor[]>> {
		return this.httpService.get<Fornecedor[]>(`fornecedores`);
	}

	public getById(id: number): Observable<HttpResponse<Fornecedor>> {
		return this.httpService.get<Fornecedor>(`fornecedores/${id}`);
	}

	public update(body: UpdateFornecedorPayload): Observable<HttpResponse<Fornecedor>> {
		return this.httpService.put<Fornecedor>(`fornecedores`, body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.httpService.delete<void>(`fornecedores/${id}`);
	}
}
