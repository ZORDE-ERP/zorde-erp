import { OrdemDeServicoEntity } from '../../domain/entities/ordem-de-servico.entity';

export class OrdemDeServicoResponseDto {
  id: number;
  codigoOs: string;
  clienteId: number;
  valor?: number;
  tabelaMontagemId?: number;
  usuarioId: number;
  createdAt: Date;
  updatedAt?: Date;

  cliente?: {
    id: number;
    nome: string;
  };

  tabelaMontagem?: {
    id: number;
    servico: string;
  };

  static fromEntity(entity: OrdemDeServicoEntity): OrdemDeServicoResponseDto {
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
        id: entity.cliente.id,
        nome: entity.cliente.nome,
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

  static fromEntities(entities: OrdemDeServicoEntity[]): OrdemDeServicoResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
