import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail } from '@ng-icons/lucide';
import { form, FormField, submit, required, email as emailValidator } from '@angular/forms/signals';
import { signal } from '@angular/core';

import { HlmButton } from 'src/app/shared/ui/button';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { HlmIcon } from 'src/app/shared/ui/icon';
import { HlmSpinner } from 'src/app/shared/ui/spinner';

@Component({
  selector: 'zorde-email-step',
  standalone: true,
  imports: [FormField, NgIcon, HlmButton, HlmInput, HlmLabel, HlmIcon, HlmSpinner],
  viewProviders: [provideIcons({ lucideMail })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './email-step.component.html',
})
export class EmailStepComponent {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly submitted = output<string>();
  readonly back = output<void>();

  private readonly emailModel = signal({ email: '' });

  protected readonly formSubmitted = signal(false);
  protected readonly emailForm = form(this.emailModel, (s) => {
    required(s.email, { message: 'E-mail é obrigatório' });
    emailValidator(s.email, { message: 'E-mail inválido' });
  });

  onSubmit(): void {
    this.formSubmitted.set(true);
    submit(this.emailForm, async () => {
      this.submitted.emit(this.emailModel().email);
    });
  }

  onBack(): void {
    this.back.emit();
  }
}
