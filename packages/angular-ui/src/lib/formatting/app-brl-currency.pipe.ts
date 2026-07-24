import { Pipe, PipeTransform } from '@angular/core';
import { formatBrlFromNumber, onlyDigits } from './mask.utils';

@Pipe({ name: 'appBrlCurrency' })
export class AppBrlCurrencyPipe implements PipeTransform {
	public transform(value: number | string | null | undefined): string {
		if (value === null || value === undefined || value === '') {
			return '';
		}
		if (typeof value === 'number') {
			return formatBrlFromNumber(value);
		}
		const digits = onlyDigits(value);
		if (!digits) {
			return '';
		}
		return formatBrlFromNumber(Number.parseInt(digits, 10) / 100);
	}
}
