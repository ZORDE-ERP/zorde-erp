import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type AppTabItem, AppTabsComponent } from './app-tabs';

@Component({
	selector: 'app-tabs-host',
	imports: [AppTabsComponent],
	template: `<app-tabs [tabs]="tabs" [(activeTab)]="activeTab" />`,
})
class HostComponent {
	public readonly tabs: readonly AppTabItem[] = [
		{ id: 'geral', label: 'Geral' },
		{ id: 'historico', label: 'Histórico' },
	];
	public activeTab = 'geral';
}

describe('AppTabsComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent],
		}).compileComponents();
	});

	it('should create', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should render one tab button per item', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
		expect(buttons.length).toBe(2);
	});

	it('should switch the active tab on click and update the model', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');

		(buttons[1] as HTMLButtonElement).click();
		fixture.detectChanges();

		expect(fixture.componentInstance.activeTab).toBe('historico');
	});

	it('should update aria-selected on the active tab', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();
		const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');

		expect((buttons[0] as HTMLButtonElement).getAttribute('aria-selected')).toBe('true');
		expect((buttons[1] as HTMLButtonElement).getAttribute('aria-selected')).toBe('false');

		(buttons[1] as HTMLButtonElement).click();
		fixture.detectChanges();

		expect((buttons[0] as HTMLButtonElement).getAttribute('aria-selected')).toBe('false');
		expect((buttons[1] as HTMLButtonElement).getAttribute('aria-selected')).toBe('true');
	});
});
