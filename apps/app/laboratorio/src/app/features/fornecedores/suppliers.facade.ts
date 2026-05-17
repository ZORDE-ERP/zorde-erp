import { Injectable, inject } from '@angular/core';
import { take } from 'rxjs/operators';
import { SuppliersApi } from './api/suppliers.api';
import { SuppliersAdapter } from './adapter/suppliers.adapter';
import { SuppliersState, SuppliersFilter } from './state/suppliers.state';
import { Supplier } from './models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SuppliersFacade {
  private api = inject(SuppliersApi);
  private adapter = inject(SuppliersAdapter);
  public state = inject(SuppliersState);

  loadSuppliers(): void {
    this.api.getAll().pipe(take(1)).subscribe(suppliers => {
      let filtered = [...suppliers];
      const filters = this.state.getFilters();
      
      if (filters.name) {
        const s = filters.name.toLowerCase();
        filtered = filtered.filter(c => c.name.toLowerCase().includes(s));
      }
      if (filters.document) {
        const s = filters.document.toLowerCase();
        filtered = filtered.filter(c => c.document.includes(s));
      }
      if (filters.state) {
        const s = filters.state.toLowerCase();
        filtered = filtered.filter(c => c.state.toLowerCase() === s);
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
      this.state.setSuppliers(filtered.slice(startIndex, endIndex));
    });
  }

  createSupplier(supplierData: Omit<Supplier, 'id'>): void {
    this.api.create(supplierData).pipe(take(1)).subscribe(() => {
      this.loadSuppliers();
    });
  }

  updateSupplier(id: string, updates: Partial<Supplier>): void {
    this.api.update(id, updates).pipe(take(1)).subscribe(() => {
      this.loadSuppliers();
    });
  }

  deleteSupplier(id: string): void {
    this.api.delete(id).pipe(take(1)).subscribe(() => {
      this.loadSuppliers();
    });
  }

  toggleSupplierStatus(id: string): void {
    this.api.toggleStatus(id).pipe(take(1)).subscribe(() => {
      this.loadSuppliers();
    });
  }

  applyFilters(filters: SuppliersFilter): void {
    this.state.setFilters(filters);
    this.state.updatePagination({ currentPage: 1 });
    this.loadSuppliers();
  }

  clearFilters(): void {
    this.state.setFilters({});
    this.state.updatePagination({ currentPage: 1 });
    this.loadSuppliers();
  }

  changePage(page: number): void {
    this.state.updatePagination({ currentPage: page });
    this.loadSuppliers();
  }

  changePageSize(size: number): void {
    this.state.updatePagination({ pageSize: size, currentPage: 1 });
    this.loadSuppliers();
  }

  toggleFilterExpanded(): void {
    this.state.toggleFilterExpanded();
  }
}
