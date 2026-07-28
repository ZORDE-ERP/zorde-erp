import type { Cliente, Endereco } from '@prisma/client';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { ClienteEntity } from '../../domain/entities/cliente.entity';

export class ClienteInfraMapper {
	public static toDomain(raw: Cliente & { Endereco?: Endereco | null }): ClienteEntity {
		return new ClienteEntity({
			id: raw.id,
			nome: raw.nome,
			email: raw.email,
			contato: raw.contato || null,
			tipoPessoa: raw.tipoPessoa as TipoPessoa,
			documento: raw.documento,
			status: raw.status as StatusPessoa,
			cep: raw.cep || null,
			razaoSocial: raw.razaoSocial || null,
			nomeFantasia: raw.nomeFantasia || null,
			observacao: raw.observacao || null,
			usuarioId: raw.usuarioId,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt || null,
			deletedAt: raw.deletedAt || null,
			bairro: raw.Endereco?.bairro || null,
			cidade: raw.Endereco?.cidade || null,
			uf: raw.Endereco?.uf || null,
			ibge: raw.Endereco?.ibge || null,
			logradouro: raw.Endereco?.logradouro || null,
			complemento: raw.Endereco?.complemento || null,
			numeroEndereco: raw.numeroEndereco || null,
			qrToken: raw.qrToken || null,
			qrGeradoEm: raw.qrGeradoEm || null,
			qrCodeUrl: raw.qrCodeUrl || null,
			qrCodePublicId: raw.qrCodePublicId || null,
			logoUrl: raw.logoUrl || null,
			logoPublicId: raw.logoPublicId || null,
		});
	}
	public static toPersistence(entity: ClienteEntity): {
		nome: string;
		email: string;
		contato: string | null;
		tipoPessoa: TipoPessoa;
		documento: string;
		status: StatusPessoa;
		cep: string | null;
		observacao: string | null;
		usuarioId: number;
		createdAt: Date | null;
		numeroEndereco: string | null;
	} {
		return {
			nome: entity.getNome(),
			email: entity.getEmail(),
			contato: entity.getContato(),
			tipoPessoa: entity.getTipoPessoa(),
			documento: entity.getDocumento(),
			status: entity.getStatus(),
			cep: entity.getCep(),
			observacao: entity.getObservacao(),
			usuarioId: entity.getUsuarioId(),
			createdAt: entity.getCreatedAt(),
			numeroEndereco: entity.getNumeroEndereco(),
		};
	}
}
