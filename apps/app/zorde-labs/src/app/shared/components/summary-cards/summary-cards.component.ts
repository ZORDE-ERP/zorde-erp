import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
	LucideActivity,
	LucideBox,
	LucideCircleAlert,
	LucideCircleCheck,
	LucideCircleX,
	LucideClipboardList,
	LucideDynamicIcon,
	LucideLayers,
	LucidePackage,
	LucideUsers,
	provideLucideIcons,
} from '@lucide/angular';
import { AppCardImports } from '@repo/angular-ui';
import type { SummaryCardItem, SummaryCardVariant } from './summary-card-item.model';

const VARIANT_VALUE_CLASS: Record<SummaryCardVariant, string> = {
	default: 'text-text-primary',
	success: 'text-success',
	warning: 'text-warning',
	error: 'text-error',
	info: 'text-info',
};

const VARIANT_ICON_CLASS: Record<SummaryCardVariant, string> = {
	default: 'bg-primary/10 text-primary',
	success: 'bg-success-muted text-success-foreground',
	warning: 'bg-warning-muted text-warning-foreground',
	error: 'bg-error-muted text-error-foreground',
	info: 'bg-info-muted text-info-foreground',
};

@Component({
	selector: 'app-summary-cards',
	templateUrl: './summary-cards.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [...AppCardImports, LucideDynamicIcon],
	providers: [
		provideLucideIcons(
			LucideLayers,
			LucideCircleCheck,
			LucideCircleX,
			LucideCircleAlert,
			LucideUsers,
			LucidePackage,
			LucideBox,
			LucideClipboardList,
			LucideActivity,
		),
	],
})
export class SummaryCardsComponent {
	public readonly items = input<readonly SummaryCardItem[]>([]);
	public readonly cardClick = output<SummaryCardItem>();

	protected isClickable(item: SummaryCardItem): boolean {
		return item.clickable !== false;
	}

	protected valueClass(item: SummaryCardItem): string {
		return VARIANT_VALUE_CLASS[item.variant ?? 'default'];
	}

	protected iconClass(item: SummaryCardItem): string {
		return VARIANT_ICON_CLASS[item.variant ?? 'default'];
	}

	protected onCardActivate(item: SummaryCardItem): void {
		if (!this.isClickable(item)) {
			return;
		}
		this.cardClick.emit(item);
	}
}
