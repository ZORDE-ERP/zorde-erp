import type { ServiceOrderEntity } from '../../domain/entities/ordemDeServico.entity';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';

export function serviceOrderToResponse(entity: ServiceOrderEntity): ServiceOrderResponseDto {
	const cliente = entity.getCliente();
	const tabelaMontagem = entity.getTabelaMontagem();

	return {
		id: entity.getId() as number,
		codigoOs: entity.getCodigoOs(),
		clienteId: entity.getClienteId(),
		valor: entity.getValor(),
		tabelaMontagemId: entity.getTabelaMontagemId(),
		usuarioId: entity.getUsuarioId(),
		createdAt: entity.getCreatedAt(),
		updatedAt: entity.getUpdatedAt() ?? null,
		deletedAt: entity.getDeletedAt() ?? null,
		cliente: cliente
			? {
					id: cliente.getId() as number,
					nome: cliente.getNome(),
				}
			: null,
		tabelaMontagem: tabelaMontagem
			? {
					id: tabelaMontagem.getId() as number,
					servico: tabelaMontagem.getServico(),
					valor: tabelaMontagem.getValor().toString(),
				}
			: null,
	};
}

export function serviceOrdersToResponse(entities: ServiceOrderEntity[]): ServiceOrderResponseDto[] {
	return entities.map(serviceOrderToResponse);
}
