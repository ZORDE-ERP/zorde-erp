import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';

import { ClientsFacade } from '../clients.facade';
import { ClientsAdapter } from '../adapter/clients.adapter';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { SummaryCardsComponent } from '../../../shared/components/summary-cards/summary-cards.component';
import { ClientsFilterComponent } from '../components/clients-filter/clients-filter.component';
import { ClientsTableComponent } from '../components/clients-table/clients-table.component';
import { ClientFormComponent } from '../components/client-form/client-form.component';
import { Client } from '../models/client.model';
import { ClientsFilter } from '../state/clients.state';
import { map } from 'rxjs/operators';

import { HlmButton } from 'src/app/shared/ui/button';
import { HlmIcon } from 'src/app/shared/ui/icon';

@Component({
  selector: 'app-clients-container',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    SummaryCardsComponent,
    ClientsFilterComponent,
    ClientsTableComponent,
    HlmButton,
    HlmIcon,
  ],
  providers: [
    provideIcons({ lucidePlus })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clients-container.component.html'
})
export class ClientsContainerComponent implements OnInit {
  public facade = inject(ClientsFacade);
  public adapter = inject(ClientsAdapter);
  private modalService = inject(ModalService);

  summaryItems$ = this.facade.state.summary$.pipe(
    map(summary => this.adapter.buildSummaryCards(summary))
  );

  ngOnInit() {
    this.facade.loadClients();
  }

  onFilterChanged(filters: ClientsFilter) {
    this.facade.applyFilters(filters);
  }

  onFilterCleared() {
    this.facade.clearFilters();
  }

  onToggleFilter() {
    this.facade.toggleFilterExpanded();
  }

  onEdit(client: Client) {
    this.modalService.open(ClientFormComponent, {
      title: 'Editar Cliente',
      data: client,
      size: 'lg'
    }).subscribe(result => {
      if (result) {
        this.facade.updateClient(client.id, result as Partial<Client>);
      }
    });
  }

  onCreate() {
    this.modalService.open(ClientFormComponent, {
      title: 'Novo Cliente',
      size: 'lg'
    }).subscribe(result => {
      if (result) {
        this.facade.createClient(result as Omit<Client, 'id'>);
      }
    });
  }

  onDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.facade.deleteClient(id);
    }
  }

  onToggleStatus(id: string) {
    this.facade.toggleClientStatus(id);
  }

  onPageChange(page: number) {
    this.facade.changePage(page);
  }

  onPageSizeChange(size: number) {
    this.facade.changePageSize(size);
  }
}
