import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'zorde-dashboard',
  standalone: true,
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold font-heading">Dashboard — Em construção</h1>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
