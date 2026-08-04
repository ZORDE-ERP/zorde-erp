import type { CreateOrdemServicoItemPayload, OrigemValorItem } from '../models/ordem-servico.model';

export interface OrdemItemDraftLike {
	tabelaMontagemId: number;
	quantidade: number;
	valorTabela: number;
	valorUnitario: number;
}

export function resolveOrigemValor(valorUnitario: number, valorTabela: number): OrigemValorItem {
	return valorUnitario === valorTabela ? 'TABELA' : 'MANUAL';
}

export function toCreateItemPayload(item: OrdemItemDraftLike): CreateOrdemServicoItemPayload {
	return {
		tabelaMontagemId: item.tabelaMontagemId,
		quantidade: item.quantidade,
		valorUnitario: item.valorUnitario,
		origemValor: resolveOrigemValor(item.valorUnitario, item.valorTabela),
	};
}

export function calcItensTotal(itens: readonly Pick<OrdemItemDraftLike, 'quantidade' | 'valorUnitario'>[]): number {
	return itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);
}
