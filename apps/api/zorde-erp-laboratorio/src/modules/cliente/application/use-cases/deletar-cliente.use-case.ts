import { Inject, Injectable } from '@nestjs/common';
import { I_CLIENTE_REPOSITORY } from '../../domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../domain/repositories/i-cliente.repository';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class DeletarClienteUseCase {
  constructor(
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: number, usuarioId: number): Promise<void> {
    const existing = await this.clienteRepository.buscarPorId(id);

    if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Cliente não encontrado');
    }

    await this.clienteRepository.deletarSoft(id);
  }
}
