import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, Role, PipelineStage } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-page">
      <h1>⚙️ Admin - Configurações</h1>

      <div class="admin-tabs">
        <button [class.active]="tabAtual === 'stages'" (click)="tabAtual = 'stages'" class="tab-btn">
          📊 Pipeline Stages
        </button>
        <button [class.active]="tabAtual === 'roles'" (click)="tabAtual = 'roles'" class="tab-btn">
          👥 Roles
        </button>
      </div>

      <!-- Pipeline Stages Tab -->
      <div *ngIf="tabAtual === 'stages'" class="tab-content">
        <div class="section-header">
          <h2>Etapas do Pipeline</h2>
          <button (click)="abrirModalNovoStage()" class="btn-primary">➕ Nova Etapa</button>
        </div>

        <div *ngIf="loadingStages" class="loading">Carregando...</div>

        <table *ngIf="!loadingStages && stages.length > 0" class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ordem</th>
              <th>Terminal</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let stage of stages">
              <td>{{ stage.name }}</td>
              <td>{{ stage.order }}</td>
              <td><span class="badge" [class.terminal]="stage.isTerminal">{{ stage.isTerminal ? 'Sim' : 'Não' }}</span></td>
              <td>
                <button (click)="abrirModalEditarStage(stage)" class="btn-small">✏️</button>
                <button (click)="deletarStage(stage.id)" class="btn-small danger">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Roles Tab -->
      <div *ngIf="tabAtual === 'roles'" class="tab-content">
        <div class="section-header">
          <h2>Roles</h2>
          <button (click)="abrirModalNovoRole()" class="btn-primary">➕ Novo Role</button>
        </div>

        <div *ngIf="loadingRoles" class="loading">Carregando...</div>

        <div *ngIf="!loadingRoles && roles.length > 0" class="roles-grid">
          <div *ngFor="let role of roles" class="role-card">
            <h3>{{ role.name }}</h3>
            <p *ngIf="role.description">{{ role.description }}</p>
            <div class="permissions">
              <strong>Permissões: {{ role.permissions.length }}</strong>
              <div class="permission-list">
                <span *ngFor="let perm of role.permissions.slice(0, 3)" class="perm-badge">
                  {{ perm.permission.resource }}:{{ perm.permission.action }}
                </span>
                <span *ngIf="role.permissions.length > 3" class="perm-badge">
                  +{{ role.permissions.length - 3 }} mais
                </span>
              </div>
            </div>
            <div class="role-actions">
              <button (click)="abrirModalEditarRole(role)" class="btn-small">✏️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal: Novo/Editar Stage -->
      <div *ngIf="mostrarModalStage" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editandoStage ? 'Editar Etapa' : 'Nova Etapa' }}</h2>
            <button (click)="fecharModalStage()" class="btn-close">✕</button>
          </div>
          <form [formGroup]="formStage" (ngSubmit)="salvarStage()">
            <div class="form-group">
              <label>Nome</label>
              <input type="text" formControlName="name" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Ordem</label>
              <input type="number" formControlName="order" class="form-control" required />
            </div>
            <div class="form-group checkbox">
              <input type="checkbox" id="terminal" formControlName="isTerminal" />
              <label for="terminal">É etapa terminal (fim do processo)?</label>
            </div>
            <div class="form-actions">
              <button type="submit" [disabled]="!formStage.valid" class="btn-primary">Salvar</button>
              <button type="button" (click)="fecharModalStage()" class="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal: Novo/Editar Role -->
      <div *ngIf="mostrarModalRole" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editandoRole ? 'Editar Role' : 'Novo Role' }}</h2>
            <button (click)="fecharModalRole()" class="btn-close">✕</button>
          </div>
          <form [formGroup]="formRole" (ngSubmit)="salvarRole()">
            <div class="form-group">
              <label>Nome</label>
              <input type="text" formControlName="name" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <textarea formControlName="description" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" [disabled]="!formRole.valid" class="btn-primary">Salvar</button>
              <button type="button" (click)="fecharModalRole()" class="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-page {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 2rem;
        color: #333;
      }

      .admin-tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        border-bottom: 2px solid #f0f0f0;
      }

      .tab-btn {
        padding: 1rem;
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        color: #666;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s;
      }

      .tab-btn.active {
        color: #667eea;
        border-bottom-color: #667eea;
      }

      .tab-content {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .section-header h2 {
        margin: 0;
        color: #333;
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

      .badge.terminal {
        background: #d4edda;
        color: #155724;
      }

      .roles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      .role-card {
        background: #f9f9f9;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }

      .role-card h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      .role-card p {
        margin: 0 0 1rem 0;
        color: #666;
        font-size: 0.875rem;
      }

      .permissions {
        margin-bottom: 1rem;
      }

      .permissions strong {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
        font-size: 0.875rem;
      }

      .permission-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .perm-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: white;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-size: 0.75rem;
        color: #666;
      }

      .role-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-primary,
      .btn-secondary,
      .btn-small {
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      }

      .btn-primary {
        background: #667eea;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #5568d3;
      }

      .btn-secondary {
        background: #f0f0f0;
        color: #333;
      }

      .btn-secondary:hover {
        background: #e0e0e0;
      }

      .btn-small {
        padding: 0.5rem;
        background: #667eea;
        color: white;
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

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        font-family: inherit;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
      }

      .form-group.checkbox {
        display: flex;
        align-items: center;
      }

      .form-group.checkbox input {
        margin-right: 0.5rem;
      }

      .form-group.checkbox label {
        margin: 0;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
      }

      .loading {
        text-align: center;
        padding: 2rem;
        color: #666;
      }
    `,
  ],
})
export class Admin implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  tabAtual: 'stages' | 'roles' = 'stages';
  stages: PipelineStage[] = [];
  roles: Role[] = [];

  loadingStages = false;
  loadingRoles = false;

  mostrarModalStage = false;
  mostrarModalRole = false;

  editandoStage: PipelineStage | null = null;
  editandoRole: Role | null = null;

  formStage: FormGroup;
  formRole: FormGroup;

  constructor() {
    this.formStage = this.fb.group({
      name: ['', Validators.required],
      order: [0, Validators.required],
      isTerminal: [false],
    });

    this.formRole = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.carregarStages();
    this.carregarRoles();
  }

  carregarStages(): void {
    this.loadingStages = true;
    this.adminService.listarStages().subscribe({
      next: (stages) => {
        this.stages = stages.sort((a, b) => a.order - b.order);
        this.loadingStages = false;
      },
      error: (err) => {
        console.error('Erro ao carregar stages:', err);
        this.loadingStages = false;
      },
    });
  }

  carregarRoles(): void {
    this.loadingRoles = true;
    this.adminService.listarRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loadingRoles = false;
      },
      error: (err) => {
        console.error('Erro ao carregar roles:', err);
        this.loadingRoles = false;
      },
    });
  }

  abrirModalNovoStage(): void {
    this.editandoStage = null;
    this.formStage.reset({ order: 0, isTerminal: false });
    this.mostrarModalStage = true;
  }

  abrirModalEditarStage(stage: PipelineStage): void {
    this.editandoStage = stage;
    this.formStage.patchValue(stage);
    this.mostrarModalStage = true;
  }

  abrirModalNovoRole(): void {
    this.editandoRole = null;
    this.formRole.reset();
    this.mostrarModalRole = true;
  }

  abrirModalEditarRole(role: Role): void {
    this.editandoRole = role;
    this.formRole.patchValue(role);
    this.mostrarModalRole = true;
  }

  fecharModalStage(): void {
    this.mostrarModalStage = false;
    this.editandoStage = null;
    this.formStage.reset();
  }

  fecharModalRole(): void {
    this.mostrarModalRole = false;
    this.editandoRole = null;
    this.formRole.reset();
  }

  salvarStage(): void {
    if (!this.formStage.valid) return;

    const data = this.formStage.value;

    if (this.editandoStage) {
      this.adminService.atualizarStage(this.editandoStage.id, data).subscribe({
        next: () => {
          this.carregarStages();
          this.fecharModalStage();
        },
        error: (err) => console.error('Erro ao atualizar stage:', err),
      });
    } else {
      this.adminService.criarStage(data).subscribe({
        next: () => {
          this.carregarStages();
          this.fecharModalStage();
        },
        error: (err) => console.error('Erro ao criar stage:', err),
      });
    }
  }

  salvarRole(): void {
    if (!this.formRole.valid) return;

    const data = this.formRole.value;

    this.adminService.criarRole(data).subscribe({
      next: () => {
        this.carregarRoles();
        this.fecharModalRole();
      },
      error: (err) => console.error('Erro ao criar role:', err),
    });
  }

  deletarStage(id: string): void {
    if (!confirm('Tem certeza?')) return;

    this.adminService.deletarStage(id).subscribe({
      next: () => this.carregarStages(),
      error: (err) => console.error('Erro ao deletar stage:', err),
    });
  }
}

export { Admin };
