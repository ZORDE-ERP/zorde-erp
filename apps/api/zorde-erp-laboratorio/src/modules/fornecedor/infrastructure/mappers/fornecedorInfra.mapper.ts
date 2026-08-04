import type { Endereco, Fornecedor } from '@prisma/client';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';

export class FornecedorInfraMapper {
	public static toDomain(raw: Fornecedor & { Endereco: Endereco | null }): FornecedorEntity {
		return new FornecedorEntity({
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
			logoUrl: raw.logoUrl || null,
			logoPublicId: raw.logoPublicId || null,
		});
	}

	public static toPersistence(entity: FornecedorEntity): {
		nome: string;
		email: string;
		contato: string | null;
		tipoPessoa: TipoPessoa;
		documento: string;
		status: StatusPessoa;
		cep: string | null;
		observacao: string | null;
		usuarioId: number;
		razaoSocial: string | null;
		nomeFantasia: string | null;
		numeroEndereco: string | null;
		createdAt: Date | null;
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
			razaoSocial: entity.getRazaoSocial(),
			nomeFantasia: entity.getNomeFantasia(),
			numeroEndereco: entity.getNumeroEndereco(),
			createdAt: entity.getCreatedAt(),
		};
	}
}
