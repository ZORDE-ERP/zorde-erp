import { Component, ElementRef, inject, input, signal } from '@angular/core';

@Component({
	selector: 'app-popover',
	templateUrl: './app-popover.html',
	host: {
		class: 'relative inline-block',
		'(document:click)': 'onDocumentClick($event)',
		'(keydown.escape)': 'close()',
	},
})
export class AppPopoverComponent {
	private readonly elementRef = inject(ElementRef<HTMLElement>);

	public readonly label = input('Abrir');

	protected readonly open = signal(false);

	protected toggle(): void {
		this.open.update((value) => !value);
	}

	protected close(): void {
		this.open.set(false);
	}

	protected onDocumentClick(event: MouseEvent): void {
		if (!this.elementRef.nativeElement.contains(event.target as Node)) {
			this.close();
		}
	}
}
