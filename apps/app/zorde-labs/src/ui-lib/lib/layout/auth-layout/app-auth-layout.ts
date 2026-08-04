import { Component, input } from '@angular/core';

@Component({
	selector: 'app-auth-layout',
	templateUrl: './app-auth-layout.html',
})
export class AppAuthLayoutComponent {
	public readonly brandTitle = input('Zorde Laboratório');
	public readonly brandDescription = input('Sistema de gerenciamento de laboratório automatizado');
}
