import { TabelaMontagemEntity } from '../../domain/entities/tabela-montagem.entity';
import { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

export class TabelaMontagemResponseDto {
  id: number;
  clienteId: number;
  nomeCliente?: string;
  servico: TipoServico;
  valor: number;
  createdAt: Date;
  updatedAt?: Date;

  static fromEntity(entity: TabelaMontagemEntity): TabelaMontagemResponseDto {
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

  static fromEntities(entities: TabelaMontagemEntity[]): TabelaMontagemResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
