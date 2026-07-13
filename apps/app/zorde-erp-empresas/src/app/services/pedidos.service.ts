import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pedido {
  id: string;
  clienteId?: string;
  produtoId: string;
  currentStageId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
  pages: number;
}

export interface PedidosFilters {
  skip?: number;
  take?: number;
  stageId?: string;
  clienteId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private apiUrl = 'http://localhost:3001/api/v1/pedidos';

  constructor(private http: HttpClient) {}

  listar(filters?: PedidosFilters): Observable<PaginatedResponse<Pedido>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.skip !== undefined) params = params.set('skip', filters.skip.toString());
      if (filters.take !== undefined) params = params.set('take', filters.take.toString());
      if (filters.stageId) params = params.set('stageId', filters.stageId);
      if (filters.clienteId) params = params.set('clienteId', filters.clienteId);
      if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
      if (filters.toDate) params = params.set('toDate', filters.toDate);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<PaginatedResponse<Pedido>>(this.apiUrl, { params });
  }

  obter(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  criar(data: any): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, data);
  }

  atualizar(id: string, data: any): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}`, data);
  }

  atualizarStage(id: string, stageId: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/stage`, { stageId });
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obterHistorico(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`);
  }
}
