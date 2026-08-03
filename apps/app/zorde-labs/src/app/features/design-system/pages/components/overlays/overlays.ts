import { Component, computed, signal } from '@angular/core';
import {
	AppButtonDirective,
	AppModalComponent,
	type AppModalSize,
	AppPageLayoutComponent,
	AppPopoverComponent,
	AppPreviewBlockComponent,
	AppTooltipComponent,
} from '@repo/angular-ui';

@Component({
	selector: 'ds-overlays-page',
	imports: [
		AppPageLayoutComponent,
		AppPreviewBlockComponent,
		AppButtonDirective,
		AppModalComponent,
		AppPopoverComponent,
		AppTooltipComponent,
	],
	templateUrl: './overlays.html',
})
export class OverlaysPage {
	protected readonly modalOpen = signal(false);
	protected readonly modalSize = signal<AppModalSize>('md');

	protected readonly modalTitle = computed((): string => {
		const labels: Record<AppModalSize, string> = {
			sm: 'Modal pequeno',
			md: 'Modal médio',
			lg: 'Modal grande',
		};
		return labels[this.modalSize()];
	});

	protected openModal(size: AppModalSize): void {
		this.modalSize.set(size);
		this.modalOpen.set(true);
	}

	protected closeModal(): void {
		this.modalOpen.set(false);
	}
}
