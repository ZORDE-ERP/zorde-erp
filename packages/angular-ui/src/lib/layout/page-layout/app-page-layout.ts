import { Component, input } from '@angular/core';

@Component({
	selector: 'app-page-layout',
	templateUrl: './app-page-layout.html',
})
export class AppPageLayoutComponent {
	public readonly title = input.required<string>();
	public readonly description = input<string>();
}
