import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdemServicoApi } from './api/ordem-servico.api';
import {
	CreateOrdemServicoPayload,
	ListOrdensQuery,
	OrdemServico,
	OrdemServicoListResponse,
	UpdateOrdemServicoPayload,
} from './models/ordem-servico.model';

@Service()
export class OrdemServicoFacade {
	private readonly ordemServicoApi = inject(OrdemServicoApi);

	public create(body: CreateOrdemServicoPayload): Observable<HttpResponse<OrdemServico>> {
		return this.ordemServicoApi.create(body);
	}

	public list(query: ListOrdensQuery): Observable<HttpResponse<OrdemServicoListResponse>> {
		return this.ordemServicoApi.list(query);
	}

	public getById(id: number): Observable<HttpResponse<OrdemServico>> {
		return this.ordemServicoApi.getById(id);
	}

	public update(body: UpdateOrdemServicoPayload): Observable<HttpResponse<OrdemServico>> {
		return this.ordemServicoApi.update(body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.ordemServicoApi.delete(id);
	}
}
