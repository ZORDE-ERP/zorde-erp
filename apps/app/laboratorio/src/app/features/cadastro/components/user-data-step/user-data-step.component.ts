import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { form, FormField, submit, required, minLength, email as emailValidator } from '@angular/forms/signals';


import { HlmButton } from 'src/app/shared/ui/button';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { HlmIcon } from 'src/app/shared/ui/icon';
import { HlmSpinner } from 'src/app/shared/ui/spinner';

export interface UserDataFormValue {
  nome: string;
  documento: string;
  contato: string;
  senha: string;
}

@Component({
  selector: 'zorde-user-data-step',
  standalone: true,
  imports: [FormField, NgIcon, HlmButton, HlmInput, HlmLabel, HlmIcon, HlmSpinner],
  viewProviders: [provideIcons({ lucideEye, lucideEyeOff })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-data-step.component.html',
})
export class UserDataStepComponent {
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly submitted = output<UserDataFormValue>();
  readonly back = output<void>();

  protected readonly showPassword = signal(false);
  protected readonly senhaConfirmacao = signal('');

  onSenhaConfirmacaoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.senhaConfirmacao.set(input.value);
  }

  protected readonly userModel = signal({
    nome: '',
    documento: '',
    contato: '',
    senha: '',
  });

  protected readonly formSubmitted = signal(false);
  protected readonly userForm = form(this.userModel, (s) => {
    required(s.nome, { message: 'Nome é obrigatório' });
    required(s.documento, { message: 'Documento é obrigatório' });
    required(s.contato, { message: 'Contato é obrigatório' });
    required(s.senha, { message: 'Senha é obrigatória' });
    minLength(s.senha, 6, { message: 'Senha deve ter no mínimo 6 caracteres' });
  });

  onSubmit(): void {
    this.formSubmitted.set(true);
    if (this.senhaConfirmacao() !== this.userModel().senha) return;
    submit(this.userForm, async () => {
      this.submitted.emit({ ...this.userModel() });
    });
  }

  onBack(): void {
    this.back.emit();
  }
}
