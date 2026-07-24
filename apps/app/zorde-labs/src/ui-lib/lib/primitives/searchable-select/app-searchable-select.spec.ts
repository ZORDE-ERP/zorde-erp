import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppSearchableSelectComponent, type AppSearchableSelectOption } from './app-searchable-select';

@Component({
	selector: 'app-searchable-select-host',
	imports: [AppSearchableSelectComponent],
	template: `
		<app-searchable-select [options]="options" [(value)]="value" />
		<button type="button" id="outside">outside</button>
	`,
})
class HostComponent {
	public readonly options: readonly AppSearchableSelectOption[] = [
		{ value: 'sp', label: 'São Paulo' },
		{ value: 'rj', label: 'Rio de Janeiro' },
		{ value: 'mg', label: 'Minas Gerais' },
	];
	public value: string | number | null = null;
}

function queryListbox(): HTMLElement | null {
	return document.querySelector('[role="listbox"]');
}

describe('AppSearchableSelectComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent],
		}).compileComponents();
	});

	afterEach(() => {
		document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
	});

	it('should create', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should not open the list on focus alone', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

		input.dispatchEvent(new FocusEvent('focus'));
		fixture.detectChanges();

		expect(queryListbox()).toBeNull();
	});

	it('should open the list on click', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

		input.dispatchEvent(new MouseEvent('click'));
		fixture.detectChanges();

		const listbox = queryListbox();
		expect(listbox).not.toBeNull();
		expect(listbox!.querySelectorAll('button[role="option"]').length).toBe(3);
	});

	it('should filter options as the user types', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

		input.dispatchEvent(new MouseEvent('click'));
		input.value = 'rio';
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		const options = queryListbox()!.querySelectorAll('button[role="option"]');
		expect(options.length).toBe(1);
		expect(options[0].textContent!.trim()).toBe('Rio de Janeiro');
	});

	it('should select an option, update the value model and close the list', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

		input.dispatchEvent(new MouseEvent('click'));
		fixture.detectChanges();

		const options = queryListbox()!.querySelectorAll('button[role="option"]');
		(options[1] as HTMLButtonElement).click();
		fixture.detectChanges();

		expect(fixture.componentInstance.value).toBe('rj');
		expect(queryListbox()).toBeNull();
		expect(input.value).toBe('Rio de Janeiro');
	});

	it('should show the empty message when no option matches the query', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

		input.dispatchEvent(new MouseEvent('click'));
		input.value = 'zzz';
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		const emptyOption = queryListbox()!.querySelector('[role="option"][aria-disabled="true"]');
		expect(emptyOption!.textContent!.trim()).toBe('Nenhum resultado');
	});

	it('should close the list when clicking outside', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
		const outside: HTMLButtonElement = fixture.nativeElement.querySelector('#outside');

		input.dispatchEvent(new MouseEvent('click'));
		fixture.detectChanges();
		expect(queryListbox()).not.toBeNull();

		outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		fixture.detectChanges();

		expect(queryListbox()).toBeNull();
	});

	it('should clear the value when the input is emptied and close on outside click', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.componentInstance.value = 'rj';
		fixture.detectChanges();
		const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
		const outside: HTMLButtonElement = fixture.nativeElement.querySelector('#outside');

		input.dispatchEvent(new MouseEvent('click'));
		input.value = 'rio';
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		input.value = '';
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		expect(fixture.componentInstance.value).toBeNull();
		expect(queryListbox()).not.toBeNull();

		outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		fixture.detectChanges();

		expect(queryListbox()).toBeNull();
		expect(input.value).toBe('');
	});
});
