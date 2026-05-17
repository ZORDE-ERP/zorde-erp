import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ServiceOrder, ServiceOrdersSummary, PaginationMeta, ServiceType } from '../models/service-orders.model';

export interface ServiceOrdersFilter {
  code?: string;
  clientId?: string;
  serviceType?: ServiceType | '';
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceOrdersState {
  private ordersSubject = new BehaviorSubject<ServiceOrder[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  private summarySubject = new BehaviorSubject<ServiceOrdersSummary>({ total: 0 });
  public summary$ = this.summarySubject.asObservable();

  private paginationSubject = new BehaviorSubject<PaginationMeta>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  });
  public pagination$ = this.paginationSubject.asObservable();

  private filtersSubject = new BehaviorSubject<ServiceOrdersFilter>({});
  public filters$ = this.filtersSubject.asObservable();

  private filterExpandedSubject = new BehaviorSubject<boolean>(false);
  public filterExpanded$ = this.filterExpandedSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  setOrders(orders: ServiceOrder[]): void {
    this.ordersSubject.next(orders);
  }

  updateSummary(summary: ServiceOrdersSummary): void {
    this.summarySubject.next(summary);
  }

  updatePagination(pagination: Partial<PaginationMeta>): void {
    this.paginationSubject.next({
      ...this.paginationSubject.getValue(),
      ...pagination,
    });
  }

  setFilters(filters: ServiceOrdersFilter): void {
    this.filtersSubject.next(filters);
  }

  toggleFilterExpanded(): void {
    this.filterExpandedSubject.next(!this.filterExpandedSubject.getValue());
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  getFilters(): ServiceOrdersFilter {
    return this.filtersSubject.getValue();
  }

  getPagination(): PaginationMeta {
    return this.paginationSubject.getValue();
  }

  getFilterExpanded(): boolean {
    return this.filterExpandedSubject.getValue();
  }
}
