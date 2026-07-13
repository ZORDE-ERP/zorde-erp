import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Array<{ permissionId: string; permission: any }>;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  isTerminal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:3001/api/v1/admin';

  constructor(private http: HttpClient) {}

  // Roles
  listarRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  obterRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }

  criarRole(data: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, data);
  }

  adicionarPermissaoAoRole(roleId: string, permissionId: string): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`, {});
  }

  removerPermissaoDoRole(roleId: string, permissionId: string): Observable<Role> {
    return this.http.delete<Role>(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`);
  }

  // Pipeline Stages
  listarStages(): Observable<PipelineStage[]> {
    return this.http.get<PipelineStage[]>(`${this.apiUrl}/pipeline-stages`);
  }

  obterStage(id: string): Observable<PipelineStage> {
    return this.http.get<PipelineStage>(`${this.apiUrl}/pipeline-stages/${id}`);
  }

  criarStage(data: Partial<PipelineStage>): Observable<PipelineStage> {
    return this.http.post<PipelineStage>(`${this.apiUrl}/pipeline-stages`, data);
  }

  atualizarStage(id: string, data: Partial<PipelineStage>): Observable<PipelineStage> {
    return this.http.patch<PipelineStage>(`${this.apiUrl}/pipeline-stages/${id}`, data);
  }

  deletarStage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pipeline-stages/${id}`);
  }
}
