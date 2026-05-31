import { Inject, Injectable } from '@nestjs/common';
import { I_FORNECEDOR_REPOSITORY } from '../../domain/repositories/i-fornecedor.repository';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { FornecedorResponseDto } from '../dtos/fornecedor-response.dto';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class BuscarFornecedorUseCase {
  constructor(
    @Inject(I_FORNECEDOR_REPOSITORY)
    private readonly fornecedorRepository: IFornecedorRepository,
  ) {}

  async execute(id: number, usuarioId: number): Promise<FornecedorResponseDto> {
    const fornecedor = await this.fornecedorRepository.buscarPorId(id);

    if (!fornecedor || fornecedor.deletedAt || fornecedor.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Fornecedor não encontrado');
    }

    return FornecedorResponseDto.fromEntity(fornecedor);
  }
}
