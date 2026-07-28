import { A11yModule } from '@angular/cdk/a11y';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { AppButtonDirective } from '../../primitives/button/app-button';
import { joinClasses } from '../../utils/join-classes';

export type AppModalSize = 'sm' | 'md' | 'lg';

const MODAL_SIZE_CLASS: Record<AppModalSize, string> = {
	sm: 'max-w-lg',
	md: 'max-w-2xl',
	lg: 'max-w-5xl',
};

@Component({
	selector: 'app-modal',
	imports: [A11yModule, AppButtonDirective],
	templateUrl: './app-modal.html',
})
export class AppModalComponent {
	public readonly open = input(false);
	public readonly title = input.required<string>();
	public readonly description = input<string>();
	public readonly closeOnBackdrop = input(true);
	/** Largura do dialog: `sm` (~32rem), `md` (~42rem), `lg` (~64rem). */
	public readonly size = input<AppModalSize>('md');

	/**
	 * Rótulo do botão secundário.
	 * - `undefined` (padrão): exibe "Cancelar" quando `confirmLabel` está definido.
	 * - `string`: força o rótulo (ex.: "Fechar").
	 * - `null`: oculta o botão secundário.
	 */
	public readonly cancelLabel = input<string | null | undefined>(undefined);
	/**
	 * Rótulo do botão primário. Quando informado, o footer padrão (Cancelar + Confirmar) é exibido
	 * com gap e layout responsivo. Para footer totalmente customizado, omita e use `[modal-actions]`.
	 */
	public readonly confirmLabel = input<string | null>(null);
	public readonly confirmLoading = input(false);
	public readonly confirmDisabled = input(false);
	public readonly cancelDisabled = input(false);

	public readonly closed = output<void>();
	public readonly confirmed = output<void>();

	private static nextId = 0;

	protected readonly titleId = `app-modal-title-${AppModalComponent.nextId++}`;
	protected readonly descriptionId = `app-modal-desc-${AppModalComponent.nextId}`;
	protected readonly previouslyFocused = signal<HTMLElement | null>(null);

	protected readonly resolvedCancelLabel = computed((): string | null => {
		const explicit = this.cancelLabel();
		if (explicit === null) {
			return null;
		}
		if (explicit !== undefined) {
			return explicit;
		}
		return this.confirmLabel() !== null ? 'Cancelar' : null;
	});

	protected readonly hasBuiltInActions = computed(
		(): boolean => this.resolvedCancelLabel() !== null || this.confirmLabel() !== null,
	);

	protected readonly dialogClasses = computed((): string =>
		joinClasses(
			'z-modal flex w-full max-h-[min(90vh,56rem)] flex-col rounded-sm-xl border border-border bg-surface-elevated shadow-xl motion-safe:transition-opacity',
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

	protected onCancelClick(): void {
		if (this.cancelDisabled() || this.confirmLoading()) {
			return;
		}
		this.closed.emit();
	}

	protected onConfirmClick(): void {
		if (this.confirmDisabled() || this.confirmLoading()) {
			return;
		}
		this.confirmed.emit();
	}
}
