import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Supplier, SuppliersSummary, PaginationMeta } from '../models/supplier.model';

export interface SuppliersFilter {
  name?: string;
  document?: string;
  state?: string;
  status?: 'ACTIVE' | 'INACTIVE' | '';
}

@Injectable({
  providedIn: 'root'
})
export class SuppliersState {
  private suppliersSubject = new BehaviorSubject<Supplier[]>([]);
  public suppliers$ = this.suppliersSubject.asObservable();

  private summarySubject = new BehaviorSubject<SuppliersSummary>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0
  });
  public summary$ = this.summarySubject.asObservable();

  private paginationSubject = new BehaviorSubject<PaginationMeta>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });
  public pagination$ = this.paginationSubject.asObservable();

  private filtersSubject = new BehaviorSubject<SuppliersFilter>({});
  public filters$ = this.filtersSubject.asObservable();

  private filterExpandedSubject = new BehaviorSubject<boolean>(false);
  public filterExpanded$ = this.filterExpandedSubject.asObservable();

  setSuppliers(suppliers: Supplier[]): void {
    this.suppliersSubject.next(suppliers);
  }

  updateSummary(summary: SuppliersSummary): void {
    this.summarySubject.next(summary);
  }

  updatePagination(pagination: Partial<PaginationMeta>): void {
    this.paginationSubject.next({
      ...this.paginationSubject.getValue(),
      ...pagination
    });
  }

  setFilters(filters: SuppliersFilter): void {
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
  
  getFilters(): SuppliersFilter {
    return this.filtersSubject.getValue();
  }
}
