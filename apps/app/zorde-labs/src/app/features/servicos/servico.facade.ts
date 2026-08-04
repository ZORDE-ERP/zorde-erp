import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ServicoApi } from './api/servico.api';
import { CreateServicoPayload, Servico, ServicoListResponse, UpdateServicoPayload } from './models/service.model';

@Service()
export class ServicoFacade {
	private readonly servicoApi = inject(ServicoApi);

	public list(page: number, limit: number, search?: string): Observable<HttpResponse<ServicoListResponse>> {
		return this.servicoApi.list(page, limit, search);
	}

	public getById(id: number): Observable<HttpResponse<Servico>> {
		return this.servicoApi.getById(id);
	}

	public create(body: CreateServicoPayload): Observable<HttpResponse<Servico>> {
		return this.servicoApi.create(body);
	}

	public update(id: number, body: UpdateServicoPayload): Observable<HttpResponse<Servico>> {
		return this.servicoApi.update(id, body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.servicoApi.delete(id);
	}
}
