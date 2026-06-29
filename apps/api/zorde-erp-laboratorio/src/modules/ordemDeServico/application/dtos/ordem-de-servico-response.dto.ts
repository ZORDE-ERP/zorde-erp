import type { OrdemDeServicoEntity } from '../../domain/entities/ordem-de-servico.entity';

export class OrdemDeServicoResponseDto {
	public id: number | null;
	public codigoOs: string;
	public clienteId: number;
	public valor?: number;
	public tabelaMontagemId?: number;
	public usuarioId: number;
	public createdAt: Date;
	public updatedAt?: Date;

	public cliente?: {
		id: number;
		nome: string;
	};

	public tabelaMontagem?: {
		id: number;
		servico: string;
	};

	public static fromEntity(entity: OrdemDeServicoEntity): OrdemDeServicoResponseDto {
		const response: OrdemDeServicoResponseDto = {
			id: entity.id,
			codigoOs: entity.codigoOs,
			clienteId: entity.clienteId,
			valor: entity.valor,
			tabelaMontagemId: entity.tabelaMontagemId,
			usuarioId: entity.usuarioId,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};

		if (entity.cliente) {
			response.cliente = {
				id: entity.cliente.getId() as number,
				nome: entity.cliente.getNome(),
			};
		}

		if (entity.tabelaMontagem) {
			response.tabelaMontagem = {
				id: entity.tabelaMontagem.id,
				servico: entity.tabelaMontagem.servico,
			};
		}

		return response;
	}

	public static fromEntities(entities: OrdemDeServicoEntity[]): OrdemDeServicoResponseDto[] {
		return entities.map((entity) => OrdemDeServicoResponseDto.fromEntity(entity));
	}
}
