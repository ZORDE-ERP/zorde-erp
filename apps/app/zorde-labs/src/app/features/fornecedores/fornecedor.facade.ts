import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { FornecedorApi } from './api/fornecedor.api';
import {
	CreateFornecedorPayload,
	Fornecedor,
	FornecedorListResponse,
	ListFornecedoresQuery,
	UpdateFornecedorPayload,
} from './models/fornecedor.model';

@Service()
export class FornecedorFacade {
	private readonly fornecedorApi = inject(FornecedorApi);

	public create(body: CreateFornecedorPayload): Observable<HttpResponse<Fornecedor>> {
		return this.fornecedorApi.create(body);
	}

	public list(query: ListFornecedoresQuery = {}): Observable<HttpResponse<FornecedorListResponse>> {
		return this.fornecedorApi.list(query);
	}

	public getById(id: number): Observable<HttpResponse<Fornecedor>> {
		return this.fornecedorApi.getById(id);
	}

	public update(body: UpdateFornecedorPayload): Observable<HttpResponse<Fornecedor>> {
		return this.fornecedorApi.update(body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.fornecedorApi.delete(id);
	}

	public uploadLogo(id: number, file: File): Observable<HttpResponse<Fornecedor>> {
		return this.fornecedorApi.uploadLogo(id, file);
	}

	public removerLogo(id: number): Observable<HttpResponse<Fornecedor>> {
		return this.fornecedorApi.removerLogo(id);
	}
}
