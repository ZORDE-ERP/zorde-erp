import {
	formatBrlFromDigits,
	formatCep,
	formatCnpj,
	formatCpf,
	formatDateBr,
	formatTelefone,
	onlyDigits,
	parseBrlDigitsToNumber,
} from './mask.utils';

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

	it('formats CEP progressively', () => {
		expect(formatCep('')).toBe('');
		expect(formatCep('123')).toBe('123');
		expect(formatCep('12345')).toBe('12345');
		expect(formatCep('12345678')).toBe('12345-678');
		expect(formatCep('123456789999')).toBe('12345-678');
		expect(onlyDigits('12345-678')).toBe('12345678');
	});

	it('formats telefone progressively', () => {
		expect(formatTelefone('')).toBe('');
		expect(formatTelefone('1')).toBe('1');
		expect(formatTelefone('11')).toBe('11');
		expect(formatTelefone('113')).toBe('(11) 3');
		expect(formatTelefone('1133')).toBe('(11) 33');
		expect(formatTelefone('113344')).toBe('(11) 3344');
		expect(formatTelefone('1133445566')).toBe('(11) 3344-5566');
		expect(formatTelefone('11933445566')).toBe('(11) 93344-5566');
		expect(formatTelefone('119334455661234')).toBe('(11) 93344-5566');
	});

	it('formats date to dd/MM/yyyy from ISO date-only string without UTC shift', () => {
		expect(formatDateBr('2024-01-31')).toBe('31/01/2024');
		expect(formatDateBr('2024-12-01')).toBe('01/12/2024');
	});

	it('formats date with time from ISO datetime string', () => {
		expect(formatDateBr('2024-01-31T14:30:00', true)).toBe('31/01/2024 14:30');
	});

	it('formats date from a Date instance', () => {
		expect(formatDateBr(new Date(2024, 0, 31))).toBe('31/01/2024');
		expect(formatDateBr(new Date(2024, 0, 31, 9, 5), true)).toBe('31/01/2024 09:05');
	});

	it('passes through already formatted dd/MM/yyyy strings', () => {
		expect(formatDateBr('31/01/2024')).toBe('31/01/2024');
		expect(formatDateBr('31/01/2024 14:30', true)).toBe('31/01/2024 14:30');
	});

	it('returns empty string for invalid or empty date input', () => {
		expect(formatDateBr('')).toBe('');
		expect(formatDateBr(null)).toBe('');
		expect(formatDateBr(undefined)).toBe('');
		expect(formatDateBr('not-a-date')).toBe('');
	});
});
