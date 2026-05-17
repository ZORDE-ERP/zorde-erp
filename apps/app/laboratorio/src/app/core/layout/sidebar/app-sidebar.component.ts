import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChartBar,
  lucideUsers,
  lucideTruck,
  lucideFileText,
  lucideStethoscope,
  lucideTable,
  lucideLogOut,
} from '@ng-icons/lucide';
import { AuthService } from '../../auth/auth.service';
import { HlmAlertDialogImports } from 'src/app/shared/ui/alert-dialog';
import { HlmIconImports } from 'src/app/shared/ui/icon';
import {
  HlmSidebar,
  HlmSidebarContent,
  HlmSidebarFooter,
  HlmSidebarGroup,
  HlmSidebarGroupContent,
  HlmSidebarGroupLabel,
  HlmSidebarHeader,
  HlmSidebarMenu,
  HlmSidebarMenuButton,
  HlmSidebarMenuItem,
  HlmSidebarRail,
  HlmSidebarSeparator,
} from 'src/app/shared/ui/sidebar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    ...HlmAlertDialogImports,
    ...HlmIconImports,
    HlmSidebar,
    HlmSidebarContent,
    HlmSidebarFooter,
    HlmSidebarGroup,
    HlmSidebarGroupContent,
    HlmSidebarGroupLabel,
    HlmSidebarHeader,
    HlmSidebarMenu,
    HlmSidebarMenuButton,
    HlmSidebarMenuItem,
    HlmSidebarRail,
    HlmSidebarSeparator,
  ],
  providers: [
    provideIcons({
      lucideChartBar,
      lucideUsers,
      lucideTruck,
      lucideFileText,
      lucideStethoscope,
      lucideTable,
      lucideLogOut,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoggingOut = signal(false);

  protected confirmLogout(close: () => void): void {
    const refreshToken = this.authService.getRefreshToken();

    if (!refreshToken) {
      this.finishLogout(close);
      return;
    }

    this.isLoggingOut.set(true);

    this.authService.logout(refreshToken).subscribe({
      next: () => this.finishLogout(close),
      error: () => this.finishLogout(close),
    });
  }

  private finishLogout(close: () => void): void {
    close();
    this.authService.clearTokens();
    this.isLoggingOut.set(false);
    void this.router.navigate(['/login']);
  }
}
