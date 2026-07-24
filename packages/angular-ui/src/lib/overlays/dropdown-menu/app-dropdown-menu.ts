import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { AppButtonDirective } from '../../primitives/button/app-button';

export interface AppDropdownItem {
	readonly label: string;
	readonly value: string;
	readonly disabled?: boolean;
}

@Component({
	selector: 'app-dropdown-menu',
	imports: [AppButtonDirective],
	templateUrl: './app-dropdown-menu.html',
	host: {
		class: 'relative inline-block',
		'(document:click)': 'onDocumentClick($event)',
		'(keydown)': 'onKeydown($event)',
	},
})
export class AppDropdownMenuComponent {
	private readonly elementRef = inject(ElementRef<HTMLElement>);

	public readonly label = input('Menu');
	public readonly items = input.required<readonly AppDropdownItem[]>();
	public readonly itemSelected = output<AppDropdownItem>();

	protected readonly open = signal(false);
	protected readonly activeIndex = signal(0);

	protected toggle(): void {
		this.open.update((value) => !value);
		if (this.open()) {
			this.activeIndex.set(0);
		}
	}

	protected close(): void {
		this.open.set(false);
	}

	protected selectItem(item: AppDropdownItem): void {
		if (item.disabled) {
			return;
		}
		this.itemSelected.emit(item);
		this.close();
	}

	protected onDocumentClick(event: MouseEvent): void {
		if (!this.elementRef.nativeElement.contains(event.target as Node)) {
			this.close();
		}
	}

	protected onKeydown(event: KeyboardEvent): void {
		if (!this.open()) {
			if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				this.open.set(true);
			}
			return;
		}

		const enabled = this.items().filter((item) => !item.disabled);
		if (enabled.length === 0) {
			return;
		}

		switch (event.key) {
			case 'Escape':
				event.preventDefault();
				this.close();
				break;
			case 'ArrowDown':
				event.preventDefault();
				this.activeIndex.update((index) => (index + 1) % enabled.length);
				break;
			case 'ArrowUp':
				event.preventDefault();
				this.activeIndex.update((index) => (index - 1 + enabled.length) % enabled.length);
				break;
			case 'Enter':
			case ' ': {
				event.preventDefault();
				const item = enabled[this.activeIndex()];
				if (item) {
					this.selectItem(item);
				}
				break;
			}
			default:
				break;
		}
	}
}
