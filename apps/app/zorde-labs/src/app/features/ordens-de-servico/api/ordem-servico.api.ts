import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientConfigService } from '../../../shared/providers/httpClient.service';
import {
	CreateOrdemServicoPayload,
	ListOrdensQuery,
	OrdemServico,
	OrdemServicoListResponse,
	UpdateOrdemServicoPayload,
} from '../models/ordem-servico.model';

@Service()
export class OrdemServicoApi {
	private readonly httpService = inject(HttpClientConfigService);

	public create(body: CreateOrdemServicoPayload): Observable<HttpResponse<OrdemServico>> {
		return this.httpService.post<OrdemServico>(`ordens-de-servico`, body);
	}

	public list(query: ListOrdensQuery): Observable<HttpResponse<OrdemServicoListResponse>> {
		return this.httpService.get<OrdemServicoListResponse>(`ordens-de-servico${this.buildQuery(query)}`);
	}

	public getById(id: number): Observable<HttpResponse<OrdemServico>> {
		return this.httpService.get<OrdemServico>(`ordens-de-servico/${id}`);
	}

	public update(body: UpdateOrdemServicoPayload): Observable<HttpResponse<OrdemServico>> {
		return this.httpService.put<OrdemServico>(`ordens-de-servico`, body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.httpService.delete<void>(`ordens-de-servico/${id}`);
	}

	private buildQuery(query: ListOrdensQuery): string {
		const params = new URLSearchParams();
		if (query.page != null) {
			params.set('page', String(query.page));
		}
		if (query.limit != null) {
			params.set('limit', String(query.limit));
		}
		if (query.status) {
			params.set('status', query.status);
		}
		if (query.clienteId != null) {
			params.set('clienteId', String(query.clienteId));
		}
		if (query.dataInicio) {
			params.set('dataInicio', query.dataInicio);
		}
		if (query.dataFim) {
			params.set('dataFim', query.dataFim);
		}
		const queryString = params.toString();
		return queryString ? `?${queryString}` : '';
	}
}
