import { Injectable, inject } from '@angular/core';
import { take } from 'rxjs/operators';
import { ServiceOrdersApi } from './api/service-orders.api';
import { ServiceOrdersAdapter } from './adapter/service-orders.adapter';
import { ServiceOrdersState, ServiceOrdersFilter } from './state/service-orders.state';
import { ServiceOrder, ServiceOrderUpsert } from './models/service-orders.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrdersFacade {
  private api = inject(ServiceOrdersApi);
  private adapter = inject(ServiceOrdersAdapter);
  public state = inject(ServiceOrdersState);

  loadOrders(filters?: ServiceOrdersFilter): void {
    this.state.setLoading(true);
    this.api.getAll().pipe(take(1)).subscribe(orders => {
      let filtered = [...orders];
      const activeFilters = filters ?? this.state.getFilters();

      if (activeFilters.code) {
        filtered = filtered.filter(o =>
          o.code.toLowerCase().includes(activeFilters.code!.toLowerCase())
        );
      }
      if (activeFilters.clientId) {
        filtered = filtered.filter(o => o.clientId === activeFilters.clientId);
      }
      if (activeFilters.serviceType) {
        filtered = filtered.filter(o => o.serviceType === activeFilters.serviceType);
      }
      if (activeFilters.startDate) {
        filtered = filtered.filter(o => this.toComparableDate(o.createdAt) >= activeFilters.startDate!);
      }
      if (activeFilters.endDate) {
        filtered = filtered.filter(o => this.toComparableDate(o.createdAt) <= activeFilters.endDate!);
      }

      const summary = this.adapter.calculateSummary(filtered);
      this.state.updateSummary(summary);

      const pagination = this.state.getPagination();
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;

      this.state.updatePagination({ totalItems: filtered.length });
      this.state.setOrders(filtered.slice(startIndex, endIndex));
      this.state.setLoading(false);
    });
  }

  saveOrder(data: ServiceOrderUpsert): void {
    this.api.create(data).pipe(take(1)).subscribe(() => {
      this.loadOrders();
    });
  }

  updateOrder(id: string, data: ServiceOrderUpsert): void {
    this.api.update(id, data).pipe(take(1)).subscribe(() => {
      this.loadOrders();
    });
  }

  deleteOrder(id: string): void {
    this.api.delete(id).pipe(take(1)).subscribe(() => {
      this.loadOrders();
    });
  }

  applyFilters(filters: ServiceOrdersFilter): void {
    this.state.setFilters(filters);
    this.state.updatePagination({ currentPage: 1 });
    this.loadOrders(filters);
  }

  clearFilters(): void {
    this.state.setFilters({});
    this.state.updatePagination({ currentPage: 1 });
    this.loadOrders({});
  }

  changePage(page: number): void {
    this.state.updatePagination({ currentPage: page });
    this.loadOrders();
  }

  changePageSize(size: number): void {
    this.state.updatePagination({ pageSize: size, currentPage: 1 });
    this.loadOrders();
  }

  toggleFilterExpanded(): void {
    this.state.toggleFilterExpanded();
  }

  private toComparableDate(formattedDate: string): string {
    const [day, month, year] = formattedDate.split('/');
    return `${year}-${month}-${day}`;
  }
}
