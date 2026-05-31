import { Inject, Injectable } from '@nestjs/common';
import { I_FORNECEDOR_REPOSITORY } from '../../domain/repositories/i-fornecedor.repository';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { FornecedorResponseDto } from '../dtos/fornecedor-response.dto';

@Injectable()
export class ListarFornecedoresUseCase {
  constructor(
    @Inject(I_FORNECEDOR_REPOSITORY)
    private readonly fornecedorRepository: IFornecedorRepository,
  ) {}

  async execute(usuarioId: number): Promise<FornecedorResponseDto[]> {
    const list = await this.fornecedorRepository.listarPorUsuario(usuarioId);
    return FornecedorResponseDto.fromEntities(list);
  }
}
