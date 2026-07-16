import type { ServiceOrderEntity } from '../../domain/entities/ordemDeServico.entity';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';

export function serviceOrderToResponse(entity: ServiceOrderEntity): ServiceOrderResponseDto {
	const cliente = entity.getCliente();

	return {
		id: entity.getId() as number,
		codigoOs: entity.getCodigoOs(),
		clienteId: entity.getClienteId(),
		usuarioId: entity.getUsuarioId(),
		valorTotal: entity.getValorTotal(),
		status: entity.getStatus(),
		origem: entity.getOrigem(),
		observacao: entity.getObservacao(),
		createdAt: entity.getCreatedAt(),
		updatedAt: entity.getUpdatedAt() ?? null,
		deletedAt: entity.getDeletedAt() ?? null,
		cliente: cliente
			? {
					id: cliente.getId() as number,
					nome: cliente.getNome(),
				}
			: null,
		itens: entity.getItens().map((item) => ({
			id: item.getId() as number,
			tabelaMontagemId: item.getTabelaMontagemId(),
			descricaoManual: item.getDescricaoManual(),
			quantidade: item.getQuantidade(),
			valorUnitario: item.getValorUnitario(),
			valorTotal: item.getValorTotal(),
			origemValor: item.getOrigemValor(),
			nomeServico: item.getNomeServico(),
		})),
	};
}

export function serviceOrdersToResponse(entities: ServiceOrderEntity[]): ServiceOrderResponseDto[] {
	return entities.map(serviceOrderToResponse);
}
