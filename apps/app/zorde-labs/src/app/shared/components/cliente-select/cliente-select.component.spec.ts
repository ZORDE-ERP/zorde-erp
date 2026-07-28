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

function listUrl(search = ''): string {
	const params = new URLSearchParams({ page: '1', limit: '20' });
	if (search) {
		params.set('search', search);
	}
	return `${environment.baseUrl}clientes?${params.toString()}`;
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
		document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
		httpMock.verify();
	});

	it('should load clientes and map them to searchable-select options', () => {
		fixture.detectChanges();

		const req = httpMock.expectOne(listUrl());
		req.flush({
			items: [
				{ id: 1, nome: 'João Silva' },
				{ id: 2, nome: 'Maria Souza' },
			],
			total: 2,
			counts: { total: 2, ativos: 2, inativos: 0 },
		});
		fixture.detectChanges();

		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
		input.dispatchEvent(new MouseEvent('click'));
		fixture.detectChanges();

		const options = document.querySelectorAll('button[role="option"]');
		expect(options.length).toBe(2);
		expect(options[0].textContent?.trim()).toBe('João Silva');
		expect(options[1].textContent?.trim()).toBe('Maria Souza');
	});

	it('should select a cliente and update the value model', () => {
		fixture.detectChanges();
		httpMock.expectOne(listUrl()).flush({
			items: [{ id: 7, nome: 'Cliente Selecionado' }],
			total: 1,
			counts: { total: 1, ativos: 1, inativos: 0 },
		});
		fixture.detectChanges();

		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
		input.dispatchEvent(new MouseEvent('click'));
		fixture.detectChanges();

		const option = document.querySelector('button[role="option"]') as HTMLButtonElement;
		option.click();
		fixture.detectChanges();

		expect(fixture.componentInstance.value).toBe(7);
	});
});
