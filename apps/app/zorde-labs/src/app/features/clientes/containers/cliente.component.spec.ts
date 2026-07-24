import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import type { Cliente } from '../models/cliente.model';
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

		httpMock.expectOne(`${environment.baseUrl}clientes`).flush([MOCK_CLIENTE]);
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

		(component as unknown as { onModalSubmit: () => void }).onModalSubmit();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body.nome).toBe('Maria Souza');
		req.flush({ ...MOCK_CLIENTE, id: 2, nome: 'Maria Souza' });

		httpMock.expectOne(`${environment.baseUrl}clientes`).flush([MOCK_CLIENTE]);
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

		httpMock.expectOne(`${environment.baseUrl}clientes`).flush([MOCK_CLIENTE]);
	});

	it('should delete a cliente when the excluir action is triggered', () => {
		(component as unknown as { onRowAction: (event: unknown) => void }).onRowAction({
			action: { value: 'excluir', label: 'Excluir' },
			row: MOCK_CLIENTE,
			rowId: MOCK_CLIENTE.id,
			rowIndex: 0,
		});

		httpMock.expectOne(`${environment.baseUrl}clientes/${MOCK_CLIENTE.id}`).flush(null);
		httpMock.expectOne(`${environment.baseUrl}clientes`).flush([]);
	});
});
