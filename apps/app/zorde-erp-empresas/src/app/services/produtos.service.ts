import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Produto {
  id: string;
  descricao: string;
  preco: string;
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

export interface ProdutosFilters {
  skip?: number;
  take?: number;
  descricao?: string;
  preco?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProdutosService {
  private apiUrl = 'http://localhost:3001/api/v1/produtos';

  constructor(private http: HttpClient) {}

  listar(filters?: ProdutosFilters): Observable<PaginatedResponse<Produto>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.skip !== undefined) params = params.set('skip', filters.skip.toString());
      if (filters.take !== undefined) params = params.set('take', filters.take.toString());
      if (filters.descricao) params = params.set('descricao', filters.descricao);
      if (filters.preco !== undefined) params = params.set('preco', filters.preco.toString());
    }

    return this.http.get<PaginatedResponse<Produto>>(this.apiUrl, { params });
  }

  obter(id: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  criar(data: Partial<Produto>): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, data);
  }

  atualizar(id: string, data: Partial<Produto>): Observable<Produto> {
    return this.http.patch<Produto>(`${this.apiUrl}/${id}`, data);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
