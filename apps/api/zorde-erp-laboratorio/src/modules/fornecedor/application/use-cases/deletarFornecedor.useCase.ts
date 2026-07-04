import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
import { IFORNECEDOR_REPOSITORY } from '../../domain/repositories/fornecedor.repository';

@Injectable()
export class DeleteFornecedorUseCase {
	public constructor(
		@Inject(IFORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<void> {
		const existing = await this.fornecedorRepository.findById(id, usuarioId);

		if (!existing) {
			throw new EntityNotFoundException('Fornecedor não encontrado');
		}

		await this.fornecedorRepository.softDelete(id, usuarioId);
	}
}
