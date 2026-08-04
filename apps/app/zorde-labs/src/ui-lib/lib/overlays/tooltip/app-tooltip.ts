import { Component, input } from '@angular/core';

export type AppTooltipPlacement = 'top' | 'bottom';

@Component({
	selector: 'app-tooltip',
	templateUrl: './app-tooltip.html',
})
export class AppTooltipComponent {
	public readonly text = input.required<string>();
	public readonly placement = input<AppTooltipPlacement>('top');
}
