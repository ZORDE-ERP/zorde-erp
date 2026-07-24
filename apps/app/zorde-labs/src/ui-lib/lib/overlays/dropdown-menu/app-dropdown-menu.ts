import { CdkConnectedOverlay, CdkOverlayOrigin, type ConnectedPosition } from '@angular/cdk/overlay';
import { Component, input, output, signal, viewChild } from '@angular/core';
import { AppButtonDirective } from '../../primitives/button/app-button';

export interface AppDropdownItem {
	readonly label: string;
	readonly value: string;
	readonly disabled?: boolean;
}

@Component({
	selector: 'app-dropdown-menu',
	imports: [AppButtonDirective, CdkOverlayOrigin, CdkConnectedOverlay],
	templateUrl: './app-dropdown-menu.html',
	host: {
		class: 'relative inline-block',
		'(keydown)': 'onKeydown($event)',
	},
})
export class AppDropdownMenuComponent {
	private readonly trigger = viewChild.required(CdkOverlayOrigin);

	public readonly label = input('Menu');
	public readonly items = input.required<readonly AppDropdownItem[]>();
	public readonly itemSelected = output<AppDropdownItem>();

	protected readonly open = signal(false);
	protected readonly activeIndex = signal(0);

	protected readonly positions: ConnectedPosition[] = [
		{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
		{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
		{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
		{ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
	];

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

	/** Fecha ao clicar fora, mas ignora o botão trigger (o toggle cuida disso). */
	protected onOutsideClick(event: MouseEvent): void {
		const originEl = this.trigger().elementRef.nativeElement as HTMLElement;
		if (originEl.contains(event.target as Node)) {
			return;
		}
		this.close();
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
