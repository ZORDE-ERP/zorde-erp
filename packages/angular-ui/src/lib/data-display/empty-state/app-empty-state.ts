import { Component, input } from '@angular/core';

@Component({
	selector: 'app-empty-state',
	templateUrl: './app-empty-state.html',
})
export class AppEmptyStateComponent {
	public readonly title = input.required<string>();
	public readonly description = input<string>();
}
