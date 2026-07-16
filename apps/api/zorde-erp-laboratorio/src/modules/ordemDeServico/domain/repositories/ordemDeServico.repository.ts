import type { OrigemOrdemServico, StatusOrdemServico } from '../../../../shared/enums/ordem-de-servico.enum';
import type { ServiceOrderEntity } from '../entities/ordemDeServico.entity';

export const ISERVICE_ORDER_REPOSITORY = 'IServiceOrderRepository';

export interface CreateServiceOrderData {
	codigoOs: string;
	clienteId: number;
	usuarioId: number;
	valorTotal: number;
	status: StatusOrdemServico;
	origem: OrigemOrdemServico;
	observacao?: string | null;
	folhaId?: number | null;
	itens: Array<{
		tabelaMontagemId?: number | null;
		descricaoManual?: string | null;
		quantidade: number;
		valorUnitario: number;
		valorTotal: number;
		origemValor: string;
	}>;
}

export interface ListServiceOrdersFilters {
	usuarioId: number;
	page: number;
	limit: number;
	status?: StatusOrdemServico;
	clienteId?: number;
	dataInicio?: Date;
	dataFim?: Date;
}

export interface FechamentoFilters {
	usuarioId: number;
	clienteId?: number;
	dataInicio: Date;
	dataFim: Date;
}

export interface FechamentoAggregateRow {
	clienteId: number;
	nomeCliente: string;
	quantidadeOrdens: number;
	valorTotal: number;
}

export interface IServiceOrderRepository {
	createWithItems(data: CreateServiceOrderData): Promise<ServiceOrderEntity>;
	findById(id: number, usuarioId: number): Promise<ServiceOrderEntity | null>;
	findByUsuarioId(usuarioId: number): Promise<ServiceOrderEntity[]>;
	findAllPaginated(filters: ListServiceOrdersFilters): Promise<{ items: ServiceOrderEntity[]; total: number }>;
	countByCliente(clienteId: number, usuarioId: number): Promise<number>;
	update(serviceOrder: ServiceOrderEntity): Promise<ServiceOrderEntity>;
	softDelete(id: number, usuarioId: number): Promise<void>;
	sumFechamento(filters: FechamentoFilters): Promise<FechamentoAggregateRow[]>;
	faturarPorPeriodo(filters: FechamentoFilters & { clienteId: number }): Promise<number>;
}
