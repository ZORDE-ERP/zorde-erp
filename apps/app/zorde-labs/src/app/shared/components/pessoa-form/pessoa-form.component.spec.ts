import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PessoaFormComponent } from './pessoa-form.component';
import { EMPTY_PESSOA_FORM_VALUE } from './pessoa-form.model';

describe('PessoaFormComponent', () => {
	let fixture: ComponentFixture<PessoaFormComponent>;
	let component: PessoaFormComponent;
	let httpMock: HttpTestingController;

	const cnpjDigits = '11222333000181';
	const brasilApiCnpjUrl = `https://brasilapi.com.br/api/cnpj/v1/${cnpjDigits}`;

	const cepDigits = '01001000';
	const brasilApiCepUrl = `https://brasilapi.com.br/api/cep/v2/${cepDigits}`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		fixture = TestBed.createComponent(PessoaFormComponent);
		component = fixture.componentInstance;
		httpMock = TestBed.inject(HttpTestingController);
		fixture.detectChanges();
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should start with the default empty value', () => {
		expect(component.value()).toEqual(EMPTY_PESSOA_FORM_VALUE);
	});

	it('should fill company fields when CNPJ lookup succeeds', () => {
		component.value.set({ ...EMPTY_PESSOA_FORM_VALUE, tipoPessoa: 'JURIDICA' });

		(component as unknown as { onDocumentoChange: (value: string) => void }).onDocumentoChange(cnpjDigits);

		const req = httpMock.expectOne(brasilApiCnpjUrl);
		req.flush({
			razao_social: 'Empresa Exemplo LTDA',
			nome_fantasia: 'Exemplo',
			email: 'contato@exemplo.com',
			ddd_telefone_1: '11999998888',
			cep: '01001000',
			uf: 'SP',
			municipio: 'São Paulo',
			logradouro: 'Praça da Sé',
			bairro: 'Sé',
			numero: '1',
			complemento: 'Lado ímpar',
		});

		const value = component.value();
		expect(value.razaoSocial).toBe('Empresa Exemplo LTDA');
		expect(value.nomeFantasia).toBe('Exemplo');
		expect(value.cidade).toBe('São Paulo');
		expect(value.numeroEndereco).toBe('1');
	});

	it('should show a warning when CNPJ lookup fails on every provider', () => {
		component.value.set({ ...EMPTY_PESSOA_FORM_VALUE, tipoPessoa: 'JURIDICA' });

		(component as unknown as { onDocumentoChange: (value: string) => void }).onDocumentoChange(cnpjDigits);

		httpMock.expectOne(brasilApiCnpjUrl).flush('error', { status: 500, statusText: 'Server Error' });
		httpMock.expectOne(`https://api.opencnpj.org/${cnpjDigits}`).flush('error', { status: 500, statusText: 'Server Error' });

		expect((component as unknown as { cnpjWarning: () => boolean }).cnpjWarning()).toBe(true);
	});

	it('should fill address fields when CEP lookup succeeds', () => {
		(component as unknown as { onCepChange: (value: string) => void }).onCepChange(cepDigits);

		const req = httpMock.expectOne(brasilApiCepUrl);
		req.flush({
			cep: '01001-000',
			state: 'SP',
			city: 'São Paulo',
			street: 'Praça da Sé',
			neighborhood: 'Sé',
		});

		const value = component.value();
		expect(value.cidade).toBe('São Paulo');
		expect(value.uf).toBe('SP');
		expect(value.logradouro).toBe('Praça da Sé');
	});

	it('should not trigger CNPJ lookup for tipo FISICA', () => {
		(component as unknown as { onDocumentoChange: (value: string) => void }).onDocumentoChange('11122233396');

		httpMock.expectNone(brasilApiCnpjUrl);
	});
});
