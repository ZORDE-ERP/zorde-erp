import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { TabelaMontagemFacade } from './tabela-montagem.facade';

describe('TabelaMontagemFacade', () => {
	let facade: TabelaMontagemFacade;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		facade = TestBed.inject(TabelaMontagemFacade);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should list tabela de montagem with page, limit and search', () => {
		facade.list({ page: 1, limit: 10, search: 'lente' }).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}tabela-montagem?page=1&limit=10&search=lente`);
		expect(req.request.method).toBe('GET');
		req.flush({ items: [], total: 0 });
	});

	it('should list tabela de montagem filtered by clienteId', () => {
		facade.list({ page: 1, limit: 500, clienteId: 7 }).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}tabela-montagem?page=1&limit=500&clienteId=7`);
		expect(req.request.method).toBe('GET');
		req.flush({ items: [], total: 0 });
	});

	it('should get tabela de montagem by id', () => {
		facade.getById(4).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}tabela-montagem/4`);
		expect(req.request.method).toBe('GET');
		req.flush({});
	});

	it('should create tabela de montagem', () => {
		const payload = { clienteId: 1, servicoId: 2, valor: 100 };

		facade.create(payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}tabela-montagem`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should update tabela de montagem', () => {
		const payload = { valor: 150 };

		facade.update(4, payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}tabela-montagem/4`);
		expect(req.request.method).toBe('PUT');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should delete tabela de montagem', () => {
		facade.delete(4).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}tabela-montagem/4`);
		expect(req.request.method).toBe('DELETE');
		req.flush(null);
	});
});
