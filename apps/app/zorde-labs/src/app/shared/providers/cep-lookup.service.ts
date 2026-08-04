import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { SKIP_HTTP_ERROR_TOAST } from '../../interceptors/response.interceptor';

export interface EnderecoLookup {
	uf: string;
	cidade: string;
	logradouro: string;
	bairro: string;
	ibge: string;
	cep: string;
}

interface BrasilApiCepResponse {
	cep?: string;
	state?: string;
	city?: string;
	street?: string;
	neighborhood?: string;
}

interface ViaCepResponse {
	erro?: boolean;
	cep?: string;
	uf?: string;
	localidade?: string;
	logradouro?: string;
	bairro?: string;
	ibge?: string;
}

const BRASIL_API_URL = 'https://brasilapi.com.br/api/cep/v2';
const VIA_CEP_URL = 'https://viacep.com.br/ws';

@Service()
export class CepLookupService {
	private readonly http = inject(HttpClient);

	public buscar(cep: string): Observable<EnderecoLookup | null> {
		const digits = cep.replace(/\D/g, '');

		if (digits.length !== 8) {
			return of(null);
		}

		return this.http.get<BrasilApiCepResponse>(`${BRASIL_API_URL}/${digits}`, this.requestOptions()).pipe(
			map((response) => normalizeBrasilApi(response)),
			catchError(() =>
				this.http.get<ViaCepResponse>(`${VIA_CEP_URL}/${digits}/json/`, this.requestOptions()).pipe(
					map((response) => normalizeViaCep(response)),
					catchError(() => of(null)),
				),
			),
		);
	}

	private requestOptions(): { context: HttpContext } {
		return { context: new HttpContext().set(SKIP_HTTP_ERROR_TOAST, true) };
	}
}

function normalizeBrasilApi(response: BrasilApiCepResponse): EnderecoLookup {
	return {
		uf: response.state ?? '',
		cidade: response.city ?? '',
		logradouro: response.street ?? '',
		bairro: response.neighborhood ?? '',
		ibge: '',
		cep: response.cep ?? '',
	};
}

function normalizeViaCep(response: ViaCepResponse): EnderecoLookup {
	if (response.erro) {
		throw new Error('CEP não encontrado');
	}

	return {
		uf: response.uf ?? '',
		cidade: response.localidade ?? '',
		logradouro: response.logradouro ?? '',
		bairro: response.bairro ?? '',
		ibge: response.ibge ?? '',
		cep: response.cep ?? '',
	};
}
