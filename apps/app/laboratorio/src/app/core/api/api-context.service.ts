import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

interface UsuarioResponse {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ApiContextService {
  readonly apiBase = 'http://localhost:8080/api';

  private readonly http = inject(HttpClient);
  private currentUserId$?: Observable<number>;

  getCurrentUserId(): Observable<number> {
    if (!this.currentUserId$) {
      this.currentUserId$ = this.http.get<UsuarioResponse[]>(`${this.apiBase}/usuarios`).pipe(
        map(users => {
          const userId = users[0]?.id;
          if (!userId) {
            throw new Error('Nenhum usuario cadastrado foi encontrado para vincular a operacao.');
          }
          return userId;
        }),
        shareReplay(1),
      );
    }

    return this.currentUserId$;
  }
}