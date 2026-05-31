import { Inject, Injectable } from '@nestjs/common';
import { I_TABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/i-tabela-montagem.repository';
import type { ITabelaMontagemRepository } from '../../domain/repositories/i-tabela-montagem.repository';
import { I_CLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../../cliente/domain/repositories/i-cliente.repository';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class DeletarTabelaMontagemUseCase {
  constructor(
    @Inject(I_TABELA_MONTAGEM_REPOSITORY)
    private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: number, usuarioId: number): Promise<void> {
    const existing = await this.tabelaMontagemRepository.buscarPorId(id);

    if (!existing || existing.deletedAt) {
      throw new EntityNotFoundException('Tabela de montagem não encontrada');
    }

    const cliente = await this.clienteRepository.buscarPorId(existing.clienteId);
    if (!cliente || cliente.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Tabela de montagem não encontrada');
    }

    await this.tabelaMontagemRepository.deletarSoft(id);
  }
}
