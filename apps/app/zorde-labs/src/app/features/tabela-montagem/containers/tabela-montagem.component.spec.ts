import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { TabelaMontagem, TabelaMontagemListResponse } from '../models/tabela-montagem.model';
import { TabelaMontagemFacade } from '../tabela-montagem.facade';
import { TabelaMontagemComponent } from './tabela-montagem.component';

describe('TabelaMontagemComponent', () => {
	let fixture: ComponentFixture<TabelaMontagemComponent>;
	let component: TabelaMontagemComponent;
	let tabelaMontagemFacade: {
		list: ReturnType<typeof vi.fn>;
		getById: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
	};

	const itens: readonly TabelaMontagem[] = [
		{
			id: 1,
			clienteId: 1,
			nomeCliente: 'João Silva',
			servicoId: 1,
			nomeServico: 'Montagem Simples',
			valor: 50,
			createdAt: new Date(),
		},
		{
			id: 2,
			clienteId: 1,
			nomeCliente: 'João Silva',
			servicoId: 2,
			nomeServico: 'Montagem Parafuso',
			valor: 30,
			createdAt: new Date(),
		},
		{
			id: 3,
			clienteId: 2,
			nomeCliente: 'Maria Souza',
			servicoId: 1,
			nomeServico: 'Montagem Simples',
			valor: 100,
			createdAt: new Date(),
		},
	];

	beforeEach(async () => {
		tabelaMontagemFacade = {
			list: vi.fn(() =>
				of(new HttpResponse<TabelaMontagemListResponse>({ body: { items: [...itens], total: itens.length } })),
			),
			getById: vi.fn(),
			create: vi.fn(() => of(new HttpResponse({ body: itens[0] }))),
			update: vi.fn(() => of(new HttpResponse({ body: itens[0] }))),
			delete: vi.fn(() => of(new HttpResponse<void>({ body: null }))),
		};

		await TestBed.configureTestingModule({
			imports: [TabelaMontagemComponent],
			providers: [{ provide: TabelaMontagemFacade, useValue: tabelaMontagemFacade }],
		}).compileComponents();

		fixture = TestBed.createComponent(TabelaMontagemComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should load itens on init and aggregate them by cliente', () => {
		expect(tabelaMontagemFacade.list).toHaveBeenCalledWith(1, 500);
		expect(component.aggregatedRows()).toHaveLength(2);

		const joao = component.aggregatedRows().find((row) => row.clienteId === 1);
		expect(joao?.nomeCliente).toBe('João Silva');
		expect(joao?.quantidadeServicos).toBe(2);
		expect(joao?.valorTotal).toBe(80);

		const maria = component.aggregatedRows().find((row) => row.clienteId === 2);
		expect(maria?.quantidadeServicos).toBe(1);
		expect(maria?.valorTotal).toBe(100);
	});

	it('should filter aggregated rows by cliente nome', () => {
		component.filtroForm.nome().value.set('maria');

		expect(component.filteredRows()).toHaveLength(1);
		expect(component.filteredRows()[0]?.nomeCliente).toBe('Maria Souza');
	});

	it('should reset the filter and show every aggregated row on clear', () => {
		component.filtroForm.nome().value.set('maria');
		expect(component.filteredRows()).toHaveLength(1);

		component.onClearFilter();

		expect(component.filtroForm().value().nome).toBe('');
		expect(component.filteredRows()).toHaveLength(2);
	});

	it('should open the ficha modal in visualizar mode on the visualizar action', () => {
		const row = component.aggregatedRows()[0];

		component.onRowAction({
			action: { value: 'visualizar', label: 'Visualizar' },
			row,
			rowId: row.clienteId,
			rowIndex: 0,
		});

		expect(component.fichaOpen()).toBe(true);
		expect(component.fichaMode()).toBe('visualizar');
		expect(component.fichaRow()).toEqual(row);
	});

	it('should open the ficha modal in editar mode on the editar action', () => {
		const row = component.aggregatedRows()[0];

		component.onRowAction({ action: { value: 'editar', label: 'Editar' }, row, rowId: row.clienteId, rowIndex: 0 });

		expect(component.fichaOpen()).toBe(true);
		expect(component.fichaMode()).toBe('editar');
	});

	it('should ignore unknown row actions', () => {
		const row = component.aggregatedRows()[0];

		component.onRowAction({
			action: { value: 'desconhecida', label: 'Desconhecida' },
			row,
			rowId: row.clienteId,
			rowIndex: 0,
		});

		expect(component.fichaOpen()).toBe(false);
	});

	it('should open the create modal on the header create button', () => {
		expect(component.createOpen()).toBe(false);

		component.onCreate();

		expect(component.createOpen()).toBe(true);
	});

	it('should close the ficha modal and reload the list after saving', () => {
		component.fichaOpen.set(true);

		component.onFichaSaved();

		expect(component.fichaOpen()).toBe(false);
		expect(tabelaMontagemFacade.list).toHaveBeenCalledTimes(2);
	});

	it('should close the create modal and reload the list after creating a vínculo', () => {
		component.createOpen.set(true);

		component.onCreateCreated();

		expect(component.createOpen()).toBe(false);
		expect(tabelaMontagemFacade.list).toHaveBeenCalledTimes(2);
	});
});
