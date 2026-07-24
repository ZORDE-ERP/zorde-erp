import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ClienteSelectComponent } from './cliente-select.component';

@Component({
	selector: 'app-cliente-select-host',
	imports: [ClienteSelectComponent],
	template: `<app-cliente-select [(value)]="value" />`,
})
class HostComponent {
	public value: number | null = null;
}

describe('ClienteSelectComponent', () => {
	let fixture: ComponentFixture<HostComponent>;
	let httpMock: HttpTestingController;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent],
			providers: [provideHttpClient(), provideHttpClientTesting()],
		}).compileComponents();

		httpMock = TestBed.inject(HttpTestingController);
		fixture = TestBed.createComponent(HostComponent);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should load clientes and map them to searchable-select options', () => {
		fixture.detectChanges();

		const req = httpMock.expectOne(`${environment.baseUrl}clientes`);
		req.flush([
			{ id: 1, nome: 'João Silva' },
			{ id: 2, nome: 'Maria Souza' },
		]);
		fixture.detectChanges();

		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
		input.dispatchEvent(new FocusEvent('focus'));
		fixture.detectChanges();

		const options = fixture.nativeElement.querySelectorAll('button[role="option"]');
		expect(options.length).toBe(2);
		expect(options[0].textContent.trim()).toBe('João Silva');
		expect(options[1].textContent.trim()).toBe('Maria Souza');
	});

	it('should select a cliente and update the value model', () => {
		fixture.detectChanges();
		httpMock.expectOne(`${environment.baseUrl}clientes`).flush([{ id: 7, nome: 'Cliente Selecionado' }]);
		fixture.detectChanges();

		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
		input.dispatchEvent(new FocusEvent('focus'));
		fixture.detectChanges();

		const option: HTMLButtonElement = fixture.nativeElement.querySelector('button[role="option"]');
		option.click();
		fixture.detectChanges();

		expect(fixture.componentInstance.value).toBe(7);
	});
});
