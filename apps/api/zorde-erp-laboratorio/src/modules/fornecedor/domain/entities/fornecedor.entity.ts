import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';

export class FornecedorEntity {
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
  deletedAt?: Date;

  constructor(props: Partial<FornecedorEntity>) {
    Object.assign(this, props);
  }

  static create(props: Omit<FornecedorEntity, 'id' | 'createdAt'> & { id?: number; createdAt?: Date }) {
    return new FornecedorEntity({
      ...props,
      createdAt: props.createdAt || new Date(),
      status: props.status || StatusPessoa.ATIVO,
    });
  }
}
