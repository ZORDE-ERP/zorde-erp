import { Component, inject } from '@angular/core';
import { AppToastService } from './toast.service';

@Component({
	selector: 'app-toast-container',
	templateUrl: './app-toast-container.html',
})
export class AppToastContainerComponent {
	protected readonly toastService = inject(AppToastService);
}
