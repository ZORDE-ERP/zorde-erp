import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientConfigService } from '../../../shared/providers/httpClient.service';
import {
	CreateFornecedorPayload,
	Fornecedor,
	FornecedorListResponse,
	ListFornecedoresQuery,
	UpdateFornecedorPayload,
} from '../models/fornecedor.model';

@Service()
export class FornecedorApi {
	private readonly httpService = inject(HttpClientConfigService);

	public create(body: CreateFornecedorPayload): Observable<HttpResponse<Fornecedor>> {
		return this.httpService.post<Fornecedor>(`fornecedores`, body);
	}

	public list(query: ListFornecedoresQuery = {}): Observable<HttpResponse<FornecedorListResponse>> {
		return this.httpService.get<FornecedorListResponse>(`fornecedores${this.buildQuery(query)}`);
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

	public uploadLogo(id: number, file: File): Observable<HttpResponse<Fornecedor>> {
		const formData = new FormData();
		formData.append('file', file);
		return this.httpService.postFormData<Fornecedor>(`fornecedores/${id}/logo`, formData);
	}

	public removerLogo(id: number): Observable<HttpResponse<Fornecedor>> {
		return this.httpService.delete<Fornecedor>(`fornecedores/${id}/logo`);
	}

	private buildQuery(query: ListFornecedoresQuery): string {
		const params = new URLSearchParams();
		if (query.page != null) {
			params.set('page', String(query.page));
		}
		if (query.limit != null) {
			params.set('limit', String(query.limit));
		}
		if (query.search) {
			params.set('search', query.search);
		}
		if (query.status) {
			params.set('status', query.status);
		}
		const queryString = params.toString();
		return queryString ? `?${queryString}` : '';
	}
}
