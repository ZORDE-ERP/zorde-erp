import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { HlmSkeleton } from 'src/app/shared/ui/skeleton';
import { ClosingItem } from '../../models/dashboard.models';

@Component({
  selector: 'app-closings-ranking',
  standalone: true,
  imports: [
    ...BrnSelectImports,
    ...HlmSelectImports,
    HlmSkeleton,
  ],
  templateUrl: './closings-ranking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosingsRankingComponent {
  readonly items = input<ClosingItem[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly monthOptions = input<{ label: string; value: string }[]>([]);
  readonly selectedMonth = input<string>('');

  readonly monthSelected = output<string>();

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  onMonthChange(value: string | undefined): void {
    if (value) {
      this.monthSelected.emit(value);
    }
  }
}
