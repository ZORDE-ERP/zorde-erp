import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppCardImports, AppLinkDirective, AppPageLayoutComponent } from '@repo/angular-ui';
import { PLAYGROUND_NAVIGATION } from '../../navigation';

@Component({
	selector: 'ds-overview-page',
	imports: [RouterLink, AppPageLayoutComponent, ...AppCardImports, AppLinkDirective],
	templateUrl: './overview.html',
})
export class OverviewPage {
	protected readonly navigation = PLAYGROUND_NAVIGATION;
}
