import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { ClienteFormModalComponent } from './cliente-form-modal.component';

describe('ClienteFormModalComponent', () => {
	let fixture: ComponentFixture<ClienteFormModalComponent>;
	let component: ClienteFormModalComponent;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		fixture = TestBed.createComponent(ClienteFormModalComponent);
		component = fixture.componentInstance;
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should only show the "tabela" tab when editing an existing cliente', () => {
		fixture.componentRef.setInput('clienteId', null);
		fixture.detectChanges();
		expect((component as unknown as { tabs: () => readonly { id: string }[] }).tabs().map((tab) => tab.id)).toEqual([
			'dados',
			'endereco',
		]);

		fixture.componentRef.setInput('clienteId', 5);
		fixture.detectChanges();
		expect((component as unknown as { tabs: () => readonly { id: string }[] }).tabs().map((tab) => tab.id)).toEqual([
			'dados',
			'endereco',
			'tabela',
		]);
	});

	it('should load servicos and vinculos when the tabela tab is opened for an existing cliente', () => {
		fixture.componentRef.setInput('open', true);
		fixture.componentRef.setInput('clienteId', 5);
		fixture.detectChanges();

		(component as unknown as { activeTab: { set: (v: string) => void } }).activeTab.set('tabela');
		fixture.detectChanges();

		httpMock.expectOne(`${environment.baseUrl}servico?page=1&limit=100`).flush({ items: [], total: 0 });

		const vinculosReq = httpMock.expectOne(`${environment.baseUrl}tabela-montagem?page=1&limit=100`);
		vinculosReq.flush({
			items: [
				{ id: 1, clienteId: 5, servicoId: 2, nomeServico: 'Montagem', valor: 50, createdAt: '2024-01-01' },
				{ id: 2, clienteId: 9, servicoId: 3, nomeServico: 'Outra', valor: 30, createdAt: '2024-01-01' },
			],
			total: 2,
		});

		const vinculos = (component as unknown as { vinculos: () => readonly { clienteId: number }[] }).vinculos();
		expect(vinculos).toHaveLength(1);
		expect(vinculos[0].clienteId).toBe(5);
	});

	it('should create a new vinculo and reload the list', () => {
		fixture.componentRef.setInput('open', true);
		fixture.componentRef.setInput('clienteId', 5);
		fixture.detectChanges();

		(component as unknown as { activeTab: { set: (v: string) => void } }).activeTab.set('tabela');
		fixture.detectChanges();

		httpMock.expectOne(`${environment.baseUrl}servico?page=1&limit=100`).flush({ items: [], total: 0 });
		httpMock.expectOne(`${environment.baseUrl}tabela-montagem?page=1&limit=100`).flush({ items: [], total: 0 });

		(component as unknown as { novoServicoId: { set: (v: number) => void } }).novoServicoId.set(2);
		(component as unknown as { novoValor: { set: (v: number) => void } }).novoValor.set(50);
		(component as unknown as { addVinculo: () => void }).addVinculo();

		const createReq = httpMock.expectOne(`${environment.baseUrl}tabela-montagem`);
		expect(createReq.request.method).toBe('POST');
		expect(createReq.request.body).toEqual({ clienteId: 5, servicoId: 2, valor: 50 });
		createReq.flush({ id: 10, clienteId: 5, servicoId: 2, valor: 50, createdAt: '2024-01-01' });

		httpMock.expectOne(`${environment.baseUrl}tabela-montagem?page=1&limit=100`).flush({ items: [], total: 0 });
	});
});
