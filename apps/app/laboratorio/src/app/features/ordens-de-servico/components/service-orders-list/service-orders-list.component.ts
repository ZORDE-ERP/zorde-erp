import { ChangeDetectionStrategy, Component, effect, input, linkedSignal, output, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMoreHorizontal,
  lucidePencil,
  lucideTrash,
} from '@ng-icons/lucide';

import { ServiceOrder, PaginationMeta } from '../../models/service-orders.model';
import { ServiceOrdersAdapter } from '../../adapter/service-orders.adapter';

import { HlmTable, HlmTr, HlmTh, HlmTd } from 'src/app/shared/ui/table';
import { HlmButton } from 'src/app/shared/ui/button';
import { HlmIcon } from 'src/app/shared/ui/icon';
import {
  HlmDropdownMenu,
  HlmDropdownMenuItem,
  HlmDropdownMenuSeparator,
  HlmDropdownMenuTrigger,
} from 'src/app/shared/ui/dropdown-menu';
import { HlmNumberedPagination } from 'src/app/shared/ui/pagination';

@Component({
  selector: 'app-service-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    HlmTable,
    HlmTr,
    HlmTh,
    HlmTd,
    HlmButton,
    HlmIcon,
    HlmDropdownMenu,
    HlmDropdownMenuItem,
    HlmDropdownMenuSeparator,
    HlmDropdownMenuTrigger,
    HlmNumberedPagination,
  ],
  providers: [
    provideIcons({ lucideMoreHorizontal, lucidePencil, lucideTrash }),
    ServiceOrdersAdapter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './service-orders-list.component.html',
})
export class ServiceOrdersListComponent {
  readonly orders = input<ServiceOrder[]>([]);
  readonly pagination = input<PaginationMeta>({ currentPage: 1, pageSize: 10, totalItems: 0 });

  readonly edit = output<ServiceOrder>();
  readonly delete = output<string>();
  readonly pageChanged = output<number>();
  readonly pageSizeChanged = output<number>();

  protected readonly _currentPage = linkedSignal(() => this.pagination().currentPage);
  protected readonly _pageSize = linkedSignal(() => this.pagination().pageSize);

  constructor(public adapter: ServiceOrdersAdapter) {
    effect(() => {
      const page = this._currentPage();
      untracked(() => {
        if (page !== this.pagination().currentPage) {
          this.pageChanged.emit(page);
        }
      });
    });

    effect(() => {
      const size = this._pageSize();
      untracked(() => {
        if (size !== this.pagination().pageSize) {
          this.pageSizeChanged.emit(size);
        }
      });
    });
  }

  onEdit(order: ServiceOrder): void {
    this.edit.emit(order);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }
}
