import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidosService, Pedido } from '../../services/pedidos.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="header">
        <h1>📊 Dashboard</h1>
        <div class="user-info">
          <span>Bem-vindo, {{ currentUser?.nome }}!</span>
          <button (click)="logout()" class="btn-logout">Sair</button>
        </div>
      </div>

      <div class="stats">
        <div class="stat-card">
          <h3>Total de Pedidos</h3>
          <p class="stat-value">{{ pedidos.length }}</p>
        </div>
        <div class="stat-card">
          <h3>Em Produção</h3>
          <p class="stat-value">{{ pedidosEmProducao }}</p>
        </div>
        <div class="stat-card">
          <h3>Prontos</h3>
          <p class="stat-value">{{ pedidosProntos }}</p>
        </div>
      </div>

      <div class="recent-orders">
        <div class="section-header">
          <h2>Pedidos Recentes</h2>
          <a routerLink="/pedidos" class="btn-secondary">Ver Todos →</a>
        </div>

        <div *ngIf="loading" class="loading">Carregando...</div>

        <table *ngIf="!loading && pedidos.length > 0" class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pedido of pedidos.slice(0, 5)">
              <td>{{ pedido.id.substring(0, 8) }}...</td>
              <td>{{ pedido.createdAt | date: 'short' }}</td>
              <td>
                <span class="badge">
                  {{ pedido.currentStageId | slice: 0: 10 }}
                </span>
              </td>
              <td>
                <a [routerLink]="['/pedidos', pedido.id]" class="btn-small">Ver</a>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && pedidos.length === 0" class="empty-state">
          <p>Nenhum pedido encontrado. <a routerLink="/pedidos">Criar novo pedido →</a></p>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Ações Rápidas</h3>
        <div class="actions-grid">
          <a routerLink="/pedidos" class="action-card">
            <span class="icon">📋</span>
            <span class="label">Pedidos</span>
          </a>
          <a routerLink="/produtos" class="action-card">
            <span class="icon">📦</span>
            <span class="label">Produtos</span>
          </a>
          <a routerLink="/estoque" class="action-card">
            <span class="icon">📊</span>
            <span class="label">Estoque</span>
          </a>
          <a routerLink="/fornecedores" class="action-card">
            <span class="icon">🏢</span>
            <span class="label">Fornecedores</span>
          </a>
          <a *ngIf="isAdmin" routerLink="/admin" class="action-card admin">
            <span class="icon">⚙️</span>
            <span class="label">Admin</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
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

      .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .btn-logout {
        padding: 0.5rem 1rem;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .btn-logout:hover {
        background: #c0392b;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #667eea;
      }

      .stat-card h3 {
        margin: 0 0 0.5rem 0;
        color: #666;
        font-size: 0.875rem;
        text-transform: uppercase;
      }

      .stat-value {
        margin: 0;
        font-size: 2rem;
        color: #333;
        font-weight: 600;
      }

      .recent-orders {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .section-header h2 {
        margin: 0;
        color: #333;
      }

      .btn-secondary {
        padding: 0.5rem 1rem;
        background: #f0f0f0;
        color: #333;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
      }

      .btn-secondary:hover {
        background: #e0e0e0;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th {
        background: #f5f5f5;
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: #333;
        border-bottom: 1px solid #ddd;
      }

      .table td {
        padding: 1rem;
        border-bottom: 1px solid #eee;
      }

      .badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #e8f4f8;
        color: #0288d1;
        border-radius: 20px;
        font-size: 0.875rem;
      }

      .btn-small {
        padding: 0.25rem 0.75rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        font-size: 0.875rem;
      }

      .btn-small:hover {
        background: #5568d3;
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #999;
      }

      .loading {
        text-align: center;
        padding: 2rem;
        color: #666;
      }

      .quick-actions {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .quick-actions h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }

      .action-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: #f9f9f9;
        border-radius: 8px;
        text-decoration: none;
        color: #333;
        border: 2px solid transparent;
        transition: all 0.3s;
      }

      .action-card:hover {
        background: white;
        border-color: #667eea;
        transform: translateY(-2px);
      }

      .action-card.admin {
        border-color: #f39c12;
        background: #fffbf0;
      }

      .action-card .icon {
        font-size: 1.5rem;
      }

      .action-card .label {
        font-size: 0.875rem;
        font-weight: 500;
      }
    `,
  ],
})
export class Dashboard implements OnInit {
  private pedidosService = inject(PedidosService);
  private authService = inject(AuthService);

  pedidos: Pedido[] = [];
  currentUser: User | null = null;
  loading = false;
  isAdmin = false;

  get pedidosEmProducao(): number {
    return this.pedidos.filter(p => !p.currentStageId.includes('PRONTO') && !p.currentStageId.includes('ENTREGUE')).length;
  }

  get pedidosProntos(): number {
    return this.pedidos.filter(p => p.currentStageId.includes('PRONTO') || p.currentStageId.includes('ENTREGUE')).length;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.permissions.some(p => p.resource === 'config_admin') ?? false;
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.loading = true;
    this.pedidosService.listar().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos:', err);
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

export { Dashboard };
