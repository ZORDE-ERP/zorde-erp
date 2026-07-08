import type { Cliente, TabelaMontagem } from '@prisma/client';
import type { TipoServico } from '../../../../shared/enums/tipo-servico.enum';
import { TabelaMontagemEntity } from '../../domain/entities/tabelaMontagem.entity';

export class TabelaMontagemInfraMapper {
	public static toDomain(raw: TabelaMontagem & { Cliente?: Cliente | null }): TabelaMontagemEntity {
		return new TabelaMontagemEntity({
			id: raw.id,
			clienteId: raw.clienteId,
			servico: raw.servico as TipoServico,
			valor: raw.valor,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt || null,
			deletedAt: raw.deletedAt || null,
			nomeCliente: raw.Cliente?.nome || null,
		});
	}

	public static toPersistence(entity: TabelaMontagemEntity): {
		clienteId: number;
		servico: string;
		valor: number;
		createdAt: Date;
	} {
		return {
			clienteId: entity.getClienteId(),
			servico: entity.getServico(),
			valor: entity.getValor(),
			createdAt: entity.getCreatedAt() as Date,
		};
	}
}
