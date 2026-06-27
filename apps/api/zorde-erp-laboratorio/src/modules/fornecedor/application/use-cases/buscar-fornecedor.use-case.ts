import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { I_FORNECEDOR_REPOSITORY } from '../../domain/repositories/i-fornecedor.repository';
import { FornecedorResponseDto } from '../dtos/fornecedor-response.dto';

@Injectable()
export class BuscarFornecedorUseCase {
	public constructor(
		@Inject(I_FORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<FornecedorResponseDto> {
		const fornecedor = await this.fornecedorRepository.buscarPorId(id);

		if (!fornecedor || fornecedor.deletedAt || fornecedor.usuarioId !== usuarioId) {
			throw new EntityNotFoundException('Fornecedor não encontrado');
		}

		return FornecedorResponseDto.fromEntity(fornecedor);
	}
}
