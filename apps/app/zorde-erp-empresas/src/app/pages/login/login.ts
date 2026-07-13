import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h1>🔐 Zorde ERP</h1>
        <p>Login para continuar</p>

        <form [formGroup]="form" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="admin@lab.com"
              required
              class="form-control"
            />
            <small *ngIf="form.get('email')?.hasError('required')">Email obrigatório</small>
          </div>

          <div class="form-group">
            <label for="senha">Senha</label>
            <input
              id="senha"
              type="password"
              formControlName="senha"
              placeholder="admin123"
              required
              class="form-control"
            />
            <small *ngIf="form.get('senha')?.hasError('required')">Senha obrigatória</small>
          </div>

          <button type="submit" [disabled]="!form.valid || loading" class="btn-primary">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <div class="demo-credentials">
          <p><strong>Demo:</strong> admin@lab.com / admin123</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
          Cantarell, sans-serif;
      }

      .login-box {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 2rem;
      }

      p {
        text-align: center;
        color: #666;
        margin-bottom: 1.5rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
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
        transition: border-color 0.3s;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      small {
        display: block;
        color: #e74c3c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .btn-primary {
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .error-message {
        color: #e74c3c;
        text-align: center;
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fde8e8;
        border-radius: 4px;
      }

      .demo-credentials {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #eee;
        font-size: 0.875rem;
        color: #666;
      }

      .demo-credentials p {
        margin: 0;
        text-align: center;
      }
    `,
  ],
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onLogin(): void {
    if (!this.form.valid) return;

    this.loading = true;
    this.error = null;

    const { email, senha } = this.form.value;

    this.authService.login(email, senha).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao fazer login. Verifique suas credenciais.';
        console.error('Login error:', err);
      },
    });
  }
}

export { Login };
