import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideClipboardList } from '@ng-icons/lucide';

import { ServiceOrdersFacade } from '../service-orders.facade';
import { ServiceOrdersAdapter } from '../adapter/service-orders.adapter';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { SummaryCardsComponent } from '../../../shared/components/summary-cards/summary-cards.component';
import { ServiceOrdersFilterComponent } from '../components/service-orders-filter/service-orders-filter.component';
import { ServiceOrdersListComponent } from '../components/service-orders-list/service-orders-list.component';
import { ServiceOrdersFormComponent } from '../components/service-orders-form/service-orders-form.component';
import { ServiceOrdersFilter } from '../state/service-orders.state';
import { ServiceOrder, ServiceOrderUpsert } from '../models/service-orders.model';
import { map } from 'rxjs/operators';

import { HlmButton } from 'src/app/shared/ui/button';
import { HlmIcon } from 'src/app/shared/ui/icon';

@Component({
  selector: 'app-service-orders-container',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    SummaryCardsComponent,
    ServiceOrdersFilterComponent,
    ServiceOrdersListComponent,
    HlmButton,
    HlmIcon,
  ],
  providers: [
    provideIcons({ lucidePlus, lucideClipboardList }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './service-orders-container.component.html',
})
export class ServiceOrdersContainerComponent implements OnInit {
  public facade = inject(ServiceOrdersFacade);
  public adapter = inject(ServiceOrdersAdapter);
  private modalService = inject(ModalService);

  summaryItems$ = this.facade.state.summary$.pipe(
    map(summary => this.adapter.buildSummaryCards(summary))
  );

  ngOnInit(): void {
    this.facade.loadOrders();
  }

  onFilterChanged(filters: ServiceOrdersFilter): void {
    this.facade.applyFilters(filters);
  }

  onFilterCleared(): void {
    this.facade.clearFilters();
  }

  onToggleFilter(): void {
    this.facade.toggleFilterExpanded();
  }

  onEdit(order: ServiceOrder): void {
    this.modalService.open(ServiceOrdersFormComponent, {
      title: 'Editar Ordem de Serviço',
      data: order,
      size: 'md',
    }).subscribe(result => {
      if (result) {
        this.facade.updateOrder(order.id, result as ServiceOrderUpsert);
      }
    });
  }

  onCreate(): void {
    this.modalService.open(ServiceOrdersFormComponent, {
      title: 'Nova Ordem de Serviço',
      size: 'md',
    }).subscribe(result => {
      if (result) {
        this.facade.saveOrder(result as ServiceOrderUpsert);
      }
    });
  }

  onDelete(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      this.facade.deleteOrder(id);
    }
  }

  onPageChange(page: number): void {
    this.facade.changePage(page);
  }

  onPageSizeChange(size: number): void {
    this.facade.changePageSize(size);
  }
}
