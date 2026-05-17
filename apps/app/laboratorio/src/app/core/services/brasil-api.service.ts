import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface CepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

export interface CnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  email: string;
  ddd_telefone_1: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}

@Injectable({ providedIn: 'root' })
export class BrasilApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://brasilapi.com.br/api';

  lookupCep(cep: string): Observable<CepResponse | null> {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return of(null);
    return this.http
      .get<CepResponse>(`${this.baseUrl}/cep/v2/${digits}`)
      .pipe(catchError(() => of(null)));
  }

  lookupCnpj(cnpj: string): Observable<CnpjResponse | null> {
    const digits = cnpj.replace(/\D/g, '');
    console.log(cnpj, 'cnpj')
    if (digits.length !== 14) return of(null);
    return this.http
      .get<CnpjResponse>(`${this.baseUrl}/cnpj/v1/${digits}`)
      .pipe(catchError(() => of(null)));
  }

  /** Validates a CPF using the official algorithm (no external call — LGPD restriction). */
  validateCpf(cpf: string): boolean {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

    const calcDigit = (slice: string) => {
      const sum = slice
        .split('')
        .reduce((acc, d, i) => acc + Number(d) * (slice.length + 1 - i), 0);
      const rem = (sum * 10) % 11;
      return rem === 10 || rem === 11 ? 0 : rem;
    };

    return (
      calcDigit(digits.slice(0, 9)) === Number(digits[9]) &&
      calcDigit(digits.slice(0, 10)) === Number(digits[10])
    );
  }

  /** Validates a CNPJ locally using the official algorithm. */
  validateCnpj(cnpj: string): boolean {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

    const calcDigit = (slice: string, weights: number[]) => {
      const sum = slice
        .split('')
        .reduce((acc, d, i) => acc + Number(d) * weights[i], 0);
      const rem = sum % 11;
      return rem < 2 ? 0 : 11 - rem;
    };

    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    return (
      calcDigit(digits.slice(0, 12), w1) === Number(digits[12]) &&
      calcDigit(digits.slice(0, 13), w2) === Number(digits[13])
    );
  }
}
