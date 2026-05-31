import { Inject, Injectable } from '@nestjs/common';
import { I_CLIENTE_REPOSITORY } from '../../domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../domain/repositories/i-cliente.repository';
import { ClienteResponseDto } from '../dtos/cliente-response.dto';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class BuscarClienteUseCase {
  constructor(
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: number, usuarioId: number): Promise<ClienteResponseDto> {
    const cliente = await this.clienteRepository.buscarPorId(id);

    if (!cliente || cliente.deletedAt || cliente.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Cliente não encontrado');
    }

    return ClienteResponseDto.fromEntity(cliente);
  }
}
