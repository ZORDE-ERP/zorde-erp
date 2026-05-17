import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Supplier } from '../models/supplier.model';
import { ApiContextService } from '../../../core/api/api-context.service';

interface ApiSupplierResponse {
  id: number;
  nome: string;
  email: string;
  contato: string | null;
  tipoPessoa: 'FISICA' | 'JURIDICA';
  documento: string;
  status: 'ATIVO' | 'INATIVO';
  cep: string | null;
  uf: string | null;
  cidade: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  observacao: string | null;
}

interface ApiSupplierPayload {
  nome: string;
  email: string;
  contato: string | null;
  tipoPessoa: 'FISICA' | 'JURIDICA';
  documento: string;
  status: 'ATIVO' | 'INATIVO';
  cep: string | null;
  uf: string | null;
  cidade: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  observacao: string | null;
  usuarioId: number;
}

@Injectable({
  providedIn: 'root'
})
export class SuppliersApi {
  private readonly http = inject(HttpClient);
  private readonly apiContext = inject(ApiContextService);

  getAll(): Observable<Supplier[]> {
    return this.http
      .get<ApiSupplierResponse[]>(`${this.apiContext.apiBase}/fornecedores`)
      .pipe(map(suppliers => suppliers.map(supplier => this.mapApiSupplierToModel(supplier))));
  }

  create(supplier: Omit<Supplier, 'id'>): Observable<Supplier> {
    return this.apiContext.getCurrentUserId().pipe(
      switchMap(userId =>
        this.http
          .post<ApiSupplierResponse>(`${this.apiContext.apiBase}/fornecedores`, this.mapModelToPayload(supplier, userId))
          .pipe(map(createdSupplier => this.mapApiSupplierToModel(createdSupplier))),
      ),
    );
  }

  update(id: string, updates: Partial<Supplier>): Observable<Supplier> {
    const supplierId = Number(id);

    return this.getById(id).pipe(
      switchMap(currentSupplier =>
        this.apiContext.getCurrentUserId().pipe(
          switchMap(userId =>
            this.http
              .put<ApiSupplierResponse>(
                `${this.apiContext.apiBase}/fornecedores/${supplierId}`,
                this.mapModelToPayload({ ...currentSupplier, ...updates, id }, userId),
              )
              .pipe(map(updatedSupplier => this.mapApiSupplierToModel(updatedSupplier))),
          ),
        ),
      ),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiContext.apiBase}/fornecedores/${Number(id)}`);
  }

  toggleStatus(id: string): Observable<Supplier> {
    return this.getById(id).pipe(
      switchMap(supplier =>
        this.update(id, {
          status: supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        }),
      ),
    );
  }

  getById(id: string): Observable<Supplier> {
    return this.http
      .get<ApiSupplierResponse>(`${this.apiContext.apiBase}/fornecedores/${Number(id)}`)
      .pipe(map(supplier => this.mapApiSupplierToModel(supplier)));
  }

  private mapApiSupplierToModel(supplier: ApiSupplierResponse): Supplier {
    return {
      id: String(supplier.id),
      type: supplier.tipoPessoa,
      name: supplier.nome,
      email: supplier.email,
      contact: supplier.contato ?? '',
      document: supplier.documento,
      status: supplier.status === 'ATIVO' ? 'ACTIVE' : 'INACTIVE',
      zipCode: supplier.cep ?? '',
      street: supplier.logradouro ?? '',
      neighborhood: supplier.bairro ?? '',
      state: supplier.uf ?? '',
      city: supplier.cidade ?? '',
      number: supplier.numero ?? '',
      notes: supplier.observacao ?? '',
    };
  }

  private mapModelToPayload(supplier: Omit<Supplier, 'id'> | Supplier, userId: number): ApiSupplierPayload {
    return {
      nome: supplier.name,
      email: supplier.email,
      contato: supplier.contact || null,
      tipoPessoa: supplier.type,
      documento: supplier.document,
      status: supplier.status === 'ACTIVE' ? 'ATIVO' : 'INATIVO',
      cep: supplier.zipCode || null,
      uf: supplier.state || null,
      cidade: supplier.city || null,
      logradouro: supplier.street || null,
      numero: supplier.number || null,
      bairro: supplier.neighborhood || null,
      observacao: supplier.notes || null,
      usuarioId: userId,
    };
  }
}
