import { Inject, Injectable } from '@nestjs/common';
import type { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
import { IFORNECEDOR_REPOSITORY } from '../../domain/repositories/fornecedor.repository';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { fornecedoresToResponse } from '../mappers/fornecedorResponse.mapper';

@Injectable()
export class FindAllFornecedoresUseCase {
	public constructor(
		@Inject(IFORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(usuarioId: number): Promise<FornecedorResponseDto[]> {
		const fornecedores = await this.fornecedorRepository.findByUsuarioId(usuarioId);
		return fornecedoresToResponse(fornecedores);
	}
}
