import type { Cliente, Servico, TabelaMontagem } from '@prisma/client';
import { TabelaMontagemEntity } from '../../domain/entities/tabelaMontagem.entity';

export class TabelaMontagemInfraMapper {
	public static toDomain(
		raw: TabelaMontagem & { Cliente?: Cliente | null; Servico?: Servico | null },
	): TabelaMontagemEntity {
		return new TabelaMontagemEntity({
			id: raw.id,
			clienteId: raw.clienteId,
			servicoId: raw.servicoId,
			valor: raw.valor,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt || null,
			deletedAt: raw.deletedAt || null,
			nomeCliente: raw.Cliente?.nome || null,
			nomeServico: raw.Servico?.nome || null,
		});
	}

	public static toPersistence(entity: TabelaMontagemEntity): {
		clienteId: number;
		servicoId: number;
		valor: number;
		createdAt: Date;
	} {
		return {
			clienteId: entity.getClienteId(),
			servicoId: entity.getServicoId(),
			valor: entity.getValor(),
			createdAt: entity.getCreatedAt() as Date,
		};
	}
}
