import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import type { Cliente, ClienteListResponse } from '../models/cliente.model';
import { ClienteComponent } from './cliente.component';

const MOCK_CLIENTE: Cliente = {
	id: 1,
	nome: 'João Silva',
	email: 'joao@teste.com',
	contato: '11999998888',
	tipoPessoa: 'FISICA',
	documento: '12345678901',
	status: 'ATIVO',
	cidade: 'São Paulo',
	uf: 'SP',
	usuarioId: 1,
	createdAt: null,
};

const LIST_URL = `${environment.baseUrl}clientes?page=1&limit=10`;

function listResponse(items: readonly Cliente[] = [MOCK_CLIENTE]): ClienteListResponse {
	return {
		items: [...items],
		total: items.length,
		counts: { total: items.length, ativos: items.length, inativos: 0 },
	};
}

describe('ClienteComponent', () => {
	let fixture: ComponentFixture<ClienteComponent>;
	let component: ClienteComponent;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		fixture = TestBed.createComponent(ClienteComponent);
		component = fixture.componentInstance;
		httpMock = TestBed.inject(HttpTestingController);
		fixture.detectChanges();

		httpMock.expectOne(LIST_URL).flush(listResponse());
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should load the clientes list on init', () => {
		expect((component as unknown as { clientes: () => readonly Cliente[] }).clientes()).toEqual([MOCK_CLIENTE]);
	});

	it('should create a new cliente on submit when there is no cliente being edited', () => {
		(component as unknown as { onCreate: () => void }).onCreate();
		(component as unknown as { formValue: { update: (fn: (v: unknown) => unknown) => void } }).formValue.update((value) => ({
			...(value as object),
			nome: 'Maria Souza',
			email: 'maria@teste.com',
			documento: '98765432100',
		}));
		(component as unknown as { pendingVinculos: { set: (v: unknown) => void } }).pendingVinculos.set([
			{ tempId: 1, servicoId: 2, valor: 50, nomeServico: 'Montagem' },
		]);

		(component as unknown as { onModalSubmit: () => void }).onModalSubmit();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body.nome).toBe('Maria Souza');
		req.flush({ ...MOCK_CLIENTE, id: 2, nome: 'Maria Souza' });

		const vinculoReq = httpMock.expectOne(`${environment.baseUrl}tabela-montagem`);
		expect(vinculoReq.request.method).toBe('POST');
		vinculoReq.flush({ id: 10, clienteId: 2, servicoId: 2, valor: 50, createdAt: '2024-01-01' });

		httpMock.expectOne(LIST_URL).flush(listResponse());
	});

	it('should update an existing cliente on submit when editing', () => {
		(component as unknown as { onRowAction: (event: unknown) => void }).onRowAction({
			action: { value: 'editar', label: 'Editar' },
			row: MOCK_CLIENTE,
			rowId: MOCK_CLIENTE.id,
			rowIndex: 0,
		});

		(component as unknown as { formValue: { update: (fn: (v: unknown) => unknown) => void } }).formValue.update((value) => ({
			...(value as object),
			nome: 'João Atualizado',
		}));

		(component as unknown as { onModalSubmit: () => void }).onModalSubmit();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes`);
		expect(req.request.method).toBe('PUT');
		expect(req.request.body.id).toBe(MOCK_CLIENTE.id);
		expect(req.request.body.nome).toBe('João Atualizado');
		req.flush({ ...MOCK_CLIENTE, nome: 'João Atualizado' });

		const qrReq = httpMock.expectOne(`${environment.baseUrl}clientes/${MOCK_CLIENTE.id}/qrcode`);
		expect(qrReq.request.method).toBe('POST');
		qrReq.flush({
			clienteId: MOCK_CLIENTE.id,
			token: 'token',
			qrGeradoEm: '2026-07-24T12:00:00.000Z',
			qrCodeUrl: 'https://cdn.zorde.dev/qr/1.png',
			message: 'ok',
		});

		httpMock.expectOne(LIST_URL).flush(listResponse());
	});

	it('should not revoke QR when editing without data changes', () => {
		(component as unknown as { onRowAction: (event: unknown) => void }).onRowAction({
			action: { value: 'editar', label: 'Editar' },
			row: MOCK_CLIENTE,
			rowId: MOCK_CLIENTE.id,
			rowIndex: 0,
		});

		(component as unknown as { onModalSubmit: () => void }).onModalSubmit();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes`);
		expect(req.request.method).toBe('PUT');
		req.flush(MOCK_CLIENTE);

		httpMock.expectNone(`${environment.baseUrl}clientes/${MOCK_CLIENTE.id}/qrcode`);
		httpMock.expectOne(LIST_URL).flush(listResponse());
	});

	it('should delete a cliente when the excluir action is triggered', () => {
		(component as unknown as { onRowAction: (event: unknown) => void }).onRowAction({
			action: { value: 'excluir', label: 'Excluir' },
			row: MOCK_CLIENTE,
			rowId: MOCK_CLIENTE.id,
			rowIndex: 0,
		});

		httpMock.expectOne(`${environment.baseUrl}clientes/${MOCK_CLIENTE.id}`).flush(null);
		httpMock.expectOne(LIST_URL).flush(listResponse([]));
	});
});
