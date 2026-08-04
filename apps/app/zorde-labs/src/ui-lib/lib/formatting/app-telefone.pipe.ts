import { Pipe, PipeTransform } from '@angular/core';
import { formatTelefone } from './mask.utils';

@Pipe({ name: 'appTelefone' })
export class AppTelefonePipe implements PipeTransform {
	public transform(value: string | null | undefined): string {
		if (!value) {
			return '';
		}
		return formatTelefone(value);
	}
}
