import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToastService } from '@repo/angular-ui';
import { environment } from '../../../../../environments/environment';
import type { TabelaMontagemAggregatedRow } from '../../model/tabela-montagem-table';
import { TabelaMontagemFichaModalComponent } from './tabela-montagem-ficha-modal.component';

describe('TabelaMontagemFichaModalComponent', () => {
	let fixture: ComponentFixture<TabelaMontagemFichaModalComponent>;
	let component: TabelaMontagemFichaModalComponent;
	let httpMock: HttpTestingController;
	let toastService: AppToastService;

	const row: TabelaMontagemAggregatedRow = {
		clienteId: 5,
		nomeCliente: 'João Silva',
		quantidadeServicos: 2,
		valorTotal: 80,
		itens: [
			{ id: 1, clienteId: 5, servicoId: 1, nomeServico: 'Montagem Simples', valor: 50, createdAt: new Date() },
			{ id: 2, clienteId: 5, servicoId: 2, nomeServico: 'Montagem Parafuso', valor: 30, createdAt: new Date() },
		],
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TabelaMontagemFichaModalComponent],
			providers: [provideHttpClient(), provideHttpClientTesting()],
		}).compileComponents();

		httpMock = TestBed.inject(HttpTestingController);
		toastService = TestBed.inject(AppToastService);

		fixture = TestBed.createComponent(TabelaMontagemFichaModalComponent);
		component = fixture.componentInstance;
	});

	afterEach(() => {
		httpMock.verify();
	});

	function open(mode: 'visualizar' | 'editar'): void {
		fixture.componentRef.setInput('row', row);
		fixture.componentRef.setInput('mode', mode);
		fixture.componentRef.setInput('open', true);
		fixture.detectChanges();
		httpMock.expectOne(`${environment.baseUrl}servico?page=1&limit=200`).flush({ items: [], total: 0 });
		fixture.detectChanges();
	}

	it('should populate the draft list with the row itens when opened', () => {
		open('visualizar');

		expect(component.draftItens()).toHaveLength(2);
		expect(component.draftItens()[0]).toEqual(
			expect.objectContaining({ id: 1, servicoId: 1, nomeServico: 'Montagem Simples', valor: 50 }),
		);
	});

	it('should render the itens as read-only in visualizar mode', () => {
		open('visualizar');

		expect(component.isEditMode()).toBe(false);
		const removeButtons = fixture.nativeElement.querySelectorAll('button[label="Remover vínculo"]');
		expect(removeButtons.length).toBe(0);
	});

	it('should allow changing the valor of an existing item in editar mode', () => {
		open('editar');

		component.updateValor('existing-1', 75);

		const updated = component.draftItens().find((item) => item.key === 'existing-1');
		expect(updated?.valor).toBe(75);
	});

	it('should remove an item from the draft in editar mode', () => {
		open('editar');

		component.removeItem('existing-2');

		expect(component.draftItens()).toHaveLength(1);
		expect(component.draftItens().some((item) => item.key === 'existing-2')).toBe(false);
	});

	it('should add a new vínculo to the draft without hitting the API immediately', () => {
		open('editar');

		component.novoServicoId.set(3);
		component.onNovoServicoOptionChange({ value: 3, label: 'Montagem Transposição' });
		component.novoValor.set(40);
		component.addNovoVinculo();

		expect(component.draftItens()).toHaveLength(3);
		const created = component.draftItens().find((item) => item.servicoId === 3);
		expect(created).toEqual(
			expect.objectContaining({ id: null, servicoId: 3, nomeServico: 'Montagem Transposição', valor: 40 }),
		);
		expect(component.novoServicoId()).toBeNull();
		expect(component.novoValor()).toBeNull();
	});

	it('should warn and not add a duplicate servico to the draft', () => {
		open('editar');
		const toastSpy = vi.spyOn(toastService, 'show');

		component.novoServicoId.set(1);
		component.novoValor.set(99);
		component.addNovoVinculo();

		expect(component.draftItens()).toHaveLength(2);
		expect(toastSpy).toHaveBeenCalledWith('Este cliente já possui esse serviço vinculado.', 'error');
	});

	it('should delete removed itens, update changed valores and create new itens on save', () => {
		open('editar');
		const savedSpy = vi.fn();
		component.saved.subscribe(savedSpy);

		component.removeItem('existing-2');
		component.updateValor('existing-1', 60);
		component.novoServicoId.set(9);
		component.onNovoServicoOptionChange({ value: 9, label: 'Serviço Novo' });
		component.novoValor.set(20);
		component.addNovoVinculo();

		component.onSave();

		const deleteReq = httpMock.expectOne(`${environment.baseUrl}tabela-montagem/2`);
		expect(deleteReq.request.method).toBe('DELETE');
		deleteReq.flush(null);

		const updateReq = httpMock.expectOne(`${environment.baseUrl}tabela-montagem/1`);
		expect(updateReq.request.method).toBe('PUT');
		expect(updateReq.request.body).toEqual({ valor: 60 });
		updateReq.flush({});

		const createReq = httpMock.expectOne(`${environment.baseUrl}tabela-montagem`);
		expect(createReq.request.method).toBe('POST');
		expect(createReq.request.body).toEqual({ clienteId: 5, servicoId: 9, valor: 20 });
		createReq.flush({});

		expect(savedSpy).toHaveBeenCalled();
	});

	it('should just close without any request when nothing changed', () => {
		open('editar');
		const closedSpy = vi.fn();
		component.closed.subscribe(closedSpy);

		component.onSave();

		expect(closedSpy).toHaveBeenCalled();
	});
});
