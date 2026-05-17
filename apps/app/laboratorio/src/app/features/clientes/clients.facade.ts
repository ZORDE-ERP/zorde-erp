import { Injectable, inject } from '@angular/core';
import { take } from 'rxjs/operators';
import { ClientsApi } from './api/clients.api';
import { ClientsAdapter } from './adapter/clients.adapter';
import { ClientsState, ClientsFilter } from './state/clients.state';
import { Client } from './models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsFacade {
  private api = inject(ClientsApi);
  private adapter = inject(ClientsAdapter);
  public state = inject(ClientsState);

  loadClients(): void {
    this.api.getAll().pipe(take(1)).subscribe(clients => {
      let filtered = [...clients];
      const filters = this.state.getFilters();
      
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(s) || 
          c.document.includes(s)
        );
      }
      if (filters.type) {
        filtered = filtered.filter(c => c.type === filters.type);
      }
      if (filters.status) {
        filtered = filtered.filter(c => c.status === filters.status);
      }

      const summary = this.adapter.calculateSummary(filtered);
      this.state.updateSummary(summary);

      const pagination = this.state.getPagination();
      const totalItems = filtered.length;
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      
      this.state.updatePagination({ totalItems });
      this.state.setClients(filtered.slice(startIndex, endIndex));
    });
  }

  createClient(clientData: Omit<Client, 'id'>): void {
    this.api.create(clientData).pipe(take(1)).subscribe(() => {
      this.loadClients();
    });
  }

  updateClient(id: string, updates: Partial<Client>): void {
    this.api.update(id, updates).pipe(take(1)).subscribe(() => {
      this.loadClients();
    });
  }

  deleteClient(id: string): void {
    this.api.delete(id).pipe(take(1)).subscribe(() => {
      this.loadClients();
    });
  }

  toggleClientStatus(id: string): void {
    this.api.toggleStatus(id).pipe(take(1)).subscribe(() => {
      this.loadClients();
    });
  }

  applyFilters(filters: ClientsFilter): void {
    this.state.setFilters(filters);
    this.state.updatePagination({ currentPage: 1 });
    this.loadClients();
  }

  clearFilters(): void {
    this.state.setFilters({});
    this.state.updatePagination({ currentPage: 1 });
    this.loadClients();
  }

  changePage(page: number): void {
    this.state.updatePagination({ currentPage: page });
    this.loadClients();
  }

  changePageSize(size: number): void {
    this.state.updatePagination({ pageSize: size, currentPage: 1 });
    this.loadClients();
  }

  toggleFilterExpanded(): void {
    this.state.toggleFilterExpanded();
  }
}
