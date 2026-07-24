import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteApi } from './api/cliente.api';
import {
	Cliente,
	ClienteQrCodeResponse,
	CreateClientePayload,
	TabelaMontagemPorQrResponse,
	UpdateClientePayload,
} from './models/cliente.model';

@Service()
export class ClienteFacade {
	private readonly clienteApi = inject(ClienteApi);

	public create(body: CreateClientePayload): Observable<HttpResponse<Cliente>> {
		return this.clienteApi.create(body);
	}

	public list(): Observable<HttpResponse<Cliente[]>> {
		return this.clienteApi.list();
	}

	public getById(id: number): Observable<HttpResponse<Cliente>> {
		return this.clienteApi.getById(id);
	}

	public update(body: UpdateClientePayload): Observable<HttpResponse<Cliente>> {
		return this.clienteApi.update(body);
	}

	public delete(id: number): Observable<HttpResponse<void>> {
		return this.clienteApi.delete(id);
	}

	public gerarQrCode(id: number): Observable<HttpResponse<ClienteQrCodeResponse>> {
		return this.clienteApi.gerarQrCode(id);
	}

	public imprimirFolhasOs(id: number, quantidade: number): Observable<HttpResponse<Blob>> {
		return this.clienteApi.imprimirFolhasOs(id, quantidade);
	}

	public tabelaMontagemPorQr(clienteId: number, token: string): Observable<HttpResponse<TabelaMontagemPorQrResponse>> {
		return this.clienteApi.tabelaMontagemPorQr(clienteId, token);
	}
}
