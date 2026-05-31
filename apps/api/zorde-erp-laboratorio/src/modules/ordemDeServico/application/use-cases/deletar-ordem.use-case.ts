import { Inject, Injectable } from '@nestjs/common';
import { I_ORDEM_DE_SERVICO_REPOSITORY } from '../../domain/repositories/i-ordem-de-servico.repository';
import type { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class DeletarOrdemUseCase {
  constructor(
    @Inject(I_ORDEM_DE_SERVICO_REPOSITORY)
    private readonly ordemDeServicoRepository: IOrdemDeServicoRepository,
  ) {}

  async execute(id: number, usuarioId: number): Promise<void> {
    const existing = await this.ordemDeServicoRepository.buscarPorId(id);

    if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Ordem de serviço não encontrada');
    }

    await this.ordemDeServicoRepository.deletarSoft(id);
  }
}
