import { calcItensTotal, resolveOrigemValor, toCreateItemPayload } from './ordem-servico-itens';

describe('ordem-servico-itens', () => {
	it('keeps TABELA when unit value matches table value', () => {
		expect(resolveOrigemValor(50, 50)).toBe('TABELA');
	});

	it('switches to MANUAL when unit value is edited', () => {
		expect(resolveOrigemValor(55, 50)).toBe('MANUAL');
	});

	it('builds create payload keeping tabelaMontagemId on MANUAL', () => {
		expect(
			toCreateItemPayload({
				tabelaMontagemId: 9,
				quantidade: 2,
				valorTabela: 50,
				valorUnitario: 60,
			}),
		).toEqual({
			tabelaMontagemId: 9,
			quantidade: 2,
			valorUnitario: 60,
			origemValor: 'MANUAL',
		});
	});

	it('calculates items total', () => {
		expect(
			calcItensTotal([
				{ quantidade: 2, valorUnitario: 10 },
				{ quantidade: 1, valorUnitario: 5 },
			]),
		).toBe(25);
	});
});
