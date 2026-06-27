import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { I_FORNECEDOR_REPOSITORY } from '../../domain/repositories/i-fornecedor.repository';

@Injectable()
export class DeletarFornecedorUseCase {
	public constructor(
		@Inject(I_FORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<void> {
		const existing = await this.fornecedorRepository.buscarPorId(id);

		if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
			throw new EntityNotFoundException('Fornecedor não encontrado');
		}

		await this.fornecedorRepository.deletarSoft(id);
	}
}
