import { A11yModule } from '@angular/cdk/a11y';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

export type AppModalSize = 'sm' | 'md' | 'lg';

const MODAL_SIZE_CLASS: Record<AppModalSize, string> = {
	sm: 'max-w-lg',
	md: 'max-w-2xl',
	lg: 'max-w-5xl',
};

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
	/** Largura do dialog: `sm` (~32rem), `md` (~42rem), `lg` (~64rem). */
	public readonly size = input<AppModalSize>('md');

	public readonly closed = output<void>();

	private static nextId = 0;

	protected readonly titleId = `app-modal-title-${AppModalComponent.nextId++}`;
	protected readonly descriptionId = `app-modal-desc-${AppModalComponent.nextId}`;
	protected readonly previouslyFocused = signal<HTMLElement | null>(null);

	protected readonly dialogClasses = computed((): string =>
		joinClasses(
			'z-modal flex w-full max-h-[min(90vh,56rem)] flex-col rounded-xl border border-border bg-surface-elevated shadow-xl motion-safe:transition-opacity',
			MODAL_SIZE_CLASS[this.size()],
		),
	);

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
