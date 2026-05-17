import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Client } from '../models/client.model';
import { ApiContextService } from '../../../core/api/api-context.service';

interface ApiClientResponse {
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

interface ApiClientPayload {
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
export class ClientsApi {
  private readonly http = inject(HttpClient);
  private readonly apiContext = inject(ApiContextService);

  getAll(): Observable<Client[]> {
    return this.http
      .get<ApiClientResponse[]>(`${this.apiContext.apiBase}/clientes`)
      .pipe(map(clients => clients.map(client => this.mapApiClientToModel(client))));
  }

  create(client: Omit<Client, 'id'>): Observable<Client> {
    return this.apiContext.getCurrentUserId().pipe(
      switchMap(userId =>
        this.http
          .post<ApiClientResponse>(`${this.apiContext.apiBase}/clientes`, this.mapModelToPayload(client, userId))
          .pipe(map(createdClient => this.mapApiClientToModel(createdClient))),
      ),
    );
  }

  update(id: string, updates: Partial<Client>): Observable<Client> {
    const clientId = Number(id);

    return this.getById(id).pipe(
      switchMap(currentClient =>
        this.apiContext.getCurrentUserId().pipe(
          switchMap(userId =>
            this.http
              .put<ApiClientResponse>(
                `${this.apiContext.apiBase}/clientes/${clientId}`,
                this.mapModelToPayload({ ...currentClient, ...updates, id }, userId),
              )
              .pipe(map(updatedClient => this.mapApiClientToModel(updatedClient))),
          ),
        ),
      ),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiContext.apiBase}/clientes/${Number(id)}`);
  }

  toggleStatus(id: string): Observable<Client> {
    return this.getById(id).pipe(
      switchMap(client =>
        this.update(id, {
          status: client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        }),
      ),
    );
  }

  getById(id: string): Observable<Client> {
    return this.http
      .get<ApiClientResponse>(`${this.apiContext.apiBase}/clientes/${Number(id)}`)
      .pipe(map(client => this.mapApiClientToModel(client)));
  }

  private mapApiClientToModel(client: ApiClientResponse): Client {
    return {
      id: String(client.id),
      type: client.tipoPessoa,
      name: client.nome,
      email: client.email,
      contact: client.contato ?? '',
      document: client.documento,
      status: client.status === 'ATIVO' ? 'ACTIVE' : 'INACTIVE',
      zipCode: client.cep ?? '',
      street: client.logradouro ?? '',
      neighborhood: client.bairro ?? '',
      state: client.uf ?? '',
      city: client.cidade ?? '',
      number: client.numero ?? '',
      notes: client.observacao ?? '',
    };
  }

  private mapModelToPayload(client: Omit<Client, 'id'> | Client, userId: number): ApiClientPayload {
    return {
      nome: client.name,
      email: client.email,
      contato: client.contact || null,
      tipoPessoa: client.type,
      documento: client.document,
      status: client.status === 'ACTIVE' ? 'ATIVO' : 'INATIVO',
      cep: client.zipCode || null,
      uf: client.state || null,
      cidade: client.city || null,
      logradouro: client.street || null,
      numero: client.number || null,
      bairro: client.neighborhood || null,
      observacao: client.notes || null,
      usuarioId: userId,
    };
  }
}
