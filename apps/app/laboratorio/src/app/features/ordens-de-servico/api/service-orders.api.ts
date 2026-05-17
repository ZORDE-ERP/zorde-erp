import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TabelaMontagemListResponse } from '@zorde/shared-types';
import {
  ServiceOrder,
  ServiceOrderClientOption,
  ServiceOrderTabelaMontagemOption,
  ServiceOrderUpsert,
} from '../models/service-orders.model';
import { ApiContextService } from '../../../core/api/api-context.service';

interface ApiServiceOrderResponse {
  id: number;
  codigoOS: string;
  clienteId: number;
  cliente: {
    id: number;
    nome: string;
  };
  valor: number | null;
  tabelaMontagemId: number | null;
  tabelaMontagem: {
    id: number | null;
    servico: string;
  } | null;
  createdAt: string;
}

interface ApiClientResponse {
  id: number;
  nome: string;
}

interface ApiServiceOrderPayload {
  codigoOS: string;
  clienteId: number;
  valor: number;
  tabelaMontagemId: number | null;
  usuarioId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceOrdersApi {
  private readonly http = inject(HttpClient);
  private readonly apiContext = inject(ApiContextService);

  getAll(): Observable<ServiceOrder[]> {
    return this.http
      .get<ApiServiceOrderResponse[]>(`${this.apiContext.apiBase}/ordens-de-servico`)
      .pipe(map(orders => orders.map(order => this.mapApiOrderToModel(order))));
  }

  create(order: ServiceOrderUpsert): Observable<ServiceOrder> {
    return this.apiContext.getCurrentUserId().pipe(
      switchMap(userId =>
        this.http
          .post<ApiServiceOrderResponse>(
            `${this.apiContext.apiBase}/ordens-de-servico`,
            this.mapModelToPayload(order, userId),
          )
          .pipe(map(createdOrder => this.mapApiOrderToModel(createdOrder))),
      ),
    );
  }

  update(id: string, order: ServiceOrderUpsert): Observable<ServiceOrder> {
    return this.apiContext.getCurrentUserId().pipe(
      switchMap(userId =>
        this.http
          .put<ApiServiceOrderResponse>(
            `${this.apiContext.apiBase}/ordens-de-servico/${Number(id)}`,
            this.mapModelToPayload(order, userId),
          )
          .pipe(map(updatedOrder => this.mapApiOrderToModel(updatedOrder))),
      ),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiContext.apiBase}/ordens-de-servico/${Number(id)}`);
  }

  getClientes(): Observable<ServiceOrderClientOption[]> {
    return this.http
      .get<ApiClientResponse[]>(`${this.apiContext.apiBase}/clientes`)
      .pipe(map(clients => clients.map(client => ({ id: String(client.id), name: client.nome }))));
  }

  getTabelaMontagem(): Observable<ServiceOrderTabelaMontagemOption[]> {
    const params = new HttpParams().set('page', '1').set('limit', '1000').set('search', '');

    return this.http
      .get<TabelaMontagemListResponse>(`${this.apiContext.apiBase}/tabela-montagem`, { params })
      .pipe(
        map(response =>
          response.items.map(item => ({
            id: String(item.id),
            clientId: String(item.clienteId),
            clientName: item.nomeCliente,
            serviceType: item.servico,
            label: item.servico,
            value: item.valor,
          })),
        ),
      );
  }

  private mapApiOrderToModel(order: ApiServiceOrderResponse): ServiceOrder {
    return {
      id: String(order.id),
      code: order.codigoOS,
      clientId: String(order.clienteId),
      clientName: order.cliente.nome,
      serviceType: (order.tabelaMontagem?.servico ?? null) as ServiceOrder['serviceType'],
      tabelaMontagemId: order.tabelaMontagemId != null ? String(order.tabelaMontagemId) : null,
      tabelaMontagemLabel: order.tabelaMontagem?.servico ?? null,
      assemblyValue: Number(order.valor ?? 0),
      createdAt: new Date(order.createdAt).toLocaleDateString('pt-BR'),
    };
  }

  private mapModelToPayload(order: ServiceOrderUpsert, userId: number): ApiServiceOrderPayload {
    return {
      codigoOS: order.code,
      clienteId: Number(order.clientId),
      valor: Number(order.assemblyValue),
      tabelaMontagemId: order.tabelaMontagemId ? Number(order.tabelaMontagemId) : null,
      usuarioId: userId,
    };
  }
}
