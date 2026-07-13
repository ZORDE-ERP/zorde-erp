import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Fornecedor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
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

export interface FornecedoresFilters {
  skip?: number;
  take?: number;
  nome?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FornecedoresService {
  private apiUrl = 'http://localhost:3001/api/v1/fornecedores';

  constructor(private http: HttpClient) {}

  listar(filters?: FornecedoresFilters): Observable<PaginatedResponse<Fornecedor>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.skip !== undefined) params = params.set('skip', filters.skip.toString());
      if (filters.take !== undefined) params = params.set('take', filters.take.toString());
      if (filters.nome) params = params.set('nome', filters.nome);
      if (filters.email) params = params.set('email', filters.email);
    }

    return this.http.get<PaginatedResponse<Fornecedor>>(this.apiUrl, { params });
  }

  obter(id: string): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.apiUrl}/${id}`);
  }

  criar(data: Partial<Fornecedor>): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.apiUrl, data);
  }

  atualizar(id: string, data: Partial<Fornecedor>): Observable<Fornecedor> {
    return this.http.patch<Fornecedor>(`${this.apiUrl}/${id}`, data);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
