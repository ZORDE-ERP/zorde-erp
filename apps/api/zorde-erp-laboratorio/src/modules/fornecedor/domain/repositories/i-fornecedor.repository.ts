import { FornecedorEntity } from '../entities/fornecedor.entity';

export const I_FORNECEDOR_REPOSITORY = 'IFornecedorRepository';

export interface IFornecedorRepository {
  criar(fornecedor: FornecedorEntity): Promise<FornecedorEntity>;
  buscarPorId(id: number): Promise<FornecedorEntity | null>;
  listarPorUsuario(usuarioId: number): Promise<FornecedorEntity[]>;
  atualizar(id: number, fornecedor: Partial<FornecedorEntity>): Promise<FornecedorEntity>;
  deletarSoft(id: number): Promise<void>;
}
