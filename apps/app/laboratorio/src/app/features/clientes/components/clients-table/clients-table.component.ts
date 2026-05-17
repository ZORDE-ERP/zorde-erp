import { ChangeDetectionStrategy, Component, effect, input, linkedSignal, output, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoreHorizontal, lucidePencil, lucideTrash, lucidePower, lucidePowerOff } from '@ng-icons/lucide';

import { Client, PaginationMeta } from '../../models/client.model';
import { ClientsAdapter } from '../../adapter/clients.adapter';

import { HlmTable, HlmTr, HlmTh, HlmTd } from 'src/app/shared/ui/table';
import { HlmButton } from 'src/app/shared/ui/button';
import { HlmIcon } from 'src/app/shared/ui/icon';
import { HlmBadge } from 'src/app/shared/ui/badge';
import {
  HlmDropdownMenu,
  HlmDropdownMenuItem,
  HlmDropdownMenuSeparator,
  HlmDropdownMenuTrigger,
} from 'src/app/shared/ui/dropdown-menu';
import { HlmNumberedPagination } from 'src/app/shared/ui/pagination';

@Component({
  selector: 'app-clients-table',
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
    HlmBadge,
    HlmDropdownMenu,
    HlmDropdownMenuItem,
    HlmDropdownMenuSeparator,
    HlmDropdownMenuTrigger,
    HlmNumberedPagination,
  ],
  providers: [
    provideIcons({
      lucideMoreHorizontal,
      lucidePencil,
      lucideTrash,
      lucidePower,
      lucidePowerOff,
    }),
    ClientsAdapter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clients-table.component.html',
})
export class ClientsTableComponent {
  readonly clients = input<Client[]>([]);
  readonly pagination = input<PaginationMeta>({ currentPage: 1, pageSize: 10, totalItems: 0 });

  readonly edit = output<Client>();
  readonly delete = output<string>();
  readonly toggleStatus = output<string>();
  readonly pageChanged = output<number>();
  readonly pageSizeChanged = output<number>();

  protected readonly _currentPage = linkedSignal(() => this.pagination().currentPage);
  protected readonly _pageSize = linkedSignal(() => this.pagination().pageSize);

  constructor(public adapter: ClientsAdapter) {
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

  onEdit(client: Client): void {
    this.edit.emit(client);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  onToggleStatus(id: string): void {
    this.toggleStatus.emit(id);
  }
}
