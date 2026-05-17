import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff, lucideLock, lucideMail } from '@ng-icons/lucide';
import { form, FormField, submit, required, email } from '@angular/forms/signals';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmButton } from 'src/app/shared/ui/button';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { HlmIcon } from 'src/app/shared/ui/icon';
import { HlmCheckbox } from 'src/app/shared/ui/checkbox';
import { HlmSpinner } from 'src/app/shared/ui/spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'zorde-login',
  standalone: true,
  imports: [
    FormField,
    RouterLink,
    NgIcon,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmIcon,
    HlmCheckbox,
    HlmSpinner,
  ],
  viewProviders: [provideIcons({ lucideEye, lucideEyeOff, lucideLock, lucideMail })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  /** Form model — never use null, use empty strings */
  protected readonly loginModel = signal({
    email: '',
    password: '',
    rememberMe: false,
  });

  /** Signal form with validation */
  protected readonly loginForm = form(this.loginModel, (s) => {
    required(s.email, { message: 'E-mail é obrigatório' });
    email(s.email, { message: 'E-mail inválido' });
    required(s.password, { message: 'Senha é obrigatória' });
  });

  /** UI state */
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly submitted = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.submitted.set(true);
    submit(this.loginForm, async (field, detail) => {
      this.isLoading.set(true);
      const model = this.loginModel();

      try {
        const tokens: any = await this.authService.login({ email: model.email, senha: model.password }).toPromise();
        this.authService.setTokens(tokens);
        toast.success('Login realizado com sucesso!');
        this.router.navigate(['/dashboard']);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao realizar login. Verifique suas credenciais.');
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}
