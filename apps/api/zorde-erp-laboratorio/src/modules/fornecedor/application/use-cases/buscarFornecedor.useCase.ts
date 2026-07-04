import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
import { IFORNECEDOR_REPOSITORY } from '../../domain/repositories/fornecedor.repository';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { fornecedorToResponse } from '../mappers/fornecedorResponse.mapper';

@Injectable()
export class FindByIdFornecedorUseCase {
	public constructor(
		@Inject(IFORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<FornecedorResponseDto> {
		const fornecedor = await this.fornecedorRepository.findById(id, usuarioId);

		if (!fornecedor) {
			throw new EntityNotFoundException('Fornecedor não encontrado');
		}

		return fornecedorToResponse(fornecedor);
	}
}
