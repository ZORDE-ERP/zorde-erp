import { TabelaMontagem } from '../models/tabela-montagem.model';
import {
	aggregateTabelaMontagemPorCliente,
	filterAggregatedByClienteId,
	filterAggregatedByNomeCliente,
} from './tabela-montagem-table';

function buildItem(overrides: Partial<TabelaMontagem>): TabelaMontagem {
	return {
		id: 1,
		clienteId: 1,
		nomeCliente: 'Cliente Teste',
		servicoId: 1,
		nomeServico: 'Serviço Teste',
		valor: 10,
		createdAt: new Date(),
		...overrides,
	};
}

describe('aggregateTabelaMontagemPorCliente', () => {
	it('should group itens by clienteId, summing quantidade and valorTotal', () => {
		const itens: TabelaMontagem[] = [
			buildItem({ id: 1, clienteId: 1, nomeCliente: 'João Silva', valor: 50 }),
			buildItem({ id: 2, clienteId: 1, nomeCliente: 'João Silva', valor: 30 }),
			buildItem({ id: 3, clienteId: 2, nomeCliente: 'Maria Souza', valor: 100 }),
		];

		const result = aggregateTabelaMontagemPorCliente(itens);

		expect(result).toHaveLength(2);

		const joao = result.find((row) => row.clienteId === 1);
		expect(joao).toEqual({
			clienteId: 1,
			nomeCliente: 'João Silva',
			quantidadeServicos: 2,
			valorTotal: 80,
			itens: [itens[0], itens[1]],
		});

		const maria = result.find((row) => row.clienteId === 2);
		expect(maria?.quantidadeServicos).toBe(1);
		expect(maria?.valorTotal).toBe(100);
	});

	it('should fall back to a placeholder name when nomeCliente is missing', () => {
		const itens: TabelaMontagem[] = [buildItem({ clienteId: 9, nomeCliente: null })];

		const result = aggregateTabelaMontagemPorCliente(itens);

		expect(result[0]?.nomeCliente).toBe('Cliente #9');
	});

	it('should return an empty array when there are no itens', () => {
		expect(aggregateTabelaMontagemPorCliente([])).toEqual([]);
	});
});

describe('filterAggregatedByNomeCliente', () => {
	const rows = aggregateTabelaMontagemPorCliente([
		buildItem({ id: 1, clienteId: 1, nomeCliente: 'João Silva' }),
		buildItem({ id: 2, clienteId: 2, nomeCliente: 'Maria Souza' }),
	]);

	it('should return all rows when the search term is empty', () => {
		expect(filterAggregatedByNomeCliente(rows, '')).toHaveLength(2);
		expect(filterAggregatedByNomeCliente(rows, '   ')).toHaveLength(2);
	});

	it('should filter rows by nomeCliente case-insensitively', () => {
		const result = filterAggregatedByNomeCliente(rows, 'maria');
		expect(result).toHaveLength(1);
		expect(result[0]?.nomeCliente).toBe('Maria Souza');
	});

	it('should return an empty array when no row matches', () => {
		expect(filterAggregatedByNomeCliente(rows, 'inexistente')).toEqual([]);
	});
});

describe('filterAggregatedByClienteId', () => {
	const rows = aggregateTabelaMontagemPorCliente([
		buildItem({ id: 1, clienteId: 1, nomeCliente: 'João Silva' }),
		buildItem({ id: 2, clienteId: 2, nomeCliente: 'Maria Souza' }),
	]);

	it('should return all rows when clienteId is null', () => {
		expect(filterAggregatedByClienteId(rows, null)).toHaveLength(2);
	});

	it('should filter rows by clienteId', () => {
		const result = filterAggregatedByClienteId(rows, 2);
		expect(result).toHaveLength(1);
		expect(result[0]?.nomeCliente).toBe('Maria Souza');
	});
});
