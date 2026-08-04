import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToastContainerComponent } from '@repo/angular-ui';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, AppToastContainerComponent],
	templateUrl: './app.html',
	styleUrl: './app.css',
})
export class App {
	protected readonly title = signal('zorde-labs');
}
