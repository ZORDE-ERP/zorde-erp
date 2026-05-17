import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFilter, lucideChevronDown, lucideChevronUp } from '@ng-icons/lucide';

import { HlmCard, HlmCardHeader, HlmCardTitle } from 'src/app/shared/ui/card';
import { HlmButton } from 'src/app/shared/ui/button';
import { HlmIcon } from 'src/app/shared/ui/icon';

@Component({
  selector: 'app-filter-card',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmButton,
    HlmIcon,
  ],
  providers: [
    provideIcons({
      lucideFilter,
      lucideChevronDown,
      lucideChevronUp,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-card.component.html',
})
export class FilterCardComponent {
  readonly isExpanded = input<boolean>(false);
  readonly filterCleared = output<void>();
  readonly toggleExpanded = output<void>();

  onClearFilters(): void {
    this.filterCleared.emit();
  }

  onToggle(): void {
    this.toggleExpanded.emit();
  }
}
