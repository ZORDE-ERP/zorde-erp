import { Component } from '@angular/core';
import { AppButtonDirective, AppPageLayoutComponent, AppPreviewBlockComponent } from '@repo/angular-ui';

@Component({
	selector: 'ds-buttons-page',
	imports: [AppPageLayoutComponent, AppPreviewBlockComponent, AppButtonDirective],
	templateUrl: './buttons.html',
})
export class ButtonsPage {}
