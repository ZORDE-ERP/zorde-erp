import { parseOsScanInput } from './os-scan-parse';

describe('parseOsScanInput', () => {
	it('parses absolute URL query params', () => {
		expect(parseOsScanInput('https://app.zorde.com/os/scan?c=12&t=abc123')).toEqual({
			clienteId: 12,
			token: 'abc123',
			codigoFolha: undefined,
		});
	});

	it('parses relative path and optional folha', () => {
		expect(parseOsScanInput('/os/scan?c=7&t=tok&f=FOLHA-1')).toEqual({
			clienteId: 7,
			token: 'tok',
			codigoFolha: 'FOLHA-1',
		});
	});

	it('returns null for invalid input', () => {
		expect(parseOsScanInput('')).toBeNull();
		expect(parseOsScanInput('sem-params')).toBeNull();
		expect(parseOsScanInput('/os/scan?c=x&t=y')).toBeNull();
	});
});
