import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

import { HlmButton } from 'src/app/shared/ui/button';
import { HlmSpinner } from 'src/app/shared/ui/spinner';

@Component({
  selector: 'zorde-code-step',
  standalone: true,
  imports: [HlmButton, HlmSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-step.component.html',
})
export class CodeStepComponent implements OnInit {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly email = input('');

  readonly verified = output<string>();
  readonly reenviar = output<void>();
  readonly back = output<void>();

  protected readonly slots = [0, 1, 2, 3, 4, 5];
  protected readonly otpDigits = signal<string[]>(['', '', '', '', '', '']);
  protected readonly countdown = signal(0);

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.startCountdown();
  }

  protected isComplete(): boolean {
    return this.otpDigits().every(d => d.length === 1);
  }

  protected onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.otpDigits.update(digits => {
      const newDigits = [...digits];
      newDigits[index] = value.slice(-1);
      return newDigits;
    });
    input.value = this.otpDigits()[index];
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits()[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  protected onSubmit(): void {
    if (!this.isComplete()) return;
    this.verified.emit(this.otpDigits().join(''));
  }

  protected onReenviar(): void {
    this.otpDigits.set(['', '', '', '', '', '']);
    this.reenviar.emit();
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdown.set(30);
    interval(1000)
      .pipe(take(30), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.countdown.update(v => v - 1));
  }

  onBack(): void {
    this.back.emit();
  }
}
