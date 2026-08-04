import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
	selector: 'app-home',
	imports: [PageHeaderComponent],
	templateUrl: './home.html',
	host: {
		class: 'block min-h-full w-full',
	},
})
export class Home {}
