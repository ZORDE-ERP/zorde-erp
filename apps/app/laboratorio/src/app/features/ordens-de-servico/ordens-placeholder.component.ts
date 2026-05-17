import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'zorde-ordens-placeholder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold font-heading">Ordens de Serviço</h1>
      <p class="text-muted-foreground">Módulo em construção.</p>
    </div>
  `,
})
export class OrdensPlaceholderComponent {}
