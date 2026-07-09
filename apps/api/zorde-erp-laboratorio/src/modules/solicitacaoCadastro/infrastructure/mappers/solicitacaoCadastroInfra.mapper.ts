import type { SolicitacaoCadastro } from '@prisma/client';
import { SolicitacaoCadastroEntity } from '../../domain/entities/solicitacaoCadastro.entity';

export class SolicitacaoCadastroInfraMapper {
	public static toDomain(raw: SolicitacaoCadastro): SolicitacaoCadastroEntity {
		return new SolicitacaoCadastroEntity({
			id: raw.id,
			email: raw.email,
			codigo: raw.codigo,
			expiracao: raw.expiracao,
			criadoEm: raw.createdAt,
		});
	}

	public static toPersistence(entity: SolicitacaoCadastroEntity): {
		email: string;
		codigo: string;
		expiracao: Date;
		createdAt: Date;
	} {
		return {
			email: entity.email,
			codigo: entity.codigo,
			expiracao: entity.expiracao,
			createdAt: entity.criadoEm,
		};
	}
}
