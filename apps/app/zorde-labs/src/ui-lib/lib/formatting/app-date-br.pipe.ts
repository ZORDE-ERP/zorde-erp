import { Pipe, PipeTransform } from '@angular/core';
import { formatDateBr } from './mask.utils';

@Pipe({ name: 'appDateBr' })
export class AppDateBrPipe implements PipeTransform {
	public transform(value: string | Date | null | undefined, withTime = false): string {
		return formatDateBr(value, withTime);
	}
}
