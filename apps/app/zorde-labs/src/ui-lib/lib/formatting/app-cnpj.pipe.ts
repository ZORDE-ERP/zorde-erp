import { Pipe, PipeTransform } from '@angular/core';
import { formatCnpj } from './mask.utils';

@Pipe({ name: 'appCnpj' })
export class AppCnpjPipe implements PipeTransform {
	public transform(value: string | null | undefined): string {
		if (!value) {
			return '';
		}
		return formatCnpj(value);
	}
}
