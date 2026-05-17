import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  BillingChartData,
  BillingDataPoint,
  BillingPeriod,
  Client,
  ClosingItem,
} from './models/dashboard.models';
import { ClientsApi } from '../clientes/api/clients.api';
import { ServiceOrdersApi } from '../ordens-de-servico/api/service-orders.api';
import { ServiceOrder } from '../ordens-de-servico/models/service-orders.model';

function buildClosingKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(date);
}

function biweeklyLabel(date: Date): string {
  const half = date.getDate() <= 15 ? 'Q1' : 'Q2';
  return `${monthLabel(date)} ${half}`;
}

// ── Facade ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly clientsApi = inject(ClientsApi);
  private readonly serviceOrdersApi = inject(ServiceOrdersApi);

  // ── clients ──
  readonly clients = signal<Client[]>([]);
  readonly selectedClientId = signal<string | null>(null);
  private readonly allOrders = signal<ServiceOrder[]>([]);

  // ── billing chart ──
  readonly billingPeriod = signal<BillingPeriod>('monthly');
  readonly isBillingChartLoading = signal<boolean>(false);
  readonly billingChartData = signal<BillingChartData | null>(null);

  // ── ranking ──
  readonly selectedRankingMonth = signal<string>(buildClosingKey(new Date()));
  readonly isRankingsLoading = signal<boolean>(false);
  readonly closingsRankingData = signal<ClosingItem[]>([]);

  readonly monthOptions = computed<{ label: string; value: string }[]>(() => {
    const uniqueMonths = new Map<string, { label: string; value: string }>();

    for (const order of this.allOrders()) {
      const parsedDate = this.parseOrderDate(order.createdAt);
      const value = buildClosingKey(parsedDate);
      if (!uniqueMonths.has(value)) {
        uniqueMonths.set(value, {
          label: new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(parsedDate),
          value,
        });
      }
    }

    if (uniqueMonths.size === 0) {
      const currentDate = new Date();
      return [{
        label: new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate),
        value: buildClosingKey(currentDate),
      }];
    }

    return [...uniqueMonths.values()].sort((left, right) => right.value.localeCompare(left.value)).slice(0, 12);
  });

  // ── methods ──
  initialize(): void {
    this.isBillingChartLoading.set(true);
    this.isRankingsLoading.set(true);

    forkJoin({
      clients: this.clientsApi.getAll(),
      orders: this.serviceOrdersApi.getAll(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ clients, orders }) => {
          this.clients.set(clients.map(client => ({ id: client.id, name: client.name })));
          this.allOrders.set(orders);

          const latestMonth = this.monthOptions()[0]?.value;
          if (latestMonth) {
            this.selectedRankingMonth.set(latestMonth);
          }

          this.loadBillingChart();
          this.loadClosingsRanking();
        },
        error: () => {
          this.clients.set([]);
          this.allOrders.set([]);
          this.billingChartData.set({ clientId: null, dataPoints: [] });
          this.closingsRankingData.set([]);
          this.isBillingChartLoading.set(false);
          this.isRankingsLoading.set(false);
        },
      });
  }

  loadBillingChart(): void {
    this.isBillingChartLoading.set(true);
    const filteredOrders = this.filterOrdersBySelectedClient();
    const dataPoints = this.billingPeriod() === 'monthly'
      ? this.aggregateOrders(filteredOrders, monthLabel)
      : this.aggregateOrders(filteredOrders, biweeklyLabel);

    this.billingChartData.set({
      clientId: this.selectedClientId(),
      dataPoints,
    });
    this.isBillingChartLoading.set(false);
  }

  loadClosingsRanking(): void {
    this.isRankingsLoading.set(true);
    const month = this.selectedRankingMonth();

    // Group orders by client and sum their values
    const clientTotals = new Map<string, { clientName: string; totalValue: number; orderCount: number }>();

    for (const order of this.allOrders()) {
      if (buildClosingKey(this.parseOrderDate(order.createdAt)) !== month) {
        continue;
      }

      const existing = clientTotals.get(order.clientId);
      if (existing) {
        existing.totalValue += order.assemblyValue;
        existing.orderCount += 1;
      } else {
        clientTotals.set(order.clientId, {
          clientName: order.clientName,
          totalValue: order.assemblyValue,
          orderCount: 1,
        });
      }
    }

    const items: ClosingItem[] = [...clientTotals.entries()]
      .map(([clientId, data]) => ({
        clientId,
        clientName: data.clientName,
        totalValue: data.totalValue,
        orderCount: data.orderCount,
      }))
      .sort((left, right) => right.totalValue - left.totalValue)
      .slice(0, 10);

    this.closingsRankingData.set(items);
    this.isRankingsLoading.set(false);
  }

  selectClient(clientId: string | null): void {
    this.selectedClientId.set(clientId);
  }

  setBillingPeriod(period: BillingPeriod): void {
    this.billingPeriod.set(period);
  }

  setRankingMonth(month: string): void {
    this.selectedRankingMonth.set(month);
  }

  private filterOrdersBySelectedClient(): ServiceOrder[] {
    const selectedClientId = this.selectedClientId();
    if (!selectedClientId) {
      return this.allOrders();
    }

    return this.allOrders().filter(order => order.clientId === selectedClientId);
  }

  private aggregateOrders(orders: ServiceOrder[], labelBuilder: (date: Date) => string): BillingDataPoint[] {
    const totals = new Map<string, { date: Date; value: number }>();

    for (const order of orders) {
      const parsedDate = this.parseOrderDate(order.createdAt);
      const label = labelBuilder(parsedDate);
      const current = totals.get(label);

      totals.set(label, {
        date: parsedDate,
        value: (current?.value ?? 0) + order.assemblyValue,
      });
    }

    return [...totals.entries()]
      .sort((left, right) => left[1].date.getTime() - right[1].date.getTime())
      .map(([period, data]) => ({ period, value: data.value }));
  }

  private parseOrderDate(formattedDate: string): Date {
    const [day, month, year] = formattedDate.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
}
