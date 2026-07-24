import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { FornecedorFacade } from './fornecedor.facade';

describe('FornecedorFacade', () => {
	let facade: FornecedorFacade;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		facade = TestBed.inject(FornecedorFacade);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should create fornecedor', () => {
		const payload = {
			nome: 'Fornecedor Exemplo',
			email: 'contato@fornecedor.com',
			tipoPessoa: 'JURIDICA' as const,
			documento: '11222333000181',
		};

		facade.create(payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}fornecedores`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should list fornecedores', () => {
		facade.list().subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}fornecedores`);
		expect(req.request.method).toBe('GET');
		req.flush([]);
	});

	it('should get fornecedor by id', () => {
		facade.getById(9).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}fornecedores/9`);
		expect(req.request.method).toBe('GET');
		req.flush({});
	});

	it('should update fornecedor', () => {
		const payload = { id: 9, nome: 'Fornecedor Atualizado' };

		facade.update(payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}fornecedores`);
		expect(req.request.method).toBe('PUT');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should delete fornecedor', () => {
		facade.delete(9).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}fornecedores/9`);
		expect(req.request.method).toBe('DELETE');
		req.flush(null);
	});
});
