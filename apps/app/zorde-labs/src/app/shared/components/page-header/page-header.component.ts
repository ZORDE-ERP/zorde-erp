import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
	selector: 'app-page-header',
	templateUrl: './page-header.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
	public readonly title = input.required<string>();
	public readonly description = input<string>();
}
