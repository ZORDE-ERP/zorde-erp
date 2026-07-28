import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ClienteFacade } from './cliente.facade';

describe('ClienteFacade', () => {
	let facade: ClienteFacade;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		facade = TestBed.inject(ClienteFacade);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should create cliente', () => {
		const payload = { nome: 'João Silva', email: 'joao@teste.com', tipoPessoa: 'FISICA' as const, documento: '12345678901' };

		facade.create(payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should list clientes', () => {
		facade.list({ page: 1, limit: 10, search: 'joao' }).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes?page=1&limit=10&search=joao`);
		expect(req.request.method).toBe('GET');
		req.flush({ items: [], total: 0, counts: { total: 0, ativos: 0, inativos: 0 } });
	});

	it('should get cliente by id', () => {
		facade.getById(5).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes/5`);
		expect(req.request.method).toBe('GET');
		req.flush({});
	});

	it('should update cliente', () => {
		const payload = { id: 5, nome: 'João Atualizado' };

		facade.update(payload).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes`);
		expect(req.request.method).toBe('PUT');
		expect(req.request.body).toEqual(payload);
		req.flush({});
	});

	it('should delete cliente', () => {
		facade.delete(5).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes/5`);
		expect(req.request.method).toBe('DELETE');
		req.flush(null);
	});

	it('should gerar qrcode', () => {
		facade.gerarQrCode(5).subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes/5/qrcode`);
		expect(req.request.method).toBe('POST');
		req.flush({});
	});

	it('should imprimir folhas os as blob', () => {
		let result: HttpResponse<Blob> | undefined;

		facade.imprimirFolhasOs(5, 3).subscribe((response) => (result = response));

		const req = httpMock.expectOne(`${environment.baseUrl}clientes/5/impressao-os`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual({ quantidade: 3 });
		expect(req.request.responseType).toBe('blob');

		const blob = new Blob(['pdf-content'], { type: 'application/pdf' });
		req.flush(blob);

		expect(result?.body).toBe(blob);
	});

	it('should get tabela de montagem por qr token', () => {
		facade.tabelaMontagemPorQr(5, 'abc123').subscribe();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes/5/tabela-montagem?token=abc123`);
		expect(req.request.method).toBe('GET');
		req.flush({ clienteId: 5, itens: [] });
	});
});
