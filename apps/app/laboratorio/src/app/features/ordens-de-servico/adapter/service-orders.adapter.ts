import { Injectable } from '@angular/core';
import { ServiceOrder, ServiceOrdersSummary, SERVICE_TYPE_LABELS, ServiceType } from '../models/service-orders.model';
import { SummaryCardItem } from '../../../shared/components/summary-cards/summary-card-item.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrdersAdapter {

  calculateSummary(orders: ServiceOrder[]): ServiceOrdersSummary {
    return { total: orders.length };
  }

  buildSummaryCards(summary: ServiceOrdersSummary): SummaryCardItem[] {
    return [
      {
        title: 'Total de Ordens de Serviço',
        value: summary.total,
        icon: 'lucideClipboardList',
        variant: 'default',
      }
    ];
  }

  getServiceTypeLabel(type: ServiceType): string {
    return SERVICE_TYPE_LABELS[type] ?? type;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
