import type { ServicoEntity } from '../../domain/entities/servico.entity';
import type { ServicoResponseDto } from '../dtos/servicoResponse.dto';

export function servicoToResponse(entity: ServicoEntity): ServicoResponseDto {
	return {
		id: entity.getId() as number,
		usuarioId: entity.getUsuarioId(),
		nome: entity.getNome(),
		descricao: entity.getDescricao(),
		createdAt: entity.getCreatedAt() as Date,
		updatedAt: entity.getUpdatedAt(),
	};
}

export function servicosToResponse(entities: ServicoEntity[]): ServicoResponseDto[] {
	return entities.map(servicoToResponse);
}
