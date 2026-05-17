import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideList } from '@ng-icons/lucide';

import { TabelaMontagemFacade } from '../tabela-montagem.facade';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { TabelaMontagemTableComponent } from '../components/tabela-montagem-table/tabela-montagem-table.component';
import { TabelaMontagemModalComponent } from '../components/tabela-montagem-modal/tabela-montagem-modal.component';
import { TabelaMontagem, CreateTabelaMontagemDto, UpdateTabelaMontagemDto } from '@zorde/shared-types';

import { HlmButton } from 'src/app/shared/ui/button';
import { HlmIcon } from 'src/app/shared/ui/icon';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from 'src/app/shared/ui/card';
import { HlmSpinner } from 'src/app/shared/ui/spinner';

@Component({
  selector: 'app-tabela-montagem-page',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    TabelaMontagemTableComponent,
    HlmButton,
    HlmIcon,
    HlmInput,
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
    HlmSpinner,
  ],
  providers: [
    provideIcons({ lucidePlus, lucideList }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabela-montagem-page.component.html',
})
export class TabelaMontagemPageComponent implements OnInit {
  facade = inject(TabelaMontagemFacade);
  private modalService = inject(ModalService);

  ngOnInit(): void {
    this.facade.loadClientes();
    this.facade.load();
  }

  onSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.facade.setSearch(term);
  }

  onCreate(): void {
    this.modalService.open(TabelaMontagemModalComponent, {
      title: 'Novo Registro',
      data: { clientes: this.facade.clientes() },
      size: 'md',
    }).subscribe(result => {
      if (result) {
        this.facade.create(result as CreateTabelaMontagemDto);
      }
    });
  }

  onEdit(item: TabelaMontagem): void {
    this.modalService.open(TabelaMontagemModalComponent, {
      title: 'Editar Registro',
      data: { ...item, clientes: this.facade.clientes() },
      size: 'md',
    }).subscribe(result => {
      if (result) {
        this.facade.update(item.id, result as UpdateTabelaMontagemDto);
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('Confirmar exclusão do registro?')) {
      this.facade.remove(id);
    }
  }

  onPageChange(page: number): void {
    this.facade.setPage(page);
  }

  onPageSizeChange(size: number): void {
    this.facade.setPageSize(size);
  }
}
