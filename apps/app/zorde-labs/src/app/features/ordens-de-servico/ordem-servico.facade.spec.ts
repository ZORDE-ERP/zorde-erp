import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { OrdemServicoFacade } from './ordem-servico.facade';

describe('OrdemServicoFacade', () => {
	let facade: OrdemServicoFacade;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		facade = TestBed.inject(OrdemServicoFacade);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should create ordem de servico', () => {
		const payload = {
			clienteId: 1,
			itens: [{ tabelaMontagemId: 1, quantidade: 2, valorUnitario: 50 }],
		};

		facade.create(payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}ordens-de-servico`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should list ordens de servico with all query params', () => {
		facade
			.list({
				page: 1,
				limit: 10,
				status: 'LANCADA',
				clienteId: 3,
				dataInicio: '2026-01-01',
				dataFim: '2026-01-31',
			})
			.subscribe();

		const req = httpMock.expectOne(
			`${environment.baseUrl}ordens-de-servico?page=1&limit=10&status=LANCADA&clienteId=3&dataInicio=2026-01-01&dataFim=2026-01-31`,
		);
		expect(req.request.method).toBe('GET');
		req.flush({ items: [], total: 0 });
	});

	it('should list ordens de servico without query params', () => {
		facade.list({}).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}ordens-de-servico`);
		expect(req.request.method).toBe('GET');
		req.flush({ items: [], total: 0 });
	});

	it('should get ordem de servico by id', () => {
		facade.getById(8).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}ordens-de-servico/8`);
		expect(req.request.method).toBe('GET');
		req.flush({});
	});

	it('should update ordem de servico', () => {
		const payload = { id: 8, status: 'FATURADA' as const };

		facade.update(payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}ordens-de-servico`);
		expect(req.request.method).toBe('PUT');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should delete ordem de servico', () => {
		facade.delete(8).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}ordens-de-servico/8`);
		expect(req.request.method).toBe('DELETE');
		req.flush(null);
	});
});
