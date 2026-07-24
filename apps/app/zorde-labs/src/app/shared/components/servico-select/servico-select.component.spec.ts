import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ServicoSelectComponent } from './servico-select.component';

@Component({
	selector: 'app-servico-select-host',
	imports: [ServicoSelectComponent],
	template: `<app-servico-select [(value)]="value" />`,
})
class HostComponent {
	public value: number | null = null;
}

describe('ServicoSelectComponent', () => {
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

	it('should load servicos with a high limit and map them to searchable-select options', () => {
		fixture.detectChanges();

		const req = httpMock.expectOne(`${environment.baseUrl}servico?page=1&limit=200`);
		expect(req.request.method).toBe('GET');
		req.flush({
			items: [
				{ id: 1, nome: 'Montagem Simples' },
				{ id: 2, nome: 'Montagem Parafuso' },
			],
			total: 2,
		});
		fixture.detectChanges();

		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
		input.dispatchEvent(new FocusEvent('focus'));
		fixture.detectChanges();

		const options = fixture.nativeElement.querySelectorAll('button[role="option"]');
		expect(options.length).toBe(2);
		expect(options[0].textContent.trim()).toBe('Montagem Simples');
		expect(options[1].textContent.trim()).toBe('Montagem Parafuso');
	});

	it('should select a servico and update the value model', () => {
		fixture.detectChanges();
		httpMock
			.expectOne(`${environment.baseUrl}servico?page=1&limit=200`)
			.flush({ items: [{ id: 9, nome: 'Montagem Transposição' }], total: 1 });
		fixture.detectChanges();

		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
		input.dispatchEvent(new FocusEvent('focus'));
		fixture.detectChanges();

		const option: HTMLButtonElement = fixture.nativeElement.querySelector('button[role="option"]');
		option.click();
		fixture.detectChanges();

		expect(fixture.componentInstance.value).toBe(9);
	});
});
