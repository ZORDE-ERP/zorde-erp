import { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

export class TabelaMontagemEntity {
  id: number;
  clienteId: number;
  servico: TipoServico;
  valor: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  // Campo enriquecido opcionalmente populado na infra/use cases
  nomeCliente?: string;

  constructor(props: Partial<TabelaMontagemEntity>) {
    Object.assign(this, props);
  }

  static create(props: Omit<TabelaMontagemEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: Date }) {
    return new TabelaMontagemEntity({
      ...props,
      createdAt: props.createdAt || new Date(),
    });
  }
}
