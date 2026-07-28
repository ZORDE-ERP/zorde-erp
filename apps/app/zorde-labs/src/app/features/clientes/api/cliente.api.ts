import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientConfigService } from '../../../shared/providers/httpClient.service';
import {
	Cliente,
	ClienteListResponse,
	ClienteQrCodeResponse,
	CreateClientePayload,
	FolhaOsStatusResponse,
	ListClientesQuery,
	TabelaMontagemPorQrResponse,
	UpdateClientePayload,
} from '../models/cliente.model';

@Service()
export class ClienteApi {
	private readonly httpService = inject(HttpClientConfigService);

	public create(body: CreateClientePayload): Observable<HttpResponse<Cliente>> {
		return this.httpService.post<Cliente>(`clientes`, body);
	}

	public list(query: ListClientesQuery = {}): Observable<HttpResponse<ClienteListResponse>> {
		return this.httpService.get<ClienteListResponse>(`clientes${this.buildQuery(query)}`);
	}

	public getById(id: number): Observable<HttpResponse<Cliente>> {
		return this.httpService.get<Cliente>(`clientes/${id}`);
	}

	public update(body: UpdateClientePayload): Observable<HttpResponse<Cliente>> {
		return this.httpService.put<Cliente>(`clientes`, body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.httpService.delete<void>(`clientes/${id}`);
	}

	public gerarQrCode(id: number): Observable<HttpResponse<ClienteQrCodeResponse>> {
		return this.httpService.post<ClienteQrCodeResponse>(`clientes/${id}/qrcode`, {});
	}

	public imprimirFolhasOs(id: number, quantidade: number): Observable<HttpResponse<Blob>> {
		return this.httpService.postBlob(`clientes/${id}/impressao-os`, { quantidade });
	}

	public tabelaMontagemPorQr(clienteId: number, token: string): Observable<HttpResponse<TabelaMontagemPorQrResponse>> {
		const params = new URLSearchParams({ token });
		return this.httpService.get<TabelaMontagemPorQrResponse>(`clientes/${clienteId}/tabela-montagem?${params.toString()}`);
	}

	public statusFolhaOs(codigoFolha: string, clienteId: number): Observable<HttpResponse<FolhaOsStatusResponse>> {
		const params = new URLSearchParams({ codigoFolha, clienteId: String(clienteId) });
		return this.httpService.get<FolhaOsStatusResponse>(`folhas-os/por-codigo?${params.toString()}`);
	}

	public uploadLogo(id: number, file: File): Observable<HttpResponse<Cliente>> {
		const formData = new FormData();
		formData.append('file', file);
		return this.httpService.postFormData<Cliente>(`clientes/${id}/logo`, formData);
	}

	public removerLogo(id: number): Observable<HttpResponse<Cliente>> {
		return this.httpService.delete<Cliente>(`clientes/${id}/logo`);
	}

	private buildQuery(query: ListClientesQuery): string {
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
		if (query.id != null) {
			params.set('id', String(query.id));
		}
		const queryString = params.toString();
		return queryString ? `?${queryString}` : '';
	}
}
