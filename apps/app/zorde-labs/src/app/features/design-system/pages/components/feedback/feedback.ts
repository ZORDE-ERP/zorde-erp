import { Component, inject } from '@angular/core';
import type { AppToastVariant } from '@repo/angular-ui';
import {
	AppAlertComponent,
	AppBadgeComponent,
	AppButtonDirective,
	AppPageLayoutComponent,
	AppPreviewBlockComponent,
	AppSkeletonComponent,
	AppSpinnerComponent,
	AppToastService,
} from '@repo/angular-ui';

@Component({
	selector: 'ds-feedback-page',
	imports: [
		AppPageLayoutComponent,
		AppPreviewBlockComponent,
		AppButtonDirective,
		AppAlertComponent,
		AppSpinnerComponent,
		AppSkeletonComponent,
		AppBadgeComponent,
	],
	templateUrl: './feedback.html',
})
export class FeedbackPage {
	private readonly toastService = inject(AppToastService);

	protected showToast(variant: AppToastVariant): void {
		const messages: Record<AppToastVariant, string> = {
			success: 'Operação concluída com sucesso.',
			error: 'Não foi possível concluir a operação.',
			warning: 'Revise os dados antes de continuar.',
			info: 'Nova atualização disponível.',
		};

		this.toastService.show(messages[variant], variant);
	}
}
