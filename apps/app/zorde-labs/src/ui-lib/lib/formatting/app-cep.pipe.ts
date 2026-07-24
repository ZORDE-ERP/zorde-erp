import { Pipe, PipeTransform } from '@angular/core';
import { formatCep } from './mask.utils';

@Pipe({ name: 'appCep' })
export class AppCepPipe implements PipeTransform {
	public transform(value: string | null | undefined): string {
		if (!value) {
			return '';
		}
		return formatCep(value);
	}
}
