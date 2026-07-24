import { Component, input } from '@angular/core';

@Component({
	selector: 'app-card',
	templateUrl: './app-card.html',
})
export class AppCardComponent {
	public readonly title = input<string>();
	public readonly description = input<string>();
	public readonly elevated = input(false);
}
