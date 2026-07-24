import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CepLookupService } from './cep-lookup.service';

describe('CepLookupService', () => {
	let service: CepLookupService;
	let httpMock: HttpTestingController;

	const cepFormatado = '01001-000';
	const cepDigits = '01001000';
	const brasilApiUrl = `https://brasilapi.com.br/api/cep/v2/${cepDigits}`;
	const viaCepUrl = `https://viacep.com.br/ws/${cepDigits}/json/`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [CepLookupService, provideHttpClient(), provideHttpClientTesting()],
		});

		service = TestBed.inject(CepLookupService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should return normalized data from BrasilAPI on primary success without calling fallback', () => {
		let result: unknown;

		service.buscar(cepFormatado).subscribe((value) => (result = value));

		const req = httpMock.expectOne(brasilApiUrl);
		expect(req.request.method).toBe('GET');

		req.flush({
			cep: '01001-000',
			state: 'SP',
			city: 'São Paulo',
			street: 'Praça da Sé',
			neighborhood: 'Sé',
		});

		httpMock.expectNone(viaCepUrl);

		expect(result).toEqual({
			uf: 'SP',
			cidade: 'São Paulo',
			logradouro: 'Praça da Sé',
			bairro: 'Sé',
			ibge: '',
			cep: '01001-000',
		});
	});

	it('should fall back to ViaCEP when BrasilAPI fails', () => {
		let result: unknown;

		service.buscar(cepFormatado).subscribe((value) => (result = value));

		httpMock.expectOne(brasilApiUrl).flush('not found', { status: 404, statusText: 'Not Found' });

		const fallbackReq = httpMock.expectOne(viaCepUrl);
		fallbackReq.flush({
			cep: '01001-000',
			uf: 'SP',
			localidade: 'São Paulo',
			logradouro: 'Praça da Sé',
			bairro: 'Sé',
			ibge: '3550308',
		});

		expect(result).toEqual({
			uf: 'SP',
			cidade: 'São Paulo',
			logradouro: 'Praça da Sé',
			bairro: 'Sé',
			ibge: '3550308',
			cep: '01001-000',
		});
	});

	it('should return null when BrasilAPI fails and ViaCEP reports the CEP as not found', () => {
		let result: unknown = 'not-set';

		service.buscar(cepFormatado).subscribe((value) => (result = value));

		httpMock.expectOne(brasilApiUrl).flush('not found', { status: 404, statusText: 'Not Found' });
		httpMock.expectOne(viaCepUrl).flush({ erro: true });

		expect(result).toBeNull();
	});

	it('should return null when both BrasilAPI and ViaCEP fail', () => {
		let result: unknown = 'not-set';

		service.buscar(cepFormatado).subscribe((value) => (result = value));

		httpMock.expectOne(brasilApiUrl).flush('error', { status: 500, statusText: 'Server Error' });
		httpMock.expectOne(viaCepUrl).flush('error', { status: 500, statusText: 'Server Error' });

		expect(result).toBeNull();
	});

	it('should return null without making HTTP calls when CEP length is invalid', () => {
		let result: unknown = 'not-set';

		service.buscar('123').subscribe((value) => (result = value));

		expect(result).toBeNull();
		httpMock.expectNone(brasilApiUrl);
		httpMock.verify();
	});
});
