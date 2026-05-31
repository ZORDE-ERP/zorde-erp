import { ClienteEntity } from '../../../cliente/domain/entities/cliente.entity';
import { TabelaMontagemEntity } from '../../../tabelaMontagem/domain/entities/tabela-montagem.entity';

export class OrdemDeServicoEntity {
  id: number;
  codigoOs: string;
  clienteId: number;
  valor?: number;
  tabelaMontagemId?: number;
  usuarioId: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  // Relacionamentos carregados opcionalmente
  cliente?: ClienteEntity;
  tabelaMontagem?: TabelaMontagemEntity;

  constructor(props: Partial<OrdemDeServicoEntity>) {
    Object.assign(this, props);
  }

  static create(props: Omit<OrdemDeServicoEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: Date }) {
    return new OrdemDeServicoEntity({
      ...props,
      createdAt: props.createdAt || new Date(),
    });
  }
}
