import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppLinkDirective, AppPageLayoutComponent, AppPreviewBlockComponent } from '@repo/angular-ui';

@Component({
	selector: 'ds-links-page',
	imports: [RouterLink, AppPageLayoutComponent, AppPreviewBlockComponent, AppLinkDirective],
	templateUrl: './links.html',
})
export class LinksPage {}
