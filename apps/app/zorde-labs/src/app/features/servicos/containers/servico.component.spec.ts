import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToastService } from '@repo/angular-ui';
import { of } from 'rxjs';
import type { Servico, ServicoListResponse } from '../models/service.model';
import { ServicoFacade } from '../servico.facade';
import { ServicoComponent } from './servico.component';

describe('ServicoComponent', () => {
	let fixture: ComponentFixture<ServicoComponent>;
	let component: ServicoComponent;
	let servicoFacade: {
		list: ReturnType<typeof vi.fn>;
		getById: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
	};
	let toastService: AppToastService;

	const servicos: readonly Servico[] = [
		{ id: 1, usuarioId: 1, nome: 'Montagem Simples', descricao: 'Montagem de óculos simples', createdAt: null },
		{ id: 2, usuarioId: 1, nome: 'Montagem Parafuso', descricao: null, createdAt: null },
	];

	beforeEach(async () => {
		servicoFacade = {
			list: vi.fn(() => of(new HttpResponse<ServicoListResponse>({ body: { items: [...servicos], total: 2 } }))),
			getById: vi.fn(() => of(new HttpResponse<Servico>({ body: servicos[0] }))),
			create: vi.fn(() => of(new HttpResponse<Servico>({ body: servicos[0] }))),
			update: vi.fn(() => of(new HttpResponse<Servico>({ body: servicos[0] }))),
			delete: vi.fn(() => of(new HttpResponse<void>({ body: null }))),
		};

		await TestBed.configureTestingModule({
			imports: [ServicoComponent],
			providers: [{ provide: ServicoFacade, useValue: servicoFacade }],
		}).compileComponents();

		fixture = TestBed.createComponent(ServicoComponent);
		component = fixture.componentInstance;
		toastService = TestBed.inject(AppToastService);
		fixture.detectChanges();
	});

	it('should load the servico list on init', () => {
		expect(servicoFacade.list).toHaveBeenCalledWith(1, 10, undefined);
		expect(component.rows()).toEqual(servicos);
		expect(component.total()).toBe(2);
		expect(component.loading()).toBe(false);
	});

	it('should reload with search term and reset page on search', () => {
		component.filtroForm.nome().value.set('parafuso');
		component.onSearch();

		expect(component.page()).toBe(1);
		expect(servicoFacade.list).toHaveBeenLastCalledWith(1, 10, 'parafuso');
	});

	it('should reset filter and reload on clear', () => {
		component.filtroForm.nome().value.set('parafuso');
		component.page.set(3);

		component.onClearFilter();

		expect(component.page()).toBe(1);
		expect(component.filtroForm().value().nome).toBe('');
		expect(servicoFacade.list).toHaveBeenLastCalledWith(1, 10, undefined);
	});

	it('should request the next page from the table on pagination change', () => {
		component.onPaginationChange({ page: 2, pageSize: 25 });

		expect(component.page()).toBe(2);
		expect(component.pageSize()).toBe(25);
		expect(servicoFacade.list).toHaveBeenLastCalledWith(2, 25, undefined);
	});

	it('should open the modal with an empty form on create', () => {
		component.onCreate();

		expect(component.modalOpen()).toBe(true);
		expect(component.editingServico()).toBeNull();
		expect(component.servicoForm().value()).toEqual({ nome: '', descricao: '' });
	});

	it('should open the modal with the servico values on edit action', () => {
		component.onRowAction({
			action: { value: 'editar', label: 'Editar' },
			row: servicos[0],
			rowId: servicos[0].id,
			rowIndex: 0,
		});

		expect(component.modalOpen()).toBe(true);
		expect(component.editingServico()).toEqual(servicos[0]);
		expect(component.servicoForm().value()).toEqual({
			nome: servicos[0].nome,
			descricao: servicos[0].descricao,
		});
	});

	it('should not submit the create form when nome is empty', () => {
		component.onCreate();
		component.onModalSubmit();

		expect(servicoFacade.create).not.toHaveBeenCalled();
		expect(component.servicoForm.nome().touched()).toBe(true);
		expect(component.servicoForm().invalid()).toBe(true);
	});

	it('should create a servico, toast success, close the modal and reload the list', () => {
		const toastSpy = vi.spyOn(toastService, 'show');

		component.onCreate();
		component.servicoForm.nome().value.set('Novo Serviço');
		component.servicoForm.descricao().value.set('Descrição do novo serviço');

		component.onModalSubmit();

		expect(servicoFacade.create).toHaveBeenCalledWith({
			nome: 'Novo Serviço',
			descricao: 'Descrição do novo serviço',
		});
		expect(toastSpy).toHaveBeenCalledWith('Serviço criado com sucesso!', 'success');
		expect(component.modalOpen()).toBe(false);
		expect(servicoFacade.list).toHaveBeenCalledTimes(2);
	});

	it('should update a servico when editing and reload the list', () => {
		const toastSpy = vi.spyOn(toastService, 'show');

		component.onRowAction({
			action: { value: 'editar', label: 'Editar' },
			row: servicos[0],
			rowId: servicos[0].id,
			rowIndex: 0,
		});
		component.servicoForm.nome().value.set('Montagem Simples Atualizada');

		component.onModalSubmit();

		expect(servicoFacade.update).toHaveBeenCalledWith(servicos[0].id, {
			nome: 'Montagem Simples Atualizada',
			descricao: servicos[0].descricao ?? undefined,
		});
		expect(toastSpy).toHaveBeenCalledWith('Serviço atualizado com sucesso!', 'success');
		expect(component.modalOpen()).toBe(false);
	});

	it('should delete a servico after confirmation, toast success and reload the list', () => {
		const toastSpy = vi.spyOn(toastService, 'show');
		vi.spyOn(window, 'confirm').mockReturnValue(true);

		component.onRowAction({
			action: { value: 'excluir', label: 'Excluir' },
			row: servicos[1],
			rowId: servicos[1].id,
			rowIndex: 1,
		});

		expect(servicoFacade.delete).toHaveBeenCalledWith(servicos[1].id);
		expect(toastSpy).toHaveBeenCalledWith('Serviço excluído com sucesso!', 'success');
		expect(servicoFacade.list).toHaveBeenCalledTimes(2);
	});

	it('should not delete a servico when confirmation is dismissed', () => {
		vi.spyOn(window, 'confirm').mockReturnValue(false);

		component.onRowAction({
			action: { value: 'excluir', label: 'Excluir' },
			row: servicos[1],
			rowId: servicos[1].id,
			rowIndex: 1,
		});

		expect(servicoFacade.delete).not.toHaveBeenCalled();
	});
});
