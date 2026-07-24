import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CnpjLookupService } from './cnpj-lookup.service';

describe('CnpjLookupService', () => {
	let service: CnpjLookupService;
	let httpMock: HttpTestingController;

	const cnpjFormatado = '11.222.333/0001-81';
	const cnpjDigits = '11222333000181';
	const brasilApiUrl = `https://brasilapi.com.br/api/cnpj/v1/${cnpjDigits}`;
	const openCnpjUrl = `https://api.opencnpj.org/${cnpjDigits}`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [CnpjLookupService, provideHttpClient(), provideHttpClientTesting()],
		});

		service = TestBed.inject(CnpjLookupService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should return normalized data from BrasilAPI on primary success without calling fallback', () => {
		let result: unknown;

		service.buscar(cnpjFormatado).subscribe((value) => (result = value));

		const req = httpMock.expectOne(brasilApiUrl);
		expect(req.request.method).toBe('GET');

		req.flush({
			razao_social: 'Empresa Exemplo LTDA',
			nome_fantasia: 'Exemplo',
			email: 'contato@exemplo.com',
			ddd_telefone_1: '11999998888',
			cep: '01001000',
			uf: 'SP',
			municipio: 'São Paulo',
			logradouro: 'Praça da Sé',
			bairro: 'Sé',
			numero: '1',
			complemento: 'Lado ímpar',
		});

		httpMock.expectNone(openCnpjUrl);

		expect(result).toEqual({
			razaoSocial: 'Empresa Exemplo LTDA',
			nomeFantasia: 'Exemplo',
			email: 'contato@exemplo.com',
			telefone: '11999998888',
			cep: '01001000',
			uf: 'SP',
			cidade: 'São Paulo',
			logradouro: 'Praça da Sé',
			bairro: 'Sé',
			numero: '1',
			complemento: 'Lado ímpar',
		});
	});

	it('should fall back to OpenCNPJ when BrasilAPI fails', () => {
		let result: unknown;

		service.buscar(cnpjFormatado).subscribe((value) => (result = value));

		httpMock.expectOne(brasilApiUrl).flush('not found', { status: 404, statusText: 'Not Found' });

		const fallbackReq = httpMock.expectOne(openCnpjUrl);
		fallbackReq.flush({
			razao_social: 'Empresa Fallback LTDA',
			nome_fantasia: 'Fallback',
			email: 'fallback@exemplo.com',
			telefone: '11988887777',
			cep: '02002000',
			uf: 'SP',
			municipio: 'São Paulo',
			logradouro: 'Rua Fallback',
			bairro: 'Centro',
			numero: '2',
			complemento: '',
		});

		expect(result).toEqual({
			razaoSocial: 'Empresa Fallback LTDA',
			nomeFantasia: 'Fallback',
			email: 'fallback@exemplo.com',
			telefone: '11988887777',
			cep: '02002000',
			uf: 'SP',
			cidade: 'São Paulo',
			logradouro: 'Rua Fallback',
			bairro: 'Centro',
			numero: '2',
			complemento: '',
		});
	});

	it('should return null when both BrasilAPI and OpenCNPJ fail', () => {
		let result: unknown = 'not-set';

		service.buscar(cnpjFormatado).subscribe((value) => (result = value));

		httpMock.expectOne(brasilApiUrl).flush('error', { status: 500, statusText: 'Server Error' });
		httpMock.expectOne(openCnpjUrl).flush('error', { status: 500, statusText: 'Server Error' });

		expect(result).toBeNull();
	});

	it('should return null without making HTTP calls when CNPJ length is invalid', () => {
		let result: unknown = 'not-set';

		service.buscar('123').subscribe((value) => (result = value));

		expect(result).toBeNull();
		httpMock.expectNone(brasilApiUrl);
		httpMock.verify();
	});
});
