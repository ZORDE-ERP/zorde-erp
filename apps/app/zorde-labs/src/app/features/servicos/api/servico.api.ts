import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientConfigService } from '../../../shared/providers/httpClient.service';
import { CreateServicoPayload, Servico, ServicoListResponse, UpdateServicoPayload } from '../models/service.model';

@Service()
export class ServicoApi {
	private readonly httpService = inject(HttpClientConfigService);

	public list(page: number, limit: number, search?: string): Observable<HttpResponse<ServicoListResponse>> {
		const params = new URLSearchParams({ page: String(page), limit: String(limit) });
		if (search) {
			params.set('search', search);
		}
		return this.httpService.get<ServicoListResponse>(`servico?${params.toString()}`);
	}

	public getById(id: number): Observable<HttpResponse<Servico>> {
		return this.httpService.get<Servico>(`servico/${id}`);
	}

	public create(body: CreateServicoPayload): Observable<HttpResponse<Servico>> {
		return this.httpService.post<Servico>(`servico`, body);
	}

	public update(id: number, body: UpdateServicoPayload): Observable<HttpResponse<Servico>> {
		return this.httpService.put<Servico>(`servico/${id}`, body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.httpService.delete<void>(`servico/${id}`);
	}
}
