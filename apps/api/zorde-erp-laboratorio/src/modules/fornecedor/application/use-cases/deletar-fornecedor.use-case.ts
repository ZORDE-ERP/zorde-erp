import { Inject, Injectable } from '@nestjs/common';
import { I_FORNECEDOR_REPOSITORY } from '../../domain/repositories/i-fornecedor.repository';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class DeletarFornecedorUseCase {
  constructor(
    @Inject(I_FORNECEDOR_REPOSITORY)
    private readonly fornecedorRepository: IFornecedorRepository,
  ) {}

  async execute(id: number, usuarioId: number): Promise<void> {
    const existing = await this.fornecedorRepository.buscarPorId(id);

    if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Fornecedor não encontrado');
    }

    await this.fornecedorRepository.deletarSoft(id);
  }
}
