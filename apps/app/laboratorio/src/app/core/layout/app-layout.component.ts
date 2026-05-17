import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  HlmSidebarInset,
  HlmSidebarWrapper,
} from 'src/app/shared/ui/sidebar';
import { AppSidebarComponent } from './sidebar/app-sidebar.component';
import { AppNavbarComponent } from './navbar/app-navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HlmSidebarWrapper, HlmSidebarInset, AppSidebarComponent, AppNavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent {}
