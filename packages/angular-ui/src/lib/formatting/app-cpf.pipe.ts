import { Pipe, type PipeTransform } from '@angular/core';
import { formatCpf } from './mask.utils';

@Pipe({ name: 'appCpf' })
export class AppCpfPipe implements PipeTransform {
	public transform(value: string | null | undefined): string {
		if (!value) {
			return '';
		}
		return formatCpf(value);
	}
}
