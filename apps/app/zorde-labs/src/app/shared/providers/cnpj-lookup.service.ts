import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { SKIP_HTTP_ERROR_TOAST } from '../../interceptors/response.interceptor';

export interface EmpresaLookup {
	razaoSocial: string;
	nomeFantasia: string;
	email: string;
	telefone: string;
	cep: string;
	uf: string;
	cidade: string;
	logradouro: string;
	bairro: string;
	numero: string;
	complemento: string;
}

interface BrasilApiCnpjResponse {
	razao_social?: string;
	nome_fantasia?: string;
	email?: string;
	ddd_telefone_1?: string;
	cep?: string;
	uf?: string;
	municipio?: string;
	logradouro?: string;
	bairro?: string;
	numero?: string;
	complemento?: string;
}

interface OpenCnpjResponse {
	razao_social?: string;
	nome_fantasia?: string;
	email?: string;
	telefone?: string;
	cep?: string;
	uf?: string;
	municipio?: string;
	logradouro?: string;
	bairro?: string;
	numero?: string;
	complemento?: string;
}

const BRASIL_API_URL = 'https://brasilapi.com.br/api/cnpj/v1';
const OPEN_CNPJ_URL = 'https://api.opencnpj.org';

@Service()
export class CnpjLookupService {
	private readonly http = inject(HttpClient);

	public buscar(cnpj: string): Observable<EmpresaLookup | null> {
		const digits = cnpj.replace(/\D/g, '');

		if (digits.length !== 14) {
			return of(null);
		}

		return this.http.get<BrasilApiCnpjResponse>(`${BRASIL_API_URL}/${digits}`, this.requestOptions()).pipe(
			map((response) => normalizeBrasilApi(response)),
			catchError(() =>
				this.http.get<OpenCnpjResponse>(`${OPEN_CNPJ_URL}/${digits}`, this.requestOptions()).pipe(
					map((response) => normalizeOpenCnpj(response)),
					catchError(() => of(null)),
				),
			),
		);
	}

	private requestOptions(): { context: HttpContext } {
		return { context: new HttpContext().set(SKIP_HTTP_ERROR_TOAST, true) };
	}
}

function normalizeBrasilApi(response: BrasilApiCnpjResponse): EmpresaLookup {
	return {
		razaoSocial: response.razao_social ?? '',
		nomeFantasia: response.nome_fantasia ?? '',
		email: response.email ?? '',
		telefone: response.ddd_telefone_1 ?? '',
		cep: response.cep ?? '',
		uf: response.uf ?? '',
		cidade: response.municipio ?? '',
		logradouro: response.logradouro ?? '',
		bairro: response.bairro ?? '',
		numero: response.numero ?? '',
		complemento: response.complemento ?? '',
	};
}

function normalizeOpenCnpj(response: OpenCnpjResponse): EmpresaLookup {
	return {
		razaoSocial: response.razao_social ?? '',
		nomeFantasia: response.nome_fantasia ?? '',
		email: response.email ?? '',
		telefone: response.telefone ?? '',
		cep: response.cep ?? '',
		uf: response.uf ?? '',
		cidade: response.municipio ?? '',
		logradouro: response.logradouro ?? '',
		bairro: response.bairro ?? '',
		numero: response.numero ?? '',
		complemento: response.complemento ?? '',
	};
}
