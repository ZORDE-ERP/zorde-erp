import { Inject, Injectable } from '@nestjs/common';
import { I_TABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/i-tabela-montagem.repository';
import type { ITabelaMontagemRepository } from '../../domain/repositories/i-tabela-montagem.repository';
import { I_CLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../../cliente/domain/repositories/i-cliente.repository';
import { CriarTabelaMontagemDto } from '../dtos/criar-tabela-montagem.dto';
import { TabelaMontagemResponseDto } from '../dtos/tabela-montagem-response.dto';
import { TabelaMontagemEntity } from '../../domain/entities/tabela-montagem.entity';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class CriarTabelaMontagemUseCase {
  constructor(
    @Inject(I_TABELA_MONTAGEM_REPOSITORY)
    private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(dto: CriarTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
    const cliente = await this.clienteRepository.buscarPorId(dto.clienteId);

    if (!cliente || cliente.deletedAt || cliente.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Cliente não encontrado');
    }

    const entity = TabelaMontagemEntity.create({
      clienteId: dto.clienteId,
      servico: dto.servico,
      valor: dto.valor,
    });

    const created = await this.tabelaMontagemRepository.criar(entity);
    created.nomeCliente = cliente.nome;

    return TabelaMontagemResponseDto.fromEntity(created);
  }
}
