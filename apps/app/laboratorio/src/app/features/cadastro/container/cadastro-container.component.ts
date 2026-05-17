import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';

import { AuthFacade } from '../../../core/auth/auth.facade';
import { EmailStepComponent } from '../components/email-step/email-step.component';
import { CodeStepComponent } from '../components/code-step/code-step.component';
import { UserDataStepComponent, UserDataFormValue } from '../components/user-data-step/user-data-step.component';

type CadastroStep = 'email' | 'code' | 'data';

@Component({
  selector: 'zorde-cadastro-container',
  standalone: true,
  imports: [EmailStepComponent, CodeStepComponent, UserDataStepComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cadastro-container.component.html'
})
export class CadastroContainerComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  protected readonly currentStep = signal<CadastroStep>('email');

  protected readonly loading = this.authFacade.loading;
  protected readonly error = this.authFacade.error;
  protected readonly cadastroEmail = this.authFacade.cadastroEmail;

  onEmailSubmitted(email: string): void {
    this.authFacade.cadastroEmail.set(email);
    this.authFacade.solicitarCadastro({ email }, (msg) => {
      toast.success(msg || 'Código enviado com sucesso!');
      this.currentStep.set('code');
    });
  }

  onCodeVerified(codigo: string): void {
    const email = this.cadastroEmail();
    if (!email) return;

    this.authFacade.verificarEmail({ email, codigo }, (msg) => {
      toast.success(msg || 'E-mail verificado com sucesso!');
      this.currentStep.set('data');
    });
  }

  onReenviarCodigo(): void {
    const email = this.cadastroEmail();
    if (!email) return;

    this.authFacade.reenviarCodigo({ email }, (msg) => {
      toast.success(msg || 'Código reenviado com sucesso!');
    });
  }

  onUserDataSubmitted(dados: UserDataFormValue): void {
    const email = this.cadastroEmail();
    if (!email) return;

    this.authFacade.cadastrarUsuario({
      email,
      ...dados
    }, (msg) => {
      toast.success(msg || 'Cadastro realizado com sucesso!');
      this.authFacade.clearCadastroState();
      this.router.navigate(['/login']);
    });
  }

  onBack(fromStep: CadastroStep): void {
    this.authFacade.error.set(null); // Clear previous errors when navigating back
    if (fromStep === 'email') {
      this.router.navigate(['/login']);
    } else if (fromStep === 'code') {
      this.currentStep.set('email');
    } else if (fromStep === 'data') {
      this.currentStep.set('code');
    }
  }
}
