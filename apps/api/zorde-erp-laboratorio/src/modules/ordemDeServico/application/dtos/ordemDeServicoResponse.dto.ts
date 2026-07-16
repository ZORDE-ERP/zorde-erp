import type { StatusOrdemServico, OrigemOrdemServico, OrigemValorItem } from '../../../../shared/enums/ordem-de-servico.enum';

export interface ServiceOrderItemResponseDto {
	id: number;
	tabelaMontagemId?: number | null;
	descricaoManual?: string | null;
	quantidade: number;
	valorUnitario: number;
	valorTotal: number;
	origemValor: OrigemValorItem;
	nomeServico?: string | null;
}

export interface ServiceOrderResponseDto {
	id: number;
	codigoOs: string;
	clienteId: number;
	usuarioId: number;
	valorTotal: number;
	status: StatusOrdemServico;
	origem: OrigemOrdemServico;
	observacao?: string | null;
	createdAt: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
	cliente?: {
		id: number;
		nome: string;
	} | null;
	itens: ServiceOrderItemResponseDto[];
}

export interface FechamentoClienteDto {
	clienteId: number;
	nomeCliente: string;
	quantidadeOrdens: number;
	valorTotal: number;
}

export interface FechamentoResponseDto {
	dataInicio: Date;
	dataFim: Date;
	clientes: FechamentoClienteDto[];
	valorTotalGeral: number;
}

export interface FaturarOrdensResponseDto {
	quantidadeAtualizada: number;
}
