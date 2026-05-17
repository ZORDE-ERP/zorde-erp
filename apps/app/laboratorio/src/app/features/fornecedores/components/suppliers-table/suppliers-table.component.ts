import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoreHorizontal, lucidePencil, lucideTrash, lucidePower, lucidePowerOff } from '@ng-icons/lucide';

import { Supplier, PaginationMeta } from '../../models/supplier.model';
import { SuppliersAdapter } from '../../adapter/suppliers.adapter';

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
import {
  HlmPagination,
  HlmPaginationContent,
  HlmPaginationItem,
  HlmPaginationPrevious,
  HlmPaginationNext,
} from 'src/app/shared/ui/pagination';

@Component({
  selector: 'app-suppliers-table',
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
    HlmPagination,
    HlmPaginationContent,
    HlmPaginationItem,
    HlmPaginationPrevious,
    HlmPaginationNext,
  ],
  providers: [
    provideIcons({
      lucideMoreHorizontal,
      lucidePencil,
      lucideTrash,
      lucidePower,
      lucidePowerOff,
    }),
    SuppliersAdapter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suppliers-table.component.html',
})
export class SuppliersTableComponent {
  readonly suppliers = input<Supplier[]>([]);
  readonly pagination = input<PaginationMeta>({ currentPage: 1, pageSize: 10, totalItems: 0 });

  readonly edit = output<Supplier>();
  readonly delete = output<string>();
  readonly toggleStatus = output<string>();
  readonly pageChanged = output<number>();
  readonly pageSizeChanged = output<number>();

  readonly Math = Math;

  constructor(public adapter: SuppliersAdapter) {}

  get totalPages(): number {
    const p = this.pagination();
    return Math.ceil(p.totalItems / p.pageSize) || 1;
  }

  onEdit(supplier: Supplier): void {
    this.edit.emit(supplier);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  onToggleStatus(id: string): void {
    this.toggleStatus.emit(id);
  }

  onPageChange(page: number): void {
    this.pageChanged.emit(page);
  }
}
