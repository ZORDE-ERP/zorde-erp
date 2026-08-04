import { formatBrlFromDigits, formatCnpj, formatCpf, onlyDigits, parseBrlDigitsToNumber } from './mask.utils';

describe('mask utils', () => {
	it('formats CPF progressively', () => {
		expect(formatCpf('123')).toBe('123');
		expect(formatCpf('12345678901')).toBe('123.456.789-01');
		expect(onlyDigits('123.456.789-01')).toBe('12345678901');
	});

	it('formats CNPJ progressively', () => {
		expect(formatCnpj('12345678000195')).toBe('12.345.678/0001-95');
	});

	it('formats BRL from digit cents', () => {
		expect(formatBrlFromDigits('')).toBe('');
		expect(formatBrlFromDigits('1')).toContain('0,01');
		expect(parseBrlDigitsToNumber('12345')).toBe(123.45);
	});
});
