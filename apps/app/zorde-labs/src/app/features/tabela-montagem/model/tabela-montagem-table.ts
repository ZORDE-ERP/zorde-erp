import { DataTableAction, DataTableColumn } from '../../../shared/components/data-table/data-table.model';
import { TabelaMontagem } from '../models/tabela-montagem.model';

export interface TabelaMontagemAggregatedRow {
	readonly clienteId: number;
	readonly nomeCliente: string;
	readonly quantidadeServicos: number;
	readonly valorTotal: number;
	readonly itens: readonly TabelaMontagem[];
}

export function aggregateTabelaMontagemPorCliente(itens: readonly TabelaMontagem[]): TabelaMontagemAggregatedRow[] {
	const itensByCliente = new Map<number, { nomeCliente: string; itens: TabelaMontagem[] }>();

	for (const item of itens) {
		const existing = itensByCliente.get(item.clienteId);
		if (existing) {
			existing.itens.push(item);
			continue;
		}
		itensByCliente.set(item.clienteId, {
			nomeCliente: item.nomeCliente?.trim() || `Cliente #${item.clienteId}`,
			itens: [item],
		});
	}

	return [...itensByCliente.entries()].map(([clienteId, { nomeCliente, itens: clienteItens }]) => ({
		clienteId,
		nomeCliente,
		quantidadeServicos: clienteItens.length,
		valorTotal: clienteItens.reduce((total, item) => total + item.valor, 0),
		itens: clienteItens,
	}));
}

export function filterAggregatedByNomeCliente(
	rows: readonly TabelaMontagemAggregatedRow[],
	search: string,
): TabelaMontagemAggregatedRow[] {
	const term = search.trim().toLowerCase();
	if (!term) {
		return [...rows];
	}
	return rows.filter((row) => row.nomeCliente.toLowerCase().includes(term));
}

export const ACTIONS: readonly DataTableAction<TabelaMontagemAggregatedRow>[] = [
	{ value: 'visualizar', label: 'Visualizar', icon: 'eye', color: 'blue' },
	{ value: 'editar', label: 'Editar', icon: 'pencil', color: 'orange' },
];

export const COLUMNS: readonly DataTableColumn<TabelaMontagemAggregatedRow>[] = [
	{ key: 'nomeCliente', header: 'Cliente', sortable: true, minWidth: '12rem' },
	{ key: 'quantidadeServicos', header: 'Qtd. serviços', sortable: true, align: 'center', minWidth: '8rem' },
];
