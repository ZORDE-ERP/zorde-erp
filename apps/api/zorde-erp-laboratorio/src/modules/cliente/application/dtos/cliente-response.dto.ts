import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';

export class ClienteResponseDto {
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

  static fromEntity(entity: ClienteEntity): ClienteResponseDto {
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

  static fromEntities(entities: ClienteEntity[]): ClienteResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
