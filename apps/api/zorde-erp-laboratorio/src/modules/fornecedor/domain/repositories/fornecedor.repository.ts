import type { FornecedorEntity } from '../entities/fornecedor.entity';

export const IFORNECEDOR_REPOSITORY = 'IFornecedorRepository';

export interface IFornecedorRepository {
	create(fornecedor: FornecedorEntity): Promise<FornecedorEntity>;
	findById(id: number, usuarioId: number): Promise<FornecedorEntity | null>;
	findByUsuarioId(usuarioId: number): Promise<FornecedorEntity[]>;
	update(fornecedor: FornecedorEntity): Promise<FornecedorEntity>;
	softDelete(id: number, usuarioId: number): Promise<void>;
}
