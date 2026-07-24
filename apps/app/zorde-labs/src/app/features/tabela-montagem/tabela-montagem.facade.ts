import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { TabelaMontagemApi } from './api/tabela-montagem.api';
import {
	CreateTabelaMontagemPayload,
	TabelaMontagem,
	TabelaMontagemListResponse,
	UpdateTabelaMontagemPayload,
} from './models/tabela-montagem.model';

@Service()
export class TabelaMontagemFacade {
	private readonly tabelaMontagemApi = inject(TabelaMontagemApi);

	public list(page: number, limit: number, search?: string): Observable<HttpResponse<TabelaMontagemListResponse>> {
		return this.tabelaMontagemApi.list(page, limit, search);
	}

	public getById(id: number): Observable<HttpResponse<TabelaMontagem>> {
		return this.tabelaMontagemApi.getById(id);
	}

	public create(body: CreateTabelaMontagemPayload): Observable<HttpResponse<TabelaMontagem>> {
		return this.tabelaMontagemApi.create(body);
	}

	public update(id: number, body: UpdateTabelaMontagemPayload): Observable<HttpResponse<TabelaMontagem>> {
		return this.tabelaMontagemApi.update(id, body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.tabelaMontagemApi.delete(id);
	}
}
