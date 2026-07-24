import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PessoaFormComponent } from '../../../../shared/components/pessoa-form/pessoa-form.component';
import { EMPTY_PESSOA_FORM_VALUE } from '../../../../shared/components/pessoa-form/pessoa-form.model';
import { FornecedorFormModalComponent } from './fornecedor-form-modal.component';

describe('FornecedorFormModalComponent', () => {
	let fixture: ComponentFixture<FornecedorFormModalComponent>;
	let component: FornecedorFormModalComponent;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		fixture = TestBed.createComponent(FornecedorFormModalComponent);
		component = fixture.componentInstance;
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should only show the "dados" and "endereco" tabs', () => {
		fixture.detectChanges();
		expect((component as unknown as { tabs: () => readonly { id: string }[] }).tabs().map((tab) => tab.id)).toEqual([
			'dados',
			'endereco',
		]);
	});

	it('should reset the active tab to "dados" whenever the modal is opened', () => {
		fixture.componentRef.setInput('open', false);
		fixture.detectChanges();

		(component as unknown as { activeTab: { set: (v: string) => void } }).activeTab.set('endereco');
		fixture.detectChanges();

		fixture.componentRef.setInput('open', true);
		fixture.detectChanges();

		expect((component as unknown as { activeTab: () => string }).activeTab()).toBe('dados');
	});

	it('should emit closed when onClose is invoked', () => {
		fixture.detectChanges();
		const emitted = vi.fn();
		component.closed.subscribe(emitted);

		(component as unknown as { onClose: () => void }).onClose();

		expect(emitted).toHaveBeenCalled();
	});

	it('should emit submitted when onSubmit is invoked', () => {
		fixture.detectChanges();
		const emitted = vi.fn();
		component.submitted.subscribe(emitted);

		(component as unknown as { onSubmit: () => void }).onSubmit();

		expect(emitted).toHaveBeenCalled();
	});

	it('should perform a CEP lookup through the embedded pessoa-form and update the shared value', () => {
		fixture.componentRef.setInput('open', true);
		component.value.set({ ...EMPTY_PESSOA_FORM_VALUE });
		(component as unknown as { activeTab: { set: (v: string) => void } }).activeTab.set('endereco');
		fixture.detectChanges();

		const cepDigits = '01001000';
		const pessoaForm = fixture.debugElement.query(By.directive(PessoaFormComponent)).componentInstance as PessoaFormComponent;
		(pessoaForm as unknown as { onCepChange: (value: string) => void }).onCepChange(cepDigits);

		const req = httpMock.expectOne(`https://brasilapi.com.br/api/cep/v2/${cepDigits}`);
		req.flush({
			cep: '01001-000',
			state: 'SP',
			city: 'São Paulo',
			street: 'Praça da Sé',
			neighborhood: 'Sé',
		});

		expect(component.value().cidade).toBe('São Paulo');
		expect(component.value().uf).toBe('SP');
	});
});
