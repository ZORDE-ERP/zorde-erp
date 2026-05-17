import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '../../shared/ui/button/src';
import { 
  HlmCard, 
  HlmCardHeader, 
  HlmCardTitle, 
  HlmCardDescription, 
  HlmCardContent, 
  HlmCardFooter 
} from '../../shared/ui/card/src';
import { HlmBadge } from '../../shared/ui/badge/src';
import { HlmInput } from '../../shared/ui/input/src';
import { HlmLabel } from '../../shared/ui/label/src';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    CommonModule,
    HlmButton,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardContent,
    HlmCardFooter,
    HlmBadge,
    HlmInput,
    HlmLabel
  ],
  template: `
    <div class="p-8 max-w-4xl mx-auto space-y-12">
      <header class="space-y-2">
        <h1 class="text-4xl font-bold tracking-tight">Spartan UI Test Page</h1>
        <p class="text-muted-foreground text-lg">Verificando a renderização dos componentes e o sistema de temas.</p>
      </header>

      <!-- Seção de Botões -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold border-b pb-2">Botões (Variants)</h2>
        <div class="flex flex-wrap gap-4">
          <button hlmBtn variant="default">Default</button>
          <button hlmBtn variant="secondary">Secondary</button>
          <button hlmBtn variant="destructive">Destructive</button>
          <button hlmBtn variant="outline">Outline</button>
          <button hlmBtn variant="ghost">Ghost</button>
          <button hlmBtn variant="link">Link</button>
        </div>
      </section>

      <!-- Seção de Badges -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold border-b pb-2">Badges</h2>
        <div class="flex flex-wrap gap-4">
          <span hlmBadge>Default</span>
          <span hlmBadge variant="secondary">Secondary</span>
          <span hlmBadge variant="destructive">Destructive</span>
          <span hlmBadge variant="outline">Outline</span>
        </div>
      </section>

      <!-- Seção de Cards -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold border-b pb-2">Cards & Formulário</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <section hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Dados do Laboratório</h3>
              <p hlmCardDescription>Preencha as informações básicas para o teste.</p>
            </div>
            <div hlmCardContent class="space-y-4">
              <div class="grid gap-2">
                <label hlmLabel for="lab-name">Nome do Lab</label>
                <input hlmInput id="lab-name" placeholder="Ex: Zorde Central" />
              </div>
              <div class="grid gap-2">
                <label hlmLabel for="lab-email">E-mail</label>
                <input hlmInput id="lab-email" type="email" placeholder="contato@zorde.com" />
              </div>
            </div>
            <div hlmCardFooter class="flex justify-end gap-2">
              <button hlmBtn variant="outline">Cancelar</button>
              <button hlmBtn>Salvar</button>
            </div>
          </section>

          <section hlmCard class="bg-secondary/30">
            <div hlmCardHeader>
              <h3 hlmCardTitle>Status do Sistema</h3>
              <p hlmCardDescription>Visão geral rápida dos serviços.</p>
            </div>
            <div hlmCardContent>
              <ul class="space-y-3">
                <li class="flex justify-between items-center">
                  <span>API Backend</span>
                  <span hlmBadge class="bg-green-500 hover:bg-green-600 text-white border-none">Online</span>
                </li>
                <li class="flex justify-between items-center">
                  <span>Banco de Dados</span>
                  <span hlmBadge class="bg-green-500 hover:bg-green-600 text-white border-none">Online</span>
                </li>
                <li class="flex justify-between items-center">
                  <span>Serviço de E-mail</span>
                  <span hlmBadge variant="secondary">Em Manutenção</span>
                </li>
              </ul>
            </div>
          </section>

        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--background);
    }
  `]
})
export class TestPageComponent {}
