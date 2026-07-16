import type { Cliente, ItemOrdemDeServico, OrdemDeServico, Servico, TabelaMontagem } from '@prisma/client';
import {
	OrigemOrdemServico,
	OrigemValorItem,
	StatusOrdemServico,
} from '../../../../shared/enums/ordem-de-servico.enum';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { ClienteEntity } from '../../../cliente/domain/entities/cliente.entity';
import { ServiceOrderEntity, ServiceOrderItemEntity } from '../../domain/entities/ordemDeServico.entity';

type ItemWithTabela = ItemOrdemDeServico & {
	TabelaMontagem?: (TabelaMontagem & { Servico?: Servico | null }) | null;
};

type OrdemWithRelations = OrdemDeServico & {
	Cliente?: Cliente | null;
	Itens?: ItemWithTabela[];
};

export class ServiceOrderInfraMapper {
	public static toDomain(raw: OrdemWithRelations): ServiceOrderEntity {
		return new ServiceOrderEntity({
			id: raw.id,
			codigoOs: raw.codigoOS,
			clienteId: raw.clienteId,
			usuarioId: raw.usuarioId,
			valorTotal: raw.valorTotal,
			status: raw.status as StatusOrdemServico,
			origem: raw.origem as OrigemOrdemServico,
			observacao: raw.observacao,
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
						qrToken: raw.Cliente.qrToken,
						qrGeradoEm: raw.Cliente.qrGeradoEm,
						createdAt: raw.Cliente.createdAt,
						updatedAt: raw.Cliente.updatedAt,
						deletedAt: raw.Cliente.deletedAt,
					})
				: undefined,
			itens: (raw.Itens ?? []).map(
				(item) =>
					new ServiceOrderItemEntity({
						id: item.id,
						tabelaMontagemId: item.tabelaMontagemId,
						descricaoManual: item.descricaoManual,
						quantidade: item.quantidade,
						valorUnitario: item.valorUnitario,
						valorTotal: item.valorTotal,
						origemValor: item.origemValor as OrigemValorItem,
						nomeServico: item.TabelaMontagem?.Servico?.nome ?? null,
					}),
			),
		});
	}
}
