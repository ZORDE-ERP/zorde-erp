import { ChangeDetectionStrategy, Component, effect, input, linkedSignal, output, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoreHorizontal, lucidePencil, lucideTrash } from '@ng-icons/lucide';

import { TabelaMontagem } from '@zorde/shared-types';
import { PaginationMeta } from '../../models/tabela-montagem.model';

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
  selector: 'app-tabela-montagem-table',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabela-montagem-table.component.html',
})
export class TabelaMontagemTableComponent {
  items = input<TabelaMontagem[]>([]);
  pagination = input<PaginationMeta>({ currentPage: 1, pageSize: 10, totalItems: 0 });

  editItem = output<TabelaMontagem>();
  deleteItem = output<number>();
  pageChanged = output<number>();
  pageSizeChanged = output<number>();

  protected readonly _currentPage = linkedSignal(() => this.pagination().currentPage);
  protected readonly _pageSize = linkedSignal(() => this.pagination().pageSize);

  constructor() {
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

  onEdit(item: TabelaMontagem): void {
    this.editItem.emit(item);
  }

  onDelete(id: number): void {
    this.deleteItem.emit(id);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

