import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, ClientsSummary, PaginationMeta } from '../models/client.model';

export interface ClientsFilter {
  search?: string;
  type?: 'FISICA' | 'JURIDICA' | '';
  status?: 'ACTIVE' | 'INACTIVE' | '';
}

@Injectable({
  providedIn: 'root'
})
export class ClientsState {
  private clientsSubject = new BehaviorSubject<Client[]>([]);
  public clients$ = this.clientsSubject.asObservable();

  private summarySubject = new BehaviorSubject<ClientsSummary>({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0
  });
  public summary$ = this.summarySubject.asObservable();

  private paginationSubject = new BehaviorSubject<PaginationMeta>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });
  public pagination$ = this.paginationSubject.asObservable();

  private filtersSubject = new BehaviorSubject<ClientsFilter>({});
  public filters$ = this.filtersSubject.asObservable();

  private filterExpandedSubject = new BehaviorSubject<boolean>(false);
  public filterExpanded$ = this.filterExpandedSubject.asObservable();

  setClients(clients: Client[]): void {
    this.clientsSubject.next(clients);
  }

  updateSummary(summary: ClientsSummary): void {
    this.summarySubject.next(summary);
  }

  updatePagination(pagination: Partial<PaginationMeta>): void {
    this.paginationSubject.next({
      ...this.paginationSubject.getValue(),
      ...pagination
    });
  }

  setFilters(filters: ClientsFilter): void {
    this.filtersSubject.next(filters);
  }

  toggleFilterExpanded(): void {
    this.filterExpandedSubject.next(!this.filterExpandedSubject.getValue());
  }

  getFilterExpanded(): boolean {
    return this.filterExpandedSubject.getValue();
  }

  getPagination(): PaginationMeta {
    return this.paginationSubject.getValue();
  }
  
  getFilters(): ClientsFilter {
    return this.filtersSubject.getValue();
  }
}
