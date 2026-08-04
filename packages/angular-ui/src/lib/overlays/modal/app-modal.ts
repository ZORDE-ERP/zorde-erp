import { A11yModule } from '@angular/cdk/a11y';
import { Component, effect, input, output, signal } from '@angular/core';

@Component({
	selector: 'app-modal',
	imports: [A11yModule],
	templateUrl: './app-modal.html',
})
export class AppModalComponent {
	public readonly open = input(false);
	public readonly title = input.required<string>();
	public readonly description = input<string>();
	public readonly closeOnBackdrop = input(true);

	public readonly closed = output<void>();

	private static nextId = 0;

	protected readonly titleId = `app-modal-title-${AppModalComponent.nextId++}`;
	protected readonly descriptionId = `app-modal-desc-${AppModalComponent.nextId}`;
	protected readonly previouslyFocused = signal<HTMLElement | null>(null);

	public constructor() {
		effect(() => {
			if (this.open()) {
				this.previouslyFocused.set(document.activeElement as HTMLElement | null);
				return;
			}

			const previous = this.previouslyFocused();
			previous?.focus();
		});
	}

	protected onBackdropClick(): void {
		if (!this.closeOnBackdrop()) {
			return;
		}
		this.closed.emit();
	}

	protected onDialogClick(event: MouseEvent): void {
		event.stopPropagation();
	}

	protected onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			this.closed.emit();
		}
	}
}
