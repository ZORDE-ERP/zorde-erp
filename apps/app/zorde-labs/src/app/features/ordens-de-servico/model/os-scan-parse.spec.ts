import { parseOsScanInput } from './os-scan-parse';

describe('parseOsScanInput', () => {
	it('parses absolute URL query params with folha', () => {
		expect(parseOsScanInput('https://app.zorde.com/os/scan?c=12&t=abc123&f=OS-12-000001')).toEqual({
			clienteId: 12,
			token: 'abc123',
			codigoFolha: 'OS-12-000001',
		});
	});

	it('parses relative path and codigoFolha via f', () => {
		expect(parseOsScanInput('/os/scan?c=7&t=tok&f=FOLHA-1')).toEqual({
			clienteId: 7,
			token: 'tok',
			codigoFolha: 'FOLHA-1',
		});
	});

	it('returns null when folha is missing', () => {
		expect(parseOsScanInput('https://app.zorde.com/os/scan?c=12&t=abc123')).toBeNull();
	});

	it('returns null for invalid input', () => {
		expect(parseOsScanInput('')).toBeNull();
		expect(parseOsScanInput('sem-params')).toBeNull();
		expect(parseOsScanInput('/os/scan?c=x&t=y&f=z')).toBeNull();
	});
});
