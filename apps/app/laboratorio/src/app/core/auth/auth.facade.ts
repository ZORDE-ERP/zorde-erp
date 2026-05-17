import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { take } from 'rxjs/operators';
import {
  ApiErrorResponse,
  ApiValidationErrorResponse,
  AuthService,
  CadastrarUsuarioPayload,
  ReenviarCodigoPayload,
  SolicitarCadastroPayload,
  VerificarEmailPayload,
} from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly emailVerificado = signal(false);
  readonly cadastroEmail = signal<string | null>(null);

  clearCadastroState(): void {
    this.cadastroEmail.set(null);
    this.emailVerificado.set(false);
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const payload = error.error as ApiErrorResponse | ApiValidationErrorResponse | null;

    if (payload && typeof payload === 'object') {
      if ('error' in payload && typeof payload.error === 'string') {
        return payload.error;
      }

      if ('errors' in payload && payload.errors) {
        const messages = Object.entries(payload.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');

        if (messages) {
          return messages;
        }
      }
    }

    return fallback;
  }

  solicitarCadastro(payload: SolicitarCadastroPayload, onSuccess?: (msg?: string) => void): void {
    this.loading.set(true);
    this.error.set(null);
    this.authService
      .solicitarCadastro(payload)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          onSuccess?.(res.message || 'Código enviado para o seu e-mail!');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(this.getErrorMessage(err, 'Erro ao solicitar cadastro'));
        },
      });
  }

  verificarEmail(payload: VerificarEmailPayload, onSuccess?: (msg?: string) => void): void {
    this.loading.set(true);
    this.error.set(null);
    this.authService
      .verificarEmail(payload)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.emailVerificado.set(true);
          onSuccess?.(res.message || 'E-mail verificado com sucesso!');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(this.getErrorMessage(err, 'Código inválido'));
        },
      });
  }

  reenviarCodigo(payload: ReenviarCodigoPayload, onSuccess?: (msg?: string) => void): void {
    this.loading.set(true);
    this.error.set(null);
    this.authService
      .reenviarCodigo(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loading.set(false);
          onSuccess?.('Código reenviado com sucesso!');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(this.getErrorMessage(err, 'Erro ao reenviar código'));
        },
      });
  }

  cadastrarUsuario(payload: CadastrarUsuarioPayload, onSuccess?: (msg?: string) => void): void {
    this.loading.set(true);
    this.error.set(null);
    this.authService
      .cadastrarUsuario(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loading.set(false);
          onSuccess?.('Usuário cadastrado com sucesso!');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(this.getErrorMessage(err, 'Erro ao cadastrar usuário'));
        },
      });
  }
}
