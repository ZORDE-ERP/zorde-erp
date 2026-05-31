import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';

export class FornecedorResponseDto {
  id: number;
  nome: string;
  email: string;
  contato?: string;
  tipoPessoa: TipoPessoa;
  documento: string;
  status: StatusPessoa;
  cep?: string;
  uf?: string;
  cidade?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  observacao?: string;
  usuarioId: number;
  createdAt: Date;
  updatedAt?: Date;

  static fromEntity(entity: FornecedorEntity): FornecedorResponseDto {
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

  static fromEntities(entities: FornecedorEntity[]): FornecedorResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
