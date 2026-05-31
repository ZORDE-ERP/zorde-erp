import { Inject, Injectable } from '@nestjs/common';
import { I_TABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/i-tabela-montagem.repository';
import type { ITabelaMontagemRepository } from '../../domain/repositories/i-tabela-montagem.repository';
import { I_CLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../../cliente/domain/repositories/i-cliente.repository';
import { AtualizarTabelaMontagemDto } from '../dtos/atualizar-tabela-montagem.dto';
import { TabelaMontagemResponseDto } from '../dtos/tabela-montagem-response.dto';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class AtualizarTabelaMontagemUseCase {
  constructor(
    @Inject(I_TABELA_MONTAGEM_REPOSITORY)
    private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(
    id: number,
    dto: AtualizarTabelaMontagemDto,
    usuarioId: number,
  ): Promise<TabelaMontagemResponseDto> {
    const existing = await this.tabelaMontagemRepository.buscarPorId(id);

    if (!existing || existing.deletedAt) {
      throw new EntityNotFoundException('Tabela de montagem não encontrada');
    }

    // Verificar se o cliente da tabela existente pertence ao usuário
    const existingCliente = await this.clienteRepository.buscarPorId(existing.clienteId);
    if (!existingCliente || existingCliente.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Tabela de montagem não encontrada');
    }

    const updateData: any = {};
    let finalClienteNome = existingCliente.nome;

    if (dto.clienteId !== undefined && dto.clienteId !== existing.clienteId) {
      const newCliente = await this.clienteRepository.buscarPorId(dto.clienteId);
      if (!newCliente || newCliente.deletedAt || newCliente.usuarioId !== usuarioId) {
        throw new EntityNotFoundException('Cliente não encontrado');
      }
      updateData.clienteId = dto.clienteId;
      finalClienteNome = newCliente.nome;
    }

    if (dto.servico !== undefined) updateData.servico = dto.servico;
    if (dto.valor !== undefined) updateData.valor = dto.valor;

    updateData.updatedAt = new Date();

    const updated = await this.tabelaMontagemRepository.atualizar(id, updateData);
    updated.nomeCliente = finalClienteNome;

    return TabelaMontagemResponseDto.fromEntity(updated);
  }
}
