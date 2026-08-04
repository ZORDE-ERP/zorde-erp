import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToastService } from '@repo/angular-ui';
import { of } from 'rxjs';
import { ClienteFacade } from '../../clientes/cliente.facade';
import type { Cliente } from '../../clientes/models/cliente.model';
import { ImpressaoOsComponent } from './impressao-os.component';

describe('ImpressaoOsComponent', () => {
	let fixture: ComponentFixture<ImpressaoOsComponent>;
	let component: ImpressaoOsComponent;
	let clienteFacade: {
		list: ReturnType<typeof vi.fn>;
		imprimirFolhasOs: ReturnType<typeof vi.fn>;
	};
	let toastService: AppToastService;

	const clientes: readonly Cliente[] = [
		{
			id: 1,
			nome: 'João Silva',
			email: 'joao@teste.com',
			tipoPessoa: 'FISICA',
			documento: '12345678901',
			status: 'ATIVO',
			usuarioId: 1,
			qrCodeUrl: 'https://cdn.zorde.dev/qr/1.png',
			qrGeradoEm: '2026-01-10T10:00:00.000Z',
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
			qrCodeUrl: null,
			qrGeradoEm: null,
			createdAt: null,
		},
	];

	beforeEach(async () => {
		clienteFacade = {
			list: vi.fn(() =>
				of(
					new HttpResponse({
						body: {
							items: [...clientes],
							total: clientes.length,
							counts: { total: clientes.length, ativos: clientes.length, inativos: 0 },
						},
					}),
				),
			),
			imprimirFolhasOs: vi.fn(() => of(new HttpResponse<Blob>({ body: new Blob(['pdf'], { type: 'application/pdf' }) }))),
		};

		await TestBed.configureTestingModule({
			imports: [ImpressaoOsComponent],
			providers: [{ provide: ClienteFacade, useValue: clienteFacade }],
		}).compileComponents();

		fixture = TestBed.createComponent(ImpressaoOsComponent);
		component = fixture.componentInstance;
		toastService = TestBed.inject(AppToastService);
		fixture.detectChanges();
	});

	it('should load the clientes list on init', () => {
		expect(clienteFacade.list).toHaveBeenCalled();
		expect(component.clientes()).toEqual(clientes);
		expect(component.loading()).toBe(false);
	});

	it('should reload the list filtered by cliente id on search', () => {
		component.filtroForm.clienteId().value.set(2);
		clienteFacade.list.mockClear();

		component.onSearch();

		expect(clienteFacade.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, id: 2 }));
	});

	it('should open the batch print modal', () => {
		component.onOpenLote();

		expect(component.loteModalOpen()).toBe(true);
	});

	it('should print folhas de os for the requested quantity and download the pdf', () => {
		const toastSpy = vi.spyOn(toastService, 'show');
		const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('3');
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		const clickSpy = vi.fn();
		const createElementSpy = vi
			.spyOn(document, 'createElement')
			.mockReturnValue({ href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement);

		component.onRowAction({
			action: { value: 'imprimir-folhas', label: 'Imprimir' },
			row: clientes[0],
			rowId: clientes[0].id,
			rowIndex: 0,
		});

		expect(clienteFacade.imprimirFolhasOs).toHaveBeenCalledWith(clientes[0].id, 3);
		expect(clickSpy).toHaveBeenCalledTimes(1);
		expect(toastSpy).toHaveBeenCalledWith('Folhas de OS geradas com sucesso.', 'success');

		promptSpy.mockRestore();
		createObjectURLSpy.mockRestore();
		revokeObjectURLSpy.mockRestore();
		createElementSpy.mockRestore();
	});

	it('should not print when the prompt is dismissed', () => {
		vi.spyOn(window, 'prompt').mockReturnValue(null);

		component.onRowAction({
			action: { value: 'imprimir-folhas', label: 'Imprimir' },
			row: clientes[0],
			rowId: clientes[0].id,
			rowIndex: 0,
		});

		expect(clienteFacade.imprimirFolhasOs).not.toHaveBeenCalled();
	});

	it('should warn and not print when the quantity is invalid', () => {
		const toastSpy = vi.spyOn(toastService, 'show');
		vi.spyOn(window, 'prompt').mockReturnValue('0');

		component.onRowAction({
			action: { value: 'imprimir-folhas', label: 'Imprimir' },
			row: clientes[0],
			rowId: clientes[0].id,
			rowIndex: 0,
		});

		expect(clienteFacade.imprimirFolhasOs).not.toHaveBeenCalled();
		expect(toastSpy).toHaveBeenCalledWith('Informe uma quantidade válida.', 'warning');
	});
});
