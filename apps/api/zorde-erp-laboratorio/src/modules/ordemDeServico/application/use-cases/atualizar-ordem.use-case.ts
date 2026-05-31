import { Inject, Injectable } from '@nestjs/common';
import { I_ORDEM_DE_SERVICO_REPOSITORY } from '../../domain/repositories/i-ordem-de-servico.repository';
import type { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';
import { I_CLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../../cliente/domain/repositories/i-cliente.repository';
import { I_TABELA_MONTAGEM_REPOSITORY } from '../../../tabelaMontagem/domain/repositories/i-tabela-montagem.repository';
import type { ITabelaMontagemRepository } from '../../../tabelaMontagem/domain/repositories/i-tabela-montagem.repository';
import { AtualizarOrdemDto } from '../dtos/atualizar-ordem.dto';
import { OrdemDeServicoResponseDto } from '../dtos/ordem-de-servico-response.dto';
import { EntityNotFoundException, BusinessRuleException } from '../../../../shared/errors/app.exception';

@Injectable()
export class AtualizarOrdemUseCase {
  constructor(
    @Inject(I_ORDEM_DE_SERVICO_REPOSITORY)
    private readonly ordemDeServicoRepository: IOrdemDeServicoRepository,
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
    @Inject(I_TABELA_MONTAGEM_REPOSITORY)
    private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
  ) {}

  async execute(
    id: number,
    dto: AtualizarOrdemDto,
    usuarioId: number,
  ): Promise<OrdemDeServicoResponseDto> {
    const existing = await this.ordemDeServicoRepository.buscarPorId(id);

    if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Ordem de serviço não encontrada');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    let targetClienteId = existing.clienteId;
    if (dto.clienteId !== undefined && dto.clienteId !== existing.clienteId) {
      const newCliente = await this.clienteRepository.buscarPorId(dto.clienteId);
      if (!newCliente || newCliente.deletedAt || newCliente.usuarioId !== usuarioId) {
        throw new EntityNotFoundException('Cliente não encontrado');
      }
      targetClienteId = dto.clienteId;
      updateData.clienteId = dto.clienteId;
    }

    let targetTabelaMontagemId = existing.tabelaMontagemId;
    if (dto.tabelaMontagemId !== undefined) {
      targetTabelaMontagemId = dto.tabelaMontagemId;
      updateData.tabelaMontagemId = dto.tabelaMontagemId;
    }

    if (targetTabelaMontagemId !== null && targetTabelaMontagemId !== undefined) {
      const tabela = await this.tabelaMontagemRepository.buscarPorId(targetTabelaMontagemId);
      if (!tabela || tabela.deletedAt) {
        throw new EntityNotFoundException('Tabela de montagem não encontrada');
      }

      if (tabela.clienteId !== targetClienteId) {
        throw new BusinessRuleException('A tabela de montagem selecionada não pertence ao cliente informado');
      }

      // Se a tabela mudou e não informou valor explicitamente no DTO, atualiza para o valor da tabela
      if (
        dto.valor === undefined &&
        dto.tabelaMontagemId !== undefined &&
        dto.tabelaMontagemId !== existing.tabelaMontagemId
      ) {
        updateData.valor = tabela.valor;
      }
    }

    if (dto.codigoOs !== undefined) updateData.codigoOs = dto.codigoOs;
    if (dto.valor !== undefined) updateData.valor = dto.valor;

    const updated = await this.ordemDeServicoRepository.atualizar(id, updateData);

    // Eager load details manually if not fully filled by repo update
    if (!updated.cliente) {
      const cliente = await this.clienteRepository.buscarPorId(updated.clienteId);
      if (cliente) updated.cliente = cliente;
    }
    if (updated.tabelaMontagemId && !updated.tabelaMontagem) {
      const tab = await this.tabelaMontagemRepository.buscarPorId(updated.tabelaMontagemId);
      if (tab) updated.tabelaMontagem = tab;
    }

    return OrdemDeServicoResponseDto.fromEntity(updated);
  }
}
