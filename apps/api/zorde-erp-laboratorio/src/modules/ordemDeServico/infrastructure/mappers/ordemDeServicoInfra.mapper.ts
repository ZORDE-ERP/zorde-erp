import type { Cliente, OrdemDeServico, TabelaMontagem } from '@prisma/client';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import type { TipoServico } from '../../../../shared/enums/tipo-servico.enum';
import { ClienteEntity } from '../../../cliente/domain/entities/cliente.entity';
import { TabelaMontagemEntity } from '../../../tabelaMontagem/domain/entities/tabelaMontagem.entity';
import { ServiceOrderEntity } from '../../domain/entities/ordemDeServico.entity';

export class ServiceOrderInfraMapper {
	public static toDomain(
		raw: OrdemDeServico & {
			Cliente?: Cliente | null;
			TabelaMontagem?: TabelaMontagem | null;
		},
	): ServiceOrderEntity {
		return new ServiceOrderEntity({
			id: raw.id,
			codigoOs: raw.codigoOS,
			clienteId: raw.clienteId,
			valor: raw.valor?.toString(),
			tabelaMontagemId: raw.tabelaMontagemId,
			usuarioId: raw.usuarioId,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			deletedAt: raw.deletedAt,
			cliente: raw.Cliente
				? new ClienteEntity({
						id: raw.Cliente.id,
						nome: raw.Cliente.nome,
						email: raw.Cliente.email,
						contato: raw.Cliente.contato,
						tipoPessoa: raw.Cliente.tipoPessoa as TipoPessoa,
						documento: raw.Cliente.documento,
						status: raw.Cliente.status as StatusPessoa,
						cep: raw.Cliente.cep,
						razaoSocial: raw.Cliente.razaoSocial,
						nomeFantasia: raw.Cliente.nomeFantasia,
						observacao: raw.Cliente.observacao,
						numeroEndereco: raw.Cliente.numeroEndereco,
						usuarioId: raw.Cliente.usuarioId,
						createdAt: raw.Cliente.createdAt,
						updatedAt: raw.Cliente.updatedAt,
						deletedAt: raw.Cliente.deletedAt,
					})
				: undefined,
			tabelaMontagem: raw.TabelaMontagem
				? new TabelaMontagemEntity({
						id: raw.TabelaMontagem.id,
						clienteId: raw.TabelaMontagem.clienteId,
						servico: raw.TabelaMontagem.servico as TipoServico,
						valor: raw.TabelaMontagem.valor,
						createdAt: raw.TabelaMontagem.createdAt,
						updatedAt: raw.TabelaMontagem.updatedAt || null,
						deletedAt: raw.TabelaMontagem.deletedAt || null,
					})
				: undefined,
		});
	}

	public static toPersistence(entity: ServiceOrderEntity): {
		id?: number;
		codigoOS: string;
		clienteId: number;
		valor?: number;
		tabelaMontagemId?: number | null;
		usuarioId?: number;
		createdAt?: Date | null;
		updatedAt?: Date | null;
		deletedAt?: Date | null;
	} {
		return {
			id: entity.getId() || undefined,
			codigoOS: entity.getCodigoOs(),
			clienteId: entity.getClienteId(),
			...(entity.getValor() && { valor: +Number(entity.getValor()).toFixed(2) }),
			...(entity.getTabelaMontagemId() && { tabelaMontagemId: entity.getTabelaMontagemId() }),
			...(entity.getUsuarioId() && { usuarioId: entity.getUsuarioId() }),
			...(entity.getCreatedAt() && { createdAt: entity.getCreatedAt() }),
			...(entity.getUpdatedAt() && { updatedAt: entity.getUpdatedAt() }),
			...(entity.getDeletedAt() && { deletedAt: entity.getDeletedAt() }),
		};
	}
}
