import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUsers, lucideUserCheck, lucideUserX } from '@ng-icons/lucide';

import { HlmCard, HlmCardHeader, HlmCardTitle, HlmCardContent } from 'src/app/shared/ui/card';
import { HlmIcon } from 'src/app/shared/ui/icon';
import { SummaryCardItem } from './summary-card-item.model';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmIcon,
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucideUserCheck,
      lucideUserX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './summary-cards.component.html',
})
export class SummaryCardsComponent {
  readonly items = input<SummaryCardItem[]>([]);
}
