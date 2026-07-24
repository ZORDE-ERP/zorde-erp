import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientConfigService } from '../../../shared/providers/httpClient.service';
import {
	CreateTabelaMontagemPayload,
	TabelaMontagem,
	TabelaMontagemListResponse,
	UpdateTabelaMontagemPayload,
} from '../models/tabela-montagem.model';

@Service()
export class TabelaMontagemApi {
	private readonly httpService = inject(HttpClientConfigService);

	public list(page: number, limit: number, search?: string): Observable<HttpResponse<TabelaMontagemListResponse>> {
		const params = new URLSearchParams({ page: String(page), limit: String(limit) });
		if (search) {
			params.set('search', search);
		}
		return this.httpService.get<TabelaMontagemListResponse>(`tabela-montagem?${params.toString()}`);
	}

	public getById(id: number): Observable<HttpResponse<TabelaMontagem>> {
		return this.httpService.get<TabelaMontagem>(`tabela-montagem/${id}`);
	}

	public create(body: CreateTabelaMontagemPayload): Observable<HttpResponse<TabelaMontagem>> {
		return this.httpService.post<TabelaMontagem>(`tabela-montagem`, body);
	}

	public update(id: number, body: UpdateTabelaMontagemPayload): Observable<HttpResponse<TabelaMontagem>> {
		return this.httpService.put<TabelaMontagem>(`tabela-montagem/${id}`, body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.httpService.delete<void>(`tabela-montagem/${id}`);
	}
}
