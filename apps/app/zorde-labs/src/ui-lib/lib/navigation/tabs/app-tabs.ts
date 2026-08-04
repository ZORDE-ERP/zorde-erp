import { Component, input, model } from '@angular/core';

export interface AppTabItem {
	readonly id: string;
	readonly label: string;
}

@Component({
	selector: 'app-tabs',
	templateUrl: './app-tabs.html',
	host: {
		'(keydown)': 'onKeydown($event)',
	},
})
export class AppTabsComponent {
	public readonly tabs = input.required<readonly AppTabItem[]>();
	public readonly activeTab = model<string>('');

	protected selectTab(tab: AppTabItem): void {
		this.activeTab.set(tab.id);
	}

	protected onKeydown(event: KeyboardEvent): void {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
			return;
		}

		const items = this.tabs();
		if (items.length === 0) {
			return;
		}

		event.preventDefault();
		const currentIndex = items.findIndex((tab) => tab.id === this.activeTab());
		const delta = event.key === 'ArrowRight' ? 1 : -1;
		const nextIndex = (currentIndex + delta + items.length) % items.length;
		this.activeTab.set(items[nextIndex].id);
	}
}
