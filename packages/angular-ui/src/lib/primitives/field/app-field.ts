import { Component, input } from '@angular/core';

@Component({
	selector: 'app-field',
	templateUrl: './app-field.html',
})
export class AppFieldComponent {
	public readonly label = input.required<string>();
	public readonly htmlFor = input.required<string>();
	public readonly hint = input<string>();
	public readonly error = input<string>();
	public readonly required = input(false);
}
