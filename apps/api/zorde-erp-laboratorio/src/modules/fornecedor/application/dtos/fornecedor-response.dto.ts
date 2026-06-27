import type { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import type { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import type { FornecedorEntity } from '../../domain/entities/fornecedor.entity';

export class FornecedorResponseDto {
	public id: number;
	public nome: string;
	public email: string;
	public contato?: string;
	public tipoPessoa: TipoPessoa;
	public documento: string;
	public status: StatusPessoa;
	public cep?: string;
	public uf?: string;
	public cidade?: string;
	public logradouro?: string;
	public numero?: string;
	public bairro?: string;
	public observacao?: string;
	public usuarioId: number;
	public createdAt: Date;
	public updatedAt?: Date;

	public static fromEntity(entity: FornecedorEntity): FornecedorResponseDto {
		return {
			id: entity.id,
			nome: entity.nome,
			email: entity.email,
			contato: entity.contato,
			tipoPessoa: entity.tipoPessoa,
			documento: entity.documento,
			status: entity.status,
			cep: entity.cep,
			uf: entity.uf,
			cidade: entity.cidade,
			logradouro: entity.logradouro,
			numero: entity.numero,
			bairro: entity.bairro,
			observacao: entity.observacao,
			usuarioId: entity.usuarioId,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	}

	public static fromEntities(entities: FornecedorEntity[]): FornecedorResponseDto[] {
		return entities.map((entity) => FornecedorResponseDto.fromEntity(entity));
	}
}
