import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProdutosService, Produto, PaginatedResponse, ProdutosFilters } from '../../services/produtos.service';
import { AuthService } from '../../services/auth.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="produtos-page">
      <div class="header">
        <h1>📦 Produtos</h1>
        <button (click)="abrirModalNovoProduto()" class="btn-primary" *ngIf="podeCriar">
          ➕ Novo Produto
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <h3>🔍 Filtros</h3>
        <form [formGroup]="formFiltros" (ngSubmit)="aplicarFiltros()" class="filters-form">
          <div class="filter-group">
            <label>Descrição</label>
            <input type="text" formControlName="descricao" placeholder="Buscar por descrição" class="form-control" />
          </div>

          <div class="filter-group">
            <label>Preço Máximo</label>
            <input type="number" formControlName="preco" step="0.01" class="form-control" />
          </div>

          <button type="submit" class="btn-filter">Filtrar</button>
          <button type="button" (click)="limparFiltros()" class="btn-secondary">Limpar</button>
        </form>
      </div>

      <div *ngIf="loading" class="loading">Carregando produtos...</div>

      <div *ngIf="!loading && produtos.length > 0" class="produtos-list">
        <div *ngFor="let produto of produtos" class="produto-card">
          <div class="produto-header">
            <h3>{{ produto.descricao }}</h3>
            <div class="actions">
              <button (click)="abrirModalEditar(produto)" class="btn-small">✏️</button>
              <button (click)="deletar(produto.id)" class="btn-small danger">🗑️</button>
            </div>
          </div>
          <div class="produto-body">
            <p><strong>Preço:</strong> R$ {{ produto.preco }}</p>
            <p><strong>ID:</strong> {{ produto.id.substring(0, 8) }}</p>
            <p><strong>Criado:</strong> {{ produto.createdAt | date: 'short' }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && produtos.length === 0" class="empty-state">
        <p>Nenhum produto encontrado.</p>
      </div>

      <!-- Paginação -->
      <app-pagination
        *ngIf="total > 0"
        [total]="total"
        [skip]="skip"
        [take]="take"
        (pageChange)="onPageChange($event)"
      ></app-pagination>

      <!-- Modal Novo/Editar Produto -->
      <div *ngIf="mostrarModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editandoProduto ? 'Editar Produto' : 'Novo Produto' }}</h2>
            <button (click)="fecharModal()" class="btn-close">✕</button>
          </div>
          <form [formGroup]="formProduto" (ngSubmit)="salvarProduto()">
            <div class="form-group">
              <label>Descrição</label>
              <input type="text" formControlName="descricao" class="form-control" required />
            </div>

            <div class="form-group">
              <label>Preço</label>
              <input type="number" formControlName="preco" step="0.01" class="form-control" required />
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="!formProduto.valid" class="btn-primary">
                Salvar
              </button>
              <button type="button" (click)="fecharModal()" class="btn-secondary">
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
      .produtos-page {
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

      .produtos-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .produto-card {
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .produto-card:hover {
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .produto-header {
        background: #f5f5f5;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .produto-header h3 {
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

      .produto-body {
        padding: 1rem;
      }

      .produto-body p {
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
export class Produtos implements OnInit {
  private produtosService = inject(ProdutosService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  produtos: Produto[] = [];
  loading = false;
  total = 0;
  skip = 0;
  take = 10;

  mostrarModal = false;
  editandoProduto: Produto | null = null;

  formProduto: FormGroup;
  formFiltros: FormGroup;

  podeCriar = false;

  constructor() {
    this.formProduto = this.fb.group({
      descricao: [''],
      preco: [''],
    });

    this.formFiltros = this.fb.group({
      descricao: [''],
      preco: [''],
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.podeCriar = user?.permissions.some(p => p.resource === 'produtos' && p.action === 'create') ?? false;

    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.loading = true;
    const filters: ProdutosFilters = {
      skip: this.skip,
      take: this.take,
    };

    const descricao = this.formFiltros.get('descricao')?.value;
    const preco = this.formFiltros.get('preco')?.value;

    if (descricao) filters.descricao = descricao;
    if (preco) filters.preco = parseFloat(preco);

    this.produtosService.listar(filters).subscribe({
      next: (response: PaginatedResponse<Produto>) => {
        this.produtos = response.data;
        this.total = response.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.loading = false;
      },
    });
  }

  aplicarFiltros(): void {
    this.skip = 0;
    this.carregarProdutos();
  }

  limparFiltros(): void {
    this.formFiltros.reset();
    this.skip = 0;
    this.carregarProdutos();
  }

  onPageChange(event: { skip: number; take: number }): void {
    this.skip = event.skip;
    this.take = event.take;
    this.carregarProdutos();
  }

  abrirModalNovoProduto(): void {
    this.editandoProduto = null;
    this.formProduto.reset();
    this.mostrarModal = true;
  }

  abrirModalEditar(produto: Produto): void {
    this.editandoProduto = produto;
    this.formProduto.patchValue({
      descricao: produto.descricao,
      preco: produto.preco,
    });
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.editandoProduto = null;
    this.formProduto.reset();
  }

  salvarProduto(): void {
    if (!this.formProduto.valid) return;

    const data = this.formProduto.value;

    if (this.editandoProduto) {
      this.produtosService.atualizar(this.editandoProduto.id, data).subscribe({
        next: () => {
          this.carregarProdutos();
          this.fecharModal();
        },
        error: (err) => console.error('Erro ao atualizar produto:', err),
      });
    } else {
      this.produtosService.criar(data).subscribe({
        next: () => {
          this.carregarProdutos();
          this.fecharModal();
        },
        error: (err) => console.error('Erro ao criar produto:', err),
      });
    }
  }

  deletar(id: string): void {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    this.produtosService.deletar(id).subscribe({
      next: () => this.carregarProdutos(),
      error: (err) => console.error('Erro ao deletar produto:', err),
    });
  }
}

