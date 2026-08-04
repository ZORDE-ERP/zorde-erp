import { Component } from '@angular/core';
import { AppButtonDirective, AppCardImports, AppPageLayoutComponent, AppPreviewBlockComponent } from '@repo/angular-ui';

@Component({
	selector: 'ds-cards-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent, ...AppCardImports, AppButtonDirective],
	templateUrl: './cards.html',
})
export class CardsPage {}
