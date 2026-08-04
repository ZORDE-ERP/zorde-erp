import { Component, input } from '@angular/core';

export type AppSpinnerSize = 'sm' | 'md' | 'lg';

@Component({
	selector: 'app-spinner',
	templateUrl: './app-spinner.html',
})
export class AppSpinnerComponent {
	public readonly size = input<AppSpinnerSize>('md');
	public readonly label = input('Carregando');
}
