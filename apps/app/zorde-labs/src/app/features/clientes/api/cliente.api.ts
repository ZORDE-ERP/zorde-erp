import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientConfigService } from '../../../shared/providers/httpClient.service';
import {
	Cliente,
	ClienteQrCodeResponse,
	CreateClientePayload,
	TabelaMontagemPorQrResponse,
	UpdateClientePayload,
} from '../models/cliente.model';

@Service()
export class ClienteApi {
	private readonly httpService = inject(HttpClientConfigService);

	public create(body: CreateClientePayload): Observable<HttpResponse<Cliente>> {
		return this.httpService.post<Cliente>(`clientes`, body);
	}

	public list(): Observable<HttpResponse<Cliente[]>> {
		return this.httpService.get<Cliente[]>(`clientes`);
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
}
