import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppPopoverComponent } from './app-popover';

@Component({
	selector: 'app-popover-host',
	imports: [AppPopoverComponent],
	template: `
		<app-popover label="Abrir">
			<p id="popover-body">Conteúdo projetado</p>
		</app-popover>
		<button type="button" id="outside">outside</button>
	`,
})
class HostComponent {}

describe('AppPopoverComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent],
		}).compileComponents();
	});

	afterEach(() => {
		document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
	});

	it('should project content into the CDK overlay and close on outside click', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();

		const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-haspopup="dialog"]');
		trigger.click();
		fixture.detectChanges();

		const body = document.querySelector('#popover-body');
		expect(body).not.toBeNull();
		expect(body!.textContent!.trim()).toBe('Conteúdo projetado');

		const outside: HTMLButtonElement = fixture.nativeElement.querySelector('#outside');
		outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		fixture.detectChanges();

		expect(document.querySelector('#popover-body')).toBeNull();
	});
});
