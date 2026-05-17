import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TabelaMontagem,
  TabelaMontagemListResponse,
  CreateTabelaMontagemDto,
  UpdateTabelaMontagemDto,
} from '@zorde/shared-types';

export interface ClienteOption {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class TabelaMontagemService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8080/api';

  getAll(page: number, limit: number, search: string): Observable<TabelaMontagemListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search);
    return this.http.get<TabelaMontagemListResponse>(`${this.apiBase}/tabela-montagem`, { params });
  }

  create(dto: CreateTabelaMontagemDto): Observable<TabelaMontagem> {
    return this.http.post<TabelaMontagem>(`${this.apiBase}/tabela-montagem`, dto);
  }

  update(id: number, dto: UpdateTabelaMontagemDto): Observable<TabelaMontagem> {
    return this.http.put<TabelaMontagem>(`${this.apiBase}/tabela-montagem/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/tabela-montagem/${id}`);
  }

  getClientes(): Observable<ClienteOption[]> {
    return this.http.get<ClienteOption[]>(`${this.apiBase}/clientes`);
  }
}
