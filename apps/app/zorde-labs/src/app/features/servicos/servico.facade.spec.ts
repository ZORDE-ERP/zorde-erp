import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ServicoFacade } from './servico.facade';

describe('ServicoFacade', () => {
	let facade: ServicoFacade;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		facade = TestBed.inject(ServicoFacade);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should list servicos with page, limit and search', () => {
		facade.list(1, 10, 'lente').subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}servico?page=1&limit=10&search=lente`);
		expect(req.request.method).toBe('GET');
		req.flush({ items: [], total: 0 });
	});

	it('should list servicos without search', () => {
		facade.list(2, 5).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}servico?page=2&limit=5`);
		expect(req.request.method).toBe('GET');
		req.flush({ items: [], total: 0 });
	});

	it('should get servico by id', () => {
		facade.getById(7).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}servico/7`);
		expect(req.request.method).toBe('GET');
		req.flush({});
	});

	it('should create servico', () => {
		const payload = { nome: 'Montagem Simples', descricao: 'Descrição' };

		facade.create(payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}servico`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should update servico', () => {
		const payload = { nome: 'Montagem Atualizada' };

		facade.update(3, payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}servico/3`);
		expect(req.request.method).toBe('PUT');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should delete servico', () => {
		facade.delete(3).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}servico/3`);
		expect(req.request.method).toBe('DELETE');
		req.flush(null);
	});
});
