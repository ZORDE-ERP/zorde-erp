import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';

import { SuppliersFacade } from '../suppliers.facade';
import { SuppliersAdapter } from '../adapter/suppliers.adapter';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { SummaryCardsComponent } from '../../../shared/components/summary-cards/summary-cards.component';
import { SuppliersFilterComponent } from '../components/suppliers-filter/suppliers-filter.component';
import { SuppliersTableComponent } from '../components/suppliers-table/suppliers-table.component';
import { SupplierFormComponent } from '../components/supplier-form/supplier-form.component';
import { Supplier } from '../models/supplier.model';
import { SuppliersFilter } from '../state/suppliers.state';
import { map } from 'rxjs/operators';

import { HlmButton } from 'src/app/shared/ui/button';
import { HlmIcon } from 'src/app/shared/ui/icon';

@Component({
  selector: 'app-suppliers-container',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    SummaryCardsComponent,
    SuppliersFilterComponent,
    SuppliersTableComponent,
    HlmButton,
    HlmIcon,
  ],
  providers: [
    provideIcons({ lucidePlus })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suppliers-container.component.html'
})
export class SuppliersContainerComponent implements OnInit {
  public facade = inject(SuppliersFacade);
  public adapter = inject(SuppliersAdapter);
  private modalService = inject(ModalService);

  summaryItems$ = this.facade.state.summary$.pipe(
    map(summary => this.adapter.buildSummaryCards(summary))
  );

  ngOnInit() {
    this.facade.loadSuppliers();
  }

  onFilterChanged(filters: SuppliersFilter) {
    this.facade.applyFilters(filters);
  }

  onFilterCleared() {
    this.facade.clearFilters();
  }

  onToggleFilter() {
    this.facade.toggleFilterExpanded();
  }

  onEdit(supplier: Supplier) {
    this.modalService.open(SupplierFormComponent, {
      title: 'Editar Fornecedor',
      data: supplier,
      size: 'lg'
    }).subscribe(result => {
      if (result) {
        this.facade.updateSupplier(supplier.id, result as Partial<Supplier>);
      }
    });
  }

  onCreate() {
    this.modalService.open(SupplierFormComponent, {
      title: 'Novo Fornecedor',
      size: 'lg'
    }).subscribe(result => {
      if (result) {
        this.facade.createSupplier(result as Omit<Supplier, 'id'>);
      }
    });
  }

  onDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      this.facade.deleteSupplier(id);
    }
  }

  onToggleStatus(id: string) {
    this.facade.toggleSupplierStatus(id);
  }

  onPageChange(page: number) {
    this.facade.changePage(page);
  }

  onPageSizeChange(size: number) {
    this.facade.changePageSize(size);
  }
}
