import { Inject, Injectable } from '@nestjs/common';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { I_FORNECEDOR_REPOSITORY } from '../../domain/repositories/i-fornecedor.repository';
import { FornecedorResponseDto } from '../dtos/fornecedor-response.dto';

@Injectable()
export class ListarFornecedoresUseCase {
	public constructor(
		@Inject(I_FORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(usuarioId: number): Promise<FornecedorResponseDto[]> {
		const list = await this.fornecedorRepository.listarPorUsuario(usuarioId);
		return FornecedorResponseDto.fromEntities(list);
	}
}
