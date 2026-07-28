import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToastService } from '@repo/angular-ui';
import { of, throwError } from 'rxjs';
import type { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteFacade } from '../../../clientes/cliente.facade';
import { ImpressaoLoteModalComponent, ImpressaoLoteResultado } from './impressao-lote-modal.component';

describe('ImpressaoLoteModalComponent', () => {
	let fixture: ComponentFixture<ImpressaoLoteModalComponent>;
	let component: ImpressaoLoteModalComponent;
	let clienteFacade: { imprimirFolhasOs: ReturnType<typeof vi.fn>; getById: ReturnType<typeof vi.fn> };
	let toastService: AppToastService;
	let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
	let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
	let clickSpy: ReturnType<typeof vi.fn>;

	const clientes: readonly Cliente[] = [
		{
			id: 1,
			nome: 'João Silva',
			email: 'joao@teste.com',
			tipoPessoa: 'FISICA',
			documento: '12345678901',
			status: 'ATIVO',
			usuarioId: 1,
			createdAt: null,
		},
		{
			id: 2,
			nome: 'Maria Souza',
			email: 'maria@teste.com',
			tipoPessoa: 'FISICA',
			documento: '98765432100',
			status: 'ATIVO',
			usuarioId: 1,
			createdAt: null,
		},
	];

	function pdfBlob(): Blob {
		return new Blob(['pdf'], { type: 'application/pdf' });
	}

	beforeEach(async () => {
		clienteFacade = {
			imprimirFolhasOs: vi.fn(),
			getById: vi.fn((id: number) =>
				of(new HttpResponse<Cliente>({ body: clientes.find((cliente) => cliente.id === id) ?? null })),
			),
		};

		await TestBed.configureTestingModule({
			imports: [ImpressaoLoteModalComponent],
			providers: [{ provide: ClienteFacade, useValue: clienteFacade }],
		}).compileComponents();

		fixture = TestBed.createComponent(ImpressaoLoteModalComponent);
		component = fixture.componentInstance;
		toastService = TestBed.inject(AppToastService);

		createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
		revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		clickSpy = vi.fn();
		vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement);

		fixture.componentRef.setInput('open', true);
		fixture.detectChanges();
	});

	afterEach(() => {
		createObjectURLSpy.mockRestore();
		revokeObjectURLSpy.mockRestore();
	});

	it('should start with a single empty row', () => {
		expect(component.rows()).toHaveLength(1);
		expect(component.rows()[0].clienteId).toBeNull();
		expect(component.rows()[0].quantidade).toBe(1);
	});

	it('should add and remove rows', () => {
		component.addRow();
		expect(component.rows()).toHaveLength(2);

		const [first, second] = component.rows();
		component.removeRow(first.id);

		expect(component.rows()).toHaveLength(1);
		expect(component.rows()[0].id).toBe(second.id);
	});

	it('should update clienteId and quantidade for a row', () => {
		const [row] = component.rows();

		component.setClienteId(row.id, 2);
		component.setQuantidade(row.id, 5);

		expect(component.rows()[0]).toEqual({ id: row.id, clienteId: 2, quantidade: 5 });
	});

	it('should warn and not call the facade when there are no valid rows', async () => {
		const toastSpy = vi.spyOn(toastService, 'show');

		await component.onConfirm();

		expect(clienteFacade.imprimirFolhasOs).not.toHaveBeenCalled();
		expect(toastSpy).toHaveBeenCalledWith('Adicione ao menos um cliente com quantidade válida.', 'warning');
	});

	it('should sequentially print each valid row, track progress and download every pdf', async () => {
		const [firstRow] = component.rows();
		component.setClienteId(firstRow.id, 1);
		component.setQuantidade(firstRow.id, 2);
		component.addRow();
		const [, secondRow] = component.rows();
		component.setClienteId(secondRow.id, 2);
		component.setQuantidade(secondRow.id, 3);

		clienteFacade.imprimirFolhasOs.mockImplementation(() =>
			of(new HttpResponse<Blob>({ body: pdfBlob() })),
		);

		const completedSpy = vi.fn();
		component.completed.subscribe(completedSpy);

		await component.onConfirm();

		expect(clienteFacade.imprimirFolhasOs).toHaveBeenNthCalledWith(1, 1, 2);
		expect(clienteFacade.imprimirFolhasOs).toHaveBeenNthCalledWith(2, 2, 3);
		expect(clickSpy).toHaveBeenCalledTimes(2);
		expect(component.progress()).toEqual({ current: 2, total: 2 });
		expect(component.printing()).toBe(false);

		const resultados = component.resultados() as readonly ImpressaoLoteResultado[];
		expect(resultados).toEqual([
			{ clienteId: 1, nome: 'João Silva', sucesso: true },
			{ clienteId: 2, nome: 'Maria Souza', sucesso: true },
		]);
		expect(completedSpy).toHaveBeenCalledWith(resultados);
	});

	it('should report a per-client failure without stopping the batch', async () => {
		const [firstRow] = component.rows();
		component.setClienteId(firstRow.id, 1);
		component.addRow();
		const [, secondRow] = component.rows();
		component.setClienteId(secondRow.id, 2);

		clienteFacade.imprimirFolhasOs.mockImplementation((clienteId: number) =>
			clienteId === 1 ? throwError(() => new Error('falha')) : of(new HttpResponse<Blob>({ body: pdfBlob() })),
		);
		const toastSpy = vi.spyOn(toastService, 'show');

		await component.onConfirm();

		const resultados = component.resultados() as readonly ImpressaoLoteResultado[];
		expect(resultados).toEqual([
			{ clienteId: 1, nome: 'João Silva', sucesso: false },
			{ clienteId: 2, nome: 'Maria Souza', sucesso: true },
		]);
		expect(toastSpy).toHaveBeenCalledWith('Impressão em lote concluída com 1 falha(s) de 2.', 'warning');
	});

	it('should reset the rows and results when starting a new batch', async () => {
		const [firstRow] = component.rows();
		component.setClienteId(firstRow.id, 1);
		clienteFacade.imprimirFolhasOs.mockReturnValue(of(new HttpResponse<Blob>({ body: pdfBlob() })));

		await component.onConfirm();
		expect(component.resultados()).not.toBeNull();

		component.onNovaImpressao();

		expect(component.resultados()).toBeNull();
		expect(component.rows()).toHaveLength(1);
		expect(component.rows()[0].clienteId).toBeNull();
	});

	it('should not close the modal while printing', async () => {
		const closedSpy = vi.fn();
		component.closed.subscribe(closedSpy);
		component.printing.set(true);

		component.onClose();

		expect(closedSpy).not.toHaveBeenCalled();
	});
});
