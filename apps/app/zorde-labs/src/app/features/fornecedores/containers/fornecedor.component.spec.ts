import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToastService } from '@repo/angular-ui';
import { of } from 'rxjs';
import { FornecedorFacade } from '../fornecedor.facade';
import type { Fornecedor } from '../models/fornecedor.model';
import { FornecedorComponent } from './fornecedor.component';

describe('FornecedorComponent', () => {
	let fixture: ComponentFixture<FornecedorComponent>;
	let component: FornecedorComponent;
	let httpMock: HttpTestingController;
	let fornecedorFacade: {
		list: ReturnType<typeof vi.fn>;
		getById: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
	};
	let toastService: AppToastService;

	const fornecedores: readonly Fornecedor[] = [
		{
			id: 1,
			nome: 'Fornecedor A',
			email: 'fornecedora@teste.com',
			contato: '11999998888',
			tipoPessoa: 'JURIDICA',
			documento: '11222333000181',
			status: 'ATIVO',
			cidade: 'São Paulo',
			uf: 'SP',
			usuarioId: 1,
			createdAt: null,
		},
		{
			id: 2,
			nome: 'Fornecedor B',
			email: 'fornecedorb@teste.com',
			contato: null,
			tipoPessoa: 'FISICA',
			documento: '12345678901',
			status: 'INATIVO',
			cidade: 'Curitiba',
			uf: 'PR',
			usuarioId: 1,
			createdAt: null,
		},
	];

	beforeEach(async () => {
		fornecedorFacade = {
			list: vi.fn(() =>
				of(
					new HttpResponse({
						body: {
							items: [...fornecedores],
							total: fornecedores.length,
							counts: { total: fornecedores.length, ativos: 1, inativos: 1 },
						},
					}),
				),
			),
			getById: vi.fn(() => of(new HttpResponse<Fornecedor>({ body: fornecedores[0] }))),
			create: vi.fn(() => of(new HttpResponse<Fornecedor>({ body: fornecedores[0] }))),
			update: vi.fn(() => of(new HttpResponse<Fornecedor>({ body: fornecedores[0] }))),
			delete: vi.fn(() => of(new HttpResponse<void>({ body: null }))),
		};

		await TestBed.configureTestingModule({
			imports: [FornecedorComponent],
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				{ provide: FornecedorFacade, useValue: fornecedorFacade },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(FornecedorComponent);
		component = fixture.componentInstance;
		httpMock = TestBed.inject(HttpTestingController);
		toastService = TestBed.inject(AppToastService);
		fixture.detectChanges();
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should load the fornecedor list on init', () => {
		expect(fornecedorFacade.list).toHaveBeenCalled();
		expect((component as unknown as { fornecedores: () => readonly Fornecedor[] }).fornecedores()).toEqual(fornecedores);
	});

	it('should open the modal with an empty form on create', () => {
		(component as unknown as { onCreate: () => void }).onCreate();

		expect((component as unknown as { modalOpen: () => boolean }).modalOpen()).toBe(true);
		expect((component as unknown as { editingFornecedor: () => Fornecedor | null }).editingFornecedor()).toBeNull();
	});

	it('should create a fornecedor, toast success, close the modal and reload the list', () => {
		const toastSpy = vi.spyOn(toastService, 'show');

		(component as unknown as { onCreate: () => void }).onCreate();
		(component as unknown as { formValue: { update: (fn: (v: unknown) => unknown) => void } }).formValue.update((value) => ({
			...(value as object),
			nome: 'Novo Fornecedor',
			email: 'novo@fornecedor.com',
			documento: '98765432100',
		}));

		(component as unknown as { onModalSubmit: () => void }).onModalSubmit();

		expect(fornecedorFacade.create).toHaveBeenCalledWith(
			expect.objectContaining({
				nome: 'Novo Fornecedor',
				email: 'novo@fornecedor.com',
				documento: '98765432100',
			}),
		);
		expect(toastSpy).toHaveBeenCalledWith('Fornecedor criado com sucesso.', 'success');
		expect((component as unknown as { modalOpen: () => boolean }).modalOpen()).toBe(false);
		expect(fornecedorFacade.list).toHaveBeenCalledTimes(2);
	});

	it('should not submit the create form when required fields are missing', () => {
		const toastSpy = vi.spyOn(toastService, 'show');

		(component as unknown as { onCreate: () => void }).onCreate();
		(component as unknown as { onModalSubmit: () => void }).onModalSubmit();

		expect(fornecedorFacade.create).not.toHaveBeenCalled();
		expect(toastSpy).toHaveBeenCalledWith('Preencha nome, e-mail e documento para continuar.', 'warning');
	});

	it('should update an existing fornecedor on submit when editing and reload the list', () => {
		const toastSpy = vi.spyOn(toastService, 'show');

		(component as unknown as { onRowAction: (event: unknown) => void }).onRowAction({
			action: { value: 'editar', label: 'Editar' },
			row: fornecedores[0],
			rowId: fornecedores[0].id,
			rowIndex: 0,
		});

		(component as unknown as { formValue: { update: (fn: (v: unknown) => unknown) => void } }).formValue.update((value) => ({
			...(value as object),
			nome: 'Fornecedor A Atualizado',
		}));

		(component as unknown as { onModalSubmit: () => void }).onModalSubmit();

		expect(fornecedorFacade.update).toHaveBeenCalledWith(
			expect.objectContaining({ id: fornecedores[0].id, nome: 'Fornecedor A Atualizado' }),
		);
		expect(toastSpy).toHaveBeenCalledWith('Fornecedor atualizado com sucesso.', 'success');
		expect((component as unknown as { modalOpen: () => boolean }).modalOpen()).toBe(false);
	});

	it('should delete a fornecedor after confirmation, toast success and reload the list', () => {
		const toastSpy = vi.spyOn(toastService, 'show');
		vi.spyOn(window, 'confirm').mockReturnValue(true);

		(component as unknown as { onRowAction: (event: unknown) => void }).onRowAction({
			action: { value: 'excluir', label: 'Excluir' },
			row: fornecedores[1],
			rowId: fornecedores[1].id,
			rowIndex: 1,
		});

		expect(fornecedorFacade.delete).toHaveBeenCalledWith(fornecedores[1].id);
		expect(toastSpy).toHaveBeenCalledWith('Fornecedor removido com sucesso.', 'success');
		expect(fornecedorFacade.list).toHaveBeenCalledTimes(2);
	});

	it('should not delete a fornecedor when confirmation is dismissed', () => {
		vi.spyOn(window, 'confirm').mockReturnValue(false);

		(component as unknown as { onRowAction: (event: unknown) => void }).onRowAction({
			action: { value: 'excluir', label: 'Excluir' },
			row: fornecedores[1],
			rowId: fornecedores[1].id,
			rowIndex: 1,
		});

		expect(fornecedorFacade.delete).not.toHaveBeenCalled();
	});
});
