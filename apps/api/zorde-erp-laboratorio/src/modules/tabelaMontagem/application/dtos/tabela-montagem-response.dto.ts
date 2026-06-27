import type { TipoServico } from '../../../../shared/enums/tipo-servico.enum';
import type { TabelaMontagemEntity } from '../../domain/entities/tabela-montagem.entity';

export class TabelaMontagemResponseDto {
	public id: number;
	public clienteId: number;
	public nomeCliente?: string;
	public servico: TipoServico;
	public valor: number;
	public createdAt: Date;
	public updatedAt?: Date;

	public static fromEntity(entity: TabelaMontagemEntity): TabelaMontagemResponseDto {
		return {
			id: entity.id,
			clienteId: entity.clienteId,
			nomeCliente: entity.nomeCliente,
			servico: entity.servico,
			valor: entity.valor,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	}

	public static fromEntities(entities: TabelaMontagemEntity[]): TabelaMontagemResponseDto[] {
		return entities.map((entity) => TabelaMontagemResponseDto.fromEntity(entity));
	}
}
