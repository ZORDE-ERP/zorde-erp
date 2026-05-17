import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiMessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface ApiValidationErrorResponse {
  errors: Record<string, string>;
}

export interface SolicitarCadastroPayload {
  email: string;
}

export interface VerificarEmailPayload {
  email: string;
  codigo: string;
}

export interface ReenviarCodigoPayload {
  email: string;
}

export interface CadastrarUsuarioPayload {
  email: string;
  senha: string;
  nome: string;
  documento: string;
  contato: string;
}

export interface UsuarioResponse {
  id: number;
  email: string;
  nome: string;
  documento: string;
  contato: string;
  ultimoAcesso: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8080/api';

  solicitarCadastro(payload: SolicitarCadastroPayload): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiBase}/auth/solicitar-cadastro`, payload);
  }

  verificarEmail(payload: VerificarEmailPayload): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiBase}/auth/verificar-email`, payload);
  }

  reenviarCodigo(payload: ReenviarCodigoPayload): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/auth/reenviar-codigo`, payload);
  }

  cadastrarUsuario(payload: CadastrarUsuarioPayload): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiBase}/usuarios`, payload);
  }

  // --- Authenticação JWT ---

  login(payload: LoginPayload): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiBase}/auth/login`, payload, {
      withCredentials: true // Importante para enviar/receber cookies
    });
  }

  refresh(refreshToken: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiBase}/auth/refresh`, { refresh_token: refreshToken }, {
      withCredentials: true
    });
  }

  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/auth/logout`, { refresh_token: refreshToken }, {
      withCredentials: true
    });
  }

  // --- Gerenciamento de Tokens ---

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getUserData(): any | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }
}
