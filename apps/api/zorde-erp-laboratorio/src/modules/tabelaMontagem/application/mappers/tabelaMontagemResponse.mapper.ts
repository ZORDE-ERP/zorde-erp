import type { TabelaMontagemEntity } from '../../domain/entities/tabelaMontagem.entity';
import type { TabelaMontagemResponseDto } from '../dtos/tabelaMontagemResponse.dto';

export function tabelaMontagemToResponse(entity: TabelaMontagemEntity): TabelaMontagemResponseDto {
	return {
		id: entity.getId() as number,
		clienteId: entity.getClienteId(),
		nomeCliente: entity.getNomeCliente(),
		servicoId: entity.getServicoId(),
		nomeServico: entity.getNomeServico(),
		valor: entity.getValor(),
		createdAt: entity.getCreatedAt() as Date,
		updatedAt: entity.getUpdatedAt(),
	};
}

export function tabelaMontagensToResponse(entities: TabelaMontagemEntity[]): TabelaMontagemResponseDto[] {
	return entities.map(tabelaMontagemToResponse);
}
