import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToastService } from '@repo/angular-ui';
import { environment } from '../../../../../environments/environment';
import type { TabelaMontagem } from '../../models/tabela-montagem.model';
import { TabelaMontagemCreateModalComponent } from './tabela-montagem-create-modal.component';

describe('TabelaMontagemCreateModalComponent', () => {
	let fixture: ComponentFixture<TabelaMontagemCreateModalComponent>;
	let component: TabelaMontagemCreateModalComponent;
	let httpMock: HttpTestingController;
	let toastService: AppToastService;

	const existingItens: readonly TabelaMontagem[] = [
		{ id: 1, clienteId: 5, servicoId: 1, nomeServico: 'Montagem Simples', valor: 50, createdAt: new Date() },
	];

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TabelaMontagemCreateModalComponent],
			providers: [provideHttpClient(), provideHttpClientTesting()],
		}).compileComponents();

		httpMock = TestBed.inject(HttpTestingController);
		toastService = TestBed.inject(AppToastService);

		fixture = TestBed.createComponent(TabelaMontagemCreateModalComponent);
		component = fixture.componentInstance;

		fixture.componentRef.setInput('existingItens', existingItens);
		fixture.componentRef.setInput('open', true);
		fixture.detectChanges();
		httpMock.expectOne(`${environment.baseUrl}clientes?page=1&limit=20`).flush({
			items: [{ id: 5, nome: 'João Silva' }],
			total: 1,
			counts: { total: 1, ativos: 1, inativos: 0 },
		});
		httpMock.expectOne(`${environment.baseUrl}servico?page=1&limit=200`).flush({
			items: [
				{ id: 1, nome: 'Montagem Simples' },
				{ id: 2, nome: 'Montagem Parafuso' },
			],
			total: 2,
		});
		fixture.detectChanges();
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should show the existing vínculos of the selected cliente', () => {
		component.clienteId.set(5);
		fixture.detectChanges();

		expect(component.clienteVinculos()).toHaveLength(1);
		expect(component.clienteVinculos()[0]?.nomeServico).toBe('Montagem Simples');
	});

	it('should not allow submitting when the selected servico is already vinculado to the cliente', () => {
		component.clienteId.set(5);
		component.servicoId.set(1);
		component.valor.set(30);

		expect(component.isDuplicate()).toBe(true);
		expect(component.canSubmit()).toBe(true);

		component.onSubmit();

		expect(httpMock.match(`${environment.baseUrl}tabela-montagem`)).toHaveLength(0);
	});

	it('should warn with a clear message and skip the request on duplicate submit', () => {
		const toastSpy = vi.spyOn(toastService, 'show');

		component.clienteId.set(5);
		component.servicoId.set(1);
		component.valor.set(30);
		component.onSubmit();

		expect(toastSpy).toHaveBeenCalledWith('Este cliente já possui esse serviço vinculado.', 'error');
	});

	it('should create a new vínculo, toast success and reset the form', () => {
		const toastSpy = vi.spyOn(toastService, 'show');
		const createdSpy = vi.fn();
		component.created.subscribe(createdSpy);

		component.clienteId.set(5);
		component.servicoId.set(2);
		component.valor.set(35);

		expect(component.canSubmit()).toBe(true);
		expect(component.isDuplicate()).toBe(false);

		component.onSubmit();

		const req = httpMock.expectOne(`${environment.baseUrl}tabela-montagem`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual({ clienteId: 5, servicoId: 2, valor: 35 });
		req.flush({ id: 2, clienteId: 5, servicoId: 2, valor: 35, createdAt: '2024-01-01' });

		expect(toastSpy).toHaveBeenCalledWith('Vínculo criado com sucesso!', 'success');
		expect(createdSpy).toHaveBeenCalled();
		expect(component.clienteId()).toBeNull();
		expect(component.servicoId()).toBeNull();
		expect(component.valor()).toBeNull();
	});

	it('should not submit while required fields are missing', () => {
		component.clienteId.set(5);
		component.onSubmit();

		expect(httpMock.match(`${environment.baseUrl}tabela-montagem`)).toHaveLength(0);
	});

	it('should reset the form whenever the modal is reopened', () => {
		component.clienteId.set(5);
		component.servicoId.set(2);
		component.valor.set(35);

		fixture.componentRef.setInput('open', false);
		fixture.detectChanges();
		fixture.componentRef.setInput('open', true);
		fixture.detectChanges();

		expect(component.clienteId()).toBeNull();
		expect(component.servicoId()).toBeNull();
		expect(component.valor()).toBeNull();
	});
});
