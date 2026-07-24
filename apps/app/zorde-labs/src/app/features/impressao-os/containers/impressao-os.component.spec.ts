import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToastService } from '@repo/angular-ui';
import { of } from 'rxjs';
import type { Cliente } from '../../clientes/models/cliente.model';
import { ClienteFacade } from '../../clientes/cliente.facade';
import { ImpressaoOsComponent } from './impressao-os.component';

describe('ImpressaoOsComponent', () => {
	let fixture: ComponentFixture<ImpressaoOsComponent>;
	let component: ImpressaoOsComponent;
	let clienteFacade: {
		list: ReturnType<typeof vi.fn>;
		gerarQrCode: ReturnType<typeof vi.fn>;
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
			list: vi.fn(() => of(new HttpResponse<Cliente[]>({ body: [...clientes] }))),
			gerarQrCode: vi.fn(),
			imprimirFolhasOs: vi.fn(() =>
				of(new HttpResponse<Blob>({ body: new Blob(['pdf'], { type: 'application/pdf' }) })),
			),
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

	it('should filter clientes by nome', () => {
		component.filtroForm.nome().value.set('maria');

		expect(component.filteredClientes()).toEqual([clientes[1]]);
	});

	it('should open the qr modal with the selected cliente on ver-qr action', () => {
		component.onRowAction({
			action: { value: 'ver-qr', label: 'Ver QR' },
			row: clientes[0],
			rowId: clientes[0].id,
			rowIndex: 0,
		});

		expect(component.qrModalOpen()).toBe(true);
		expect(component.selectedCliente()).toEqual(clientes[0]);
	});

	it('should open the batch print modal', () => {
		component.onOpenLote();

		expect(component.loteModalOpen()).toBe(true);
	});

	it('should update the cliente in the list when the qr code is regenerated', () => {
		const atualizado: Cliente = { ...clientes[1], qrCodeUrl: 'https://cdn.zorde.dev/qr/2.png', qrGeradoEm: '2026-02-01T00:00:00.000Z' };

		component.onQrRegenerated(atualizado);

		expect(component.selectedCliente()).toEqual(atualizado);
		expect(component.clientes().find((cliente) => cliente.id === 2)).toEqual(atualizado);
	});

	it('should print folhas de os for the requested quantity and download the pdf', () => {
		const toastSpy = vi.spyOn(toastService, 'show');
		vi.spyOn(window, 'prompt').mockReturnValue('3');
		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		const clickSpy = vi.fn();
		vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement);

		component.onRowAction({
			action: { value: 'imprimir-folhas', label: 'Imprimir' },
			row: clientes[0],
			rowId: clientes[0].id,
			rowIndex: 0,
		});

		expect(clienteFacade.imprimirFolhasOs).toHaveBeenCalledWith(clientes[0].id, 3);
		expect(clickSpy).toHaveBeenCalledTimes(1);
		expect(toastSpy).toHaveBeenCalledWith('Folhas de OS geradas com sucesso.', 'success');

		createObjectURLSpy.mockRestore();
		revokeObjectURLSpy.mockRestore();
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
