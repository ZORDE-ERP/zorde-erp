import { Component, signal } from '@angular/core';
import type { AppTabItem } from '@repo/angular-ui';
import { AppPageLayoutComponent, AppPreviewBlockComponent, AppTabsComponent } from '@repo/angular-ui';

@Component({
	selector: 'ds-tabs-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent, AppTabsComponent],
	templateUrl: './tabs.html',
})
export class TabsPage {
	protected readonly orderTabs: readonly AppTabItem[] = [
		{ id: 'geral', label: 'Geral' },
		{ id: 'itens', label: 'Itens' },
		{ id: 'historico', label: 'Histórico' },
	];

	protected readonly activeOrderTab = signal('geral');
}
