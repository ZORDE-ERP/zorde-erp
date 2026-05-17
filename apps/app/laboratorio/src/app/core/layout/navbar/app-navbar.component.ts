import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideBell, lucideUser } from '@ng-icons/lucide';
import { HlmIconImports } from 'src/app/shared/ui/icon';
import { HlmSidebarTrigger } from 'src/app/shared/ui/sidebar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [HlmIconImports, HlmSidebarTrigger],
  providers: [provideIcons({ lucideBell, lucideUser })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-navbar.component.html',
})
export class AppNavbarComponent {}
