import { CdkConnectedOverlay, CdkOverlayOrigin, type ConnectedPosition } from '@angular/cdk/overlay';
import { Component, input, signal, viewChild } from '@angular/core';

@Component({
	selector: 'app-popover',
	imports: [CdkOverlayOrigin, CdkConnectedOverlay],
	templateUrl: './app-popover.html',
	host: {
		class: 'relative inline-block',
		'(keydown.escape)': 'close()',
	},
})
export class AppPopoverComponent {
	private readonly trigger = viewChild.required(CdkOverlayOrigin);

	public readonly label = input('Abrir');

	protected readonly open = signal(false);

	protected readonly positions: ConnectedPosition[] = [
		{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
		{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
	];

	protected toggle(): void {
		this.open.update((value) => !value);
	}

	protected close(): void {
		this.open.set(false);
	}

	/** Fecha ao clicar fora, mas ignora o botão trigger (o toggle cuida disso). */
	protected onOutsideClick(event: MouseEvent): void {
		const originEl = this.trigger().elementRef.nativeElement as HTMLElement;
		if (originEl.contains(event.target as Node)) {
			return;
		}
		this.close();
	}
}
