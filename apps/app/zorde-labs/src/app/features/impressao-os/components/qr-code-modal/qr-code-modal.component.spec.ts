import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToastService } from '@repo/angular-ui';
import { of, throwError } from 'rxjs';
import type { Cliente, ClienteQrCodeResponse } from '../../../clientes/models/cliente.model';
import { ClienteFacade } from '../../../clientes/cliente.facade';
import { QrCodeModalComponent } from './qr-code-modal.component';

describe('QrCodeModalComponent', () => {
	let fixture: ComponentFixture<QrCodeModalComponent>;
	let component: QrCodeModalComponent;
	let clienteFacade: { gerarQrCode: ReturnType<typeof vi.fn> };
	let toastService: AppToastService;

	const cliente: Cliente = {
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
	};

	beforeEach(async () => {
		clienteFacade = { gerarQrCode: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [QrCodeModalComponent],
			providers: [{ provide: ClienteFacade, useValue: clienteFacade }],
		}).compileComponents();

		fixture = TestBed.createComponent(QrCodeModalComponent);
		component = fixture.componentInstance;
		toastService = TestBed.inject(AppToastService);
		fixture.componentRef.setInput('open', true);
		fixture.componentRef.setInput('cliente', cliente);
		fixture.detectChanges();
	});

	it('should render the qr code image and generated date when the cliente has a qr code', () => {
		const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
		expect(img.src).toBe(cliente.qrCodeUrl);
	});

	it('should render the empty state when the cliente has no qr code', () => {
		fixture.componentRef.setInput('cliente', { ...cliente, qrCodeUrl: null });
		fixture.detectChanges();

		const img = fixture.nativeElement.querySelector('img');
		expect(img).toBeNull();
		expect(fixture.nativeElement.textContent).toContain('ainda não possui um QR Code');
	});

	it('should not regenerate the qr code when the confirmation is dismissed', () => {
		vi.spyOn(window, 'confirm').mockReturnValue(false);

		(component as unknown as { onRegenerar: () => void }).onRegenerar();

		expect(clienteFacade.gerarQrCode).not.toHaveBeenCalled();
	});

	it('should regenerate the qr code, toast success and emit the updated cliente', () => {
		const response: ClienteQrCodeResponse = {
			clienteId: cliente.id,
			token: 'token-abc',
			qrGeradoEm: '2026-02-01T00:00:00.000Z',
			qrCodeUrl: 'https://cdn.zorde.dev/qr/1-novo.png',
			message: 'QR Code gerado com sucesso.',
		};
		clienteFacade.gerarQrCode.mockReturnValue(of(new HttpResponse<ClienteQrCodeResponse>({ body: response })));
		vi.spyOn(window, 'confirm').mockReturnValue(true);
		const toastSpy = vi.spyOn(toastService, 'show');
		const regeneratedSpy = vi.fn();
		component.regenerated.subscribe(regeneratedSpy);

		(component as unknown as { onRegenerar: () => void }).onRegenerar();

		expect(clienteFacade.gerarQrCode).toHaveBeenCalledWith(cliente.id);
		expect(toastSpy).toHaveBeenCalledWith('QR Code regenerado com sucesso.', 'success');
		expect(regeneratedSpy).toHaveBeenCalledWith({
			...cliente,
			qrCodeUrl: response.qrCodeUrl,
			qrGeradoEm: response.qrGeradoEm,
		});
	});

	it('should toast an error when regenerating the qr code fails', () => {
		clienteFacade.gerarQrCode.mockReturnValue(throwError(() => new Error('falha')));
		vi.spyOn(window, 'confirm').mockReturnValue(true);
		const toastSpy = vi.spyOn(toastService, 'show');

		(component as unknown as { onRegenerar: () => void }).onRegenerar();

		expect(toastSpy).toHaveBeenCalledWith('Não foi possível regenerar o QR Code. Tente novamente.', 'error');
	});
});
