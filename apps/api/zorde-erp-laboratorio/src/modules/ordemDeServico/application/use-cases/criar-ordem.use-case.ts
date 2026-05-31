import { Inject, Injectable } from '@nestjs/common';
import { I_ORDEM_DE_SERVICO_REPOSITORY } from '../../domain/repositories/i-ordem-de-servico.repository';
import type { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';
import { I_CLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../../cliente/domain/repositories/i-cliente.repository';
import { I_TABELA_MONTAGEM_REPOSITORY } from '../../../tabelaMontagem/domain/repositories/i-tabela-montagem.repository';
import type { ITabelaMontagemRepository } from '../../../tabelaMontagem/domain/repositories/i-tabela-montagem.repository';
import { CriarOrdemDto } from '../dtos/criar-ordem.dto';
import { OrdemDeServicoResponseDto } from '../dtos/ordem-de-servico-response.dto';
import { OrdemDeServicoEntity } from '../../domain/entities/ordem-de-servico.entity';
import { TabelaMontagemEntity } from '../../../tabelaMontagem/domain/entities/tabela-montagem.entity';
import { EntityNotFoundException, BusinessRuleException } from '../../../../shared/errors/app.exception';

@Injectable()
export class CriarOrdemUseCase {
  constructor(
    @Inject(I_ORDEM_DE_SERVICO_REPOSITORY)
    private readonly ordemDeServicoRepository: IOrdemDeServicoRepository,
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
    @Inject(I_TABELA_MONTAGEM_REPOSITORY)
    private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
  ) {}

  async execute(dto: CriarOrdemDto, usuarioId: number): Promise<OrdemDeServicoResponseDto> {
    const cliente = await this.clienteRepository.buscarPorId(dto.clienteId);

    if (!cliente || cliente.deletedAt || cliente.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Cliente não encontrado');
    }

    let tabelaMontagem: TabelaMontagemEntity | null = null;
    if (dto.tabelaMontagemId !== undefined && dto.tabelaMontagemId !== null) {
      tabelaMontagem = await this.tabelaMontagemRepository.buscarPorId(dto.tabelaMontagemId);
      if (!tabelaMontagem || tabelaMontagem.deletedAt) {
        throw new EntityNotFoundException('Tabela de montagem não encontrada');
      }

      if (tabelaMontagem.clienteId !== dto.clienteId) {
        throw new BusinessRuleException('A tabela de montagem selecionada não pertence ao cliente informado');
      }
    }

    const entity = OrdemDeServicoEntity.create({
      codigoOs: dto.codigoOs,
      clienteId: dto.clienteId,
      valor: dto.valor || (tabelaMontagem ? tabelaMontagem.valor : undefined),
      tabelaMontagemId: dto.tabelaMontagemId,
      usuarioId,
    });

    const created = await this.ordemDeServicoRepository.criar(entity);
    created.cliente = cliente;
    created.tabelaMontagem = tabelaMontagem || undefined;

    return OrdemDeServicoResponseDto.fromEntity(created);
  }
}
