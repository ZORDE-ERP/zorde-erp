import { CdkConnectedOverlay, CdkOverlayOrigin, type ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, input, model, output, signal, viewChild } from '@angular/core';

export interface AppSearchableSelectOption {
	readonly value: string | number;
	readonly label: string;
}

@Component({
	selector: 'app-searchable-select',
	imports: [CdkOverlayOrigin, CdkConnectedOverlay],
	templateUrl: './app-searchable-select.html',
	host: {
		class: 'relative inline-block w-full',
		'(keydown.escape)': 'close()',
	},
})
export class AppSearchableSelectComponent {
	private readonly trigger = viewChild.required(CdkOverlayOrigin);

	public readonly options = input<readonly AppSearchableSelectOption[]>([]);
	public readonly value = model<string | number | null>(null);
	public readonly placeholder = input('Buscar...');
	public readonly disabled = input(false);
	public readonly emptyMessage = input('Nenhum resultado');
	/** Quando false, a lista já vem filtrada do servidor e o filtro local é desativado. */
	public readonly filterLocally = input(true);

	public readonly queryChange = output<string>();

	protected readonly open = signal(false);
	protected readonly query = signal('');
	protected readonly overlayWidth = signal(0);

	protected readonly positions: ConnectedPosition[] = [
		{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
		{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
	];

	protected readonly selectedLabel = computed((): string => {
		const selected = this.options().find((option) => option.value === this.value());
		return selected?.label ?? '';
	});

	protected readonly displayValue = computed((): string => (this.open() ? this.query() : this.selectedLabel()));

	protected readonly filteredOptions = computed((): readonly AppSearchableSelectOption[] => {
		if (!this.filterLocally()) {
			return this.options();
		}
		const term = this.query().trim().toLowerCase();
		if (!term) {
			return this.options();
		}
		return this.options().filter((option) => option.label.toLowerCase().includes(term));
	});

	protected openList(): void {
		if (this.disabled()) {
			return;
		}
		this.syncOverlayWidth();
		this.query.set('');
		this.open.set(true);
	}

	protected onInput(event: Event): void {
		if (this.disabled()) {
			return;
		}
		const text = (event.target as HTMLInputElement).value;
		this.query.set(text);

		if (!text.trim()) {
			this.value.set(null);
		}

		this.syncOverlayWidth();
		this.open.set(true);
		this.queryChange.emit(text);
	}

	protected onKeydown(event: KeyboardEvent): void {
		if (this.disabled() || event.key !== 'ArrowDown') {
			return;
		}
		event.preventDefault();
		this.openList();
	}

	protected selectOption(option: AppSearchableSelectOption): void {
		this.value.set(option.value);
		this.close();
	}

	protected close(): void {
		this.open.set(false);
		this.query.set('');
	}

	/** Fecha ao clicar fora, mas ignora o input trigger (abrir/digitar cuida disso). */
	protected onOutsideClick(event: MouseEvent): void {
		const originEl = this.trigger().elementRef.nativeElement as HTMLElement;
		if (originEl.contains(event.target as Node)) {
			return;
		}
		this.close();
	}

	private syncOverlayWidth(): void {
		const originEl = this.trigger().elementRef.nativeElement as HTMLElement;
		this.overlayWidth.set(originEl.getBoundingClientRect().width);
	}
}
