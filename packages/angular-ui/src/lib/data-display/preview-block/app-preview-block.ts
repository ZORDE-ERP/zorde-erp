import { Component, input } from '@angular/core';

@Component({
	selector: 'app-preview-block',
	templateUrl: './app-preview-block.html',
})
export class AppPreviewBlockComponent {
	public readonly title = input.required<string>();
	public readonly description = input<string>();
}
