import type { Servico } from '@prisma/client';
import { ServicoEntity } from '../../domain/entities/servico.entity';

export class ServicoInfraMapper {
	public static toDomain(raw: Servico): ServicoEntity {
		return new ServicoEntity({
			id: raw.id,
			usuarioId: raw.usuarioId,
			nome: raw.nome,
			descricao: raw.descricao || null,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt || null,
		});
	}

	public static toPersistence(entity: ServicoEntity): {
		usuarioId: number;
		nome: string;
		descricao: string | null;
	} {
		return {
			usuarioId: entity.getUsuarioId(),
			nome: entity.getNome(),
			descricao: entity.getDescricao(),
		};
	}
}
