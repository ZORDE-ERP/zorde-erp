import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidosService, Pedido, PaginatedResponse, PedidosFilters } from '../../services/pedidos.service';
import { AdminService, PipelineStage } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="pedidos-page">
      <div class="header">
        <h1>📋 Pedidos</h1>
        <button (click)="abrirModalNovoPedido()" class="btn-primary" *ngIf="podecriar">
          ➕ Novo Pedido
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <h3>🔍 Filtros</h3>
        <form [formGroup]="formFiltros" (ngSubmit)="aplicarFiltros()" class="filters-form">
          <div class="filter-group">
            <label>Status</label>
            <select formControlName="stageId" class="form-control">
              <option value="">-- Todos --</option>
              <option *ngFor="let stage of stages" [value]="stage.id">
                {{ stage.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>De</label>
            <input type="date" formControlName="fromDate" class="form-control" />
          </div>

          <div class="filter-group">
            <label>Até</label>
            <input type="date" formControlName="toDate" class="form-control" />
          </div>

          <div class="filter-group">
            <label>Buscar</label>
            <input type="text" formControlName="search" placeholder="ID do cliente ou produto" class="form-control" />
          </div>

          <button type="submit" class="btn-filter">Filtrar</button>
          <button type="button" (click)="limparFiltros()" class="btn-secondary">Limpar</button>
        </form>
      </div>

      <div *ngIf="loading" class="loading">Carregando pedidos...</div>

      <div *ngIf="!loading && pedidos.length > 0" class="pedidos-list">
        <div *ngFor="let pedido of pedidos" class="pedido-card">
          <div class="pedido-header">
            <h3>{{ pedido.id.substring(0, 8) }}</h3>
            <div class="actions">
              <button (click)="abrirModalEditar(pedido)" class="btn-small">✏️</button>
              <button (click)="abrirModalStage(pedido)" class="btn-small" *ngIf="podeAtualizarStage">
                📊
              </button>
              <button (click)="deletar(pedido.id)" class="btn-small danger">🗑️</button>
            </div>
          </div>
          <div class="pedido-body">
            <p><strong>Status:</strong> {{ pedido.currentStageId }}</p>
            <p><strong>Criado:</strong> {{ pedido.createdAt | date: 'short' }}</p>
            <p><strong>Produto:</strong> {{ pedido.produtoId }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && pedidos.length === 0" class="empty-state">
        <p>Nenhum pedido encontrado.</p>
      </div>

      <!-- Paginação -->
      <app-pagination
        *ngIf="total > 0"
        [total]="total"
        [skip]="skip"
        [take]="take"
        (pageChange)="onPageChange($event)"
      ></app-pagination>

      <!-- Modal Novo/Editar Pedido -->
      <div *ngIf="mostrarModalPedido" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editandoPedido ? 'Editar Pedido' : 'Novo Pedido' }}</h2>
            <button (click)="fecharModal()" class="btn-close">✕</button>
          </div>
          <form [formGroup]="formPedido" (ngSubmit)="salvarPedido()">
            <div class="form-group">
              <label>Produto ID</label>
              <input type="text" formControlName="produtoId" class="form-control" required />
            </div>

            <div class="form-group">
              <label>Cliente ID (opcional)</label>
              <input type="text" formControlName="clienteId" class="form-control" />
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="!formPedido.valid" class="btn-primary">
                Salvar
              </button>
              <button type="button" (click)="fecharModal()" class="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Atualizar Stage -->
      <div *ngIf="mostrarModalStage" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Atualizar Status do Pedido</h2>
            <button (click)="fecharModalStage()" class="btn-close">✕</button>
          </div>
          <form [formGroup]="formStage" (ngSubmit)="atualizarStage()">
            <div class="form-group">
              <label>Novo Status</label>
              <select formControlName="stageId" class="form-control">
                <option value="">-- Selecione um status --</option>
                <option *ngFor="let stage of stages" [value]="stage.id">
                  {{ stage.name }}
                </option>
              </select>
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="!formStage.valid" class="btn-primary">
                Atualizar
              </button>
              <button type="button" (click)="fecharModalStage()" class="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pedidos-page {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;
      }

      h1 {
        margin: 0;
        color: #333;
      }

      .filters-section {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .filters-section h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .filters-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        align-items: flex-end;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
      }

      .filter-group label {
        margin-bottom: 0.5rem;
        color: #333;
        font-weight: 500;
        font-size: 0.875rem;
      }

      .form-control {
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.875rem;
        font-family: inherit;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
      }

      .btn-filter {
        padding: 0.75rem 1.5rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
      }

      .btn-filter:hover {
        background: #5568d3;
      }

      .btn-secondary {
        padding: 0.75rem 1.5rem;
        background: #f0f0f0;
        color: #333;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .btn-secondary:hover {
        background: #e0e0e0;
      }

      .pedidos-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .pedido-card {
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .pedido-card:hover {
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .pedido-header {
        background: #f5f5f5;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pedido-header h3 {
        margin: 0;
        color: #333;
        font-size: 1rem;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-small {
        padding: 0.5rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      }

      .btn-small:hover {
        background: #5568d3;
      }

      .btn-small.danger {
        background: #e74c3c;
      }

      .btn-small.danger:hover {
        background: #c0392b;
      }

      .pedido-body {
        padding: 1rem;
      }

      .pedido-body p {
        margin: 0.5rem 0;
        color: #666;
        font-size: 0.875rem;
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #999;
        background: white;
        border-radius: 8px;
      }

      .loading {
        text-align: center;
        padding: 2rem;
        color: #666;
      }

      .btn-primary {
        padding: 0.75rem 1rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      }

      .btn-primary:hover:not(:disabled) {
        background: #5568d3;
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        min-width: 400px;
        max-width: 600px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .modal-header h2 {
        margin: 0;
      }

      .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
        font-weight: 500;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
      }
    `,
  ],
})
export class Pedidos implements OnInit {
  private pedidosService = inject(PedidosService);
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  pedidos: Pedido[] = [];
  stages: PipelineStage[] = [];
  loading = false;
  total = 0;
  skip = 0;
  take = 10;

  // Modal states
  mostrarModalPedido = false;
  mostrarModalStage = false;
  editandoPedido: Pedido | null = null;
  pedidoParaAtualizarStage: Pedido | null = null;

  // Forms
  formPedido: FormGroup;
  formStage: FormGroup;
  formFiltros: FormGroup;

  // Permissions
  podecriar = false;
  podeAtualizarStage = false;

  constructor() {
    this.formPedido = this.fb.group({
      produtoId: ['', Validators.required],
      clienteId: [''],
    });

    this.formStage = this.fb.group({
      stageId: ['', Validators.required],
    });

    this.formFiltros = this.fb.group({
      stageId: [''],
      fromDate: [''],
      toDate: [''],
      search: [''],
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.podecriar = user?.permissions.some(p => p.resource === 'pedidos' && p.action === 'create') ?? false;
    this.podeAtualizarStage = user?.permissions.some(p => p.resource === 'pedidos' && p.action === 'update_stage') ?? false;

    this.carregarPedidos();
    this.carregarStages();
  }

  carregarPedidos(): void {
    this.loading = true;
    const filters: PedidosFilters = {
      skip: this.skip,
      take: this.take,
    };

    // Adicionar filtros se preenchidos
    const stageId = this.formFiltros.get('stageId')?.value;
    const fromDate = this.formFiltros.get('fromDate')?.value;
    const toDate = this.formFiltros.get('toDate')?.value;
    const search = this.formFiltros.get('search')?.value;

    if (stageId) filters.stageId = stageId;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    if (search) filters.search = search;

    this.pedidosService.listar(filters).subscribe({
      next: (response: PaginatedResponse<Pedido>) => {
        this.pedidos = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos:', err);
        this.loading = false;
      },
    });
  }

  carregarStages(): void {
    this.adminService.listarStages().subscribe({
      next: (stages) => {
        this.stages = stages.sort((a, b) => a.order - b.order);
      },
      error: (err) => console.error('Erro ao carregar stages:', err),
    });
  }

  aplicarFiltros(): void {
    this.skip = 0; // Resetar para primeira página
    this.carregarPedidos();
  }

  limparFiltros(): void {
    this.formFiltros.reset();
    this.skip = 0;
    this.carregarPedidos();
  }

  onPageChange(event: { skip: number; take: number }): void {
    this.skip = event.skip;
    this.take = event.take;
    this.carregarPedidos();
  }

  abrirModalNovoPedido(): void {
    this.editandoPedido = null;
    this.formPedido.reset();
    this.mostrarModalPedido = true;
  }

  abrirModalEditar(pedido: Pedido): void {
    this.editandoPedido = pedido;
    this.formPedido.patchValue({
      produtoId: pedido.produtoId,
      clienteId: pedido.clienteId,
    });
    this.mostrarModalPedido = true;
  }

  abrirModalStage(pedido: Pedido): void {
    this.pedidoParaAtualizarStage = pedido;
    this.formStage.reset();
    this.mostrarModalStage = true;
  }

  fecharModal(): void {
    this.mostrarModalPedido = false;
    this.editandoPedido = null;
    this.formPedido.reset();
  }

  fecharModalStage(): void {
    this.mostrarModalStage = false;
    this.pedidoParaAtualizarStage = null;
    this.formStage.reset();
  }

  salvarPedido(): void {
    if (!this.formPedido.valid) return;

    const data = this.formPedido.value;

    if (this.editandoPedido) {
      this.pedidosService.atualizar(this.editandoPedido.id, data).subscribe({
        next: () => {
          this.carregarPedidos();
          this.fecharModal();
        },
        error: (err) => console.error('Erro ao atualizar pedido:', err),
      });
    } else {
      this.pedidosService.criar(data).subscribe({
        next: () => {
          this.carregarPedidos();
          this.fecharModal();
        },
        error: (err) => console.error('Erro ao criar pedido:', err),
      });
    }
  }

  atualizarStage(): void {
    if (!this.formStage.valid || !this.pedidoParaAtualizarStage) return;

    const stageId = this.formStage.get('stageId')?.value;
    this.pedidosService.atualizarStage(this.pedidoParaAtualizarStage.id, stageId).subscribe({
      next: () => {
        this.carregarPedidos();
        this.fecharModalStage();
      },
      error: (err) => console.error('Erro ao atualizar stage:', err),
    });
  }

  deletar(id: string): void {
    if (!confirm('Tem certeza que deseja deletar este pedido?')) return;

    this.pedidosService.deletar(id).subscribe({
      next: () => this.carregarPedidos(),
      error: (err) => console.error('Erro ao deletar pedido:', err),
    });
  }
}

export { Pedidos };
