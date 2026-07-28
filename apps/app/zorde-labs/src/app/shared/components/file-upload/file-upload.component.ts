import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import {
	LucideDynamicIcon,
	LucideImagePlus,
	LucideTrash2,
	LucideUpload,
	provideLucideIcons,
} from '@lucide/angular';
import { AppButtonDirective, AppIconButtonDirective, AppSpinnerComponent } from '@repo/angular-ui';

@Component({
	selector: 'app-file-upload',
	templateUrl: './file-upload.component.html',
	providers: [provideLucideIcons(LucideImagePlus, LucideTrash2, LucideUpload)],
	imports: [AppButtonDirective, AppIconButtonDirective, AppSpinnerComponent, LucideDynamicIcon],
})
export class FileUploadComponent {
	private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

	public readonly previewUrl = input<string | null>(null);
	public readonly accept = input('image/jpeg,image/png,image/webp,image/svg+xml');
	public readonly disabled = input(false);
	public readonly loading = input(false);
	public readonly label = input('Logo / imagem');

	public readonly fileSelected = output<File>();
	public readonly cleared = output<void>();

	private readonly localPreview = signal<string | null>(null);

	protected readonly displayPreview = computed(() => this.localPreview() ?? this.previewUrl());

	protected openPicker(): void {
		if (this.disabled() || this.loading()) {
			return;
		}
		this.fileInput()?.nativeElement.click();
	}

	protected onFileChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) {
			return;
		}

		const previous = this.localPreview();
		if (previous) {
			URL.revokeObjectURL(previous);
		}
		this.localPreview.set(URL.createObjectURL(file));
		this.fileSelected.emit(file);
	}

	protected clear(): void {
		if (this.disabled() || this.loading()) {
			return;
		}
		const previous = this.localPreview();
		if (previous) {
			URL.revokeObjectURL(previous);
		}
		this.localPreview.set(null);
		this.cleared.emit();
	}
}
