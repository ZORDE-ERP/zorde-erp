import { Inject, Injectable } from '@nestjs/common';
import { I_ORDEM_DE_SERVICO_REPOSITORY } from '../../domain/repositories/i-ordem-de-servico.repository';
import type { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';
import { OrdemDeServicoResponseDto } from '../dtos/ordem-de-servico-response.dto';

@Injectable()
export class ListarOrdemUseCase {
  constructor(
    @Inject(I_ORDEM_DE_SERVICO_REPOSITORY)
    private readonly ordemDeServicoRepository: IOrdemDeServicoRepository,
  ) {}

  async execute(usuarioId: number): Promise<OrdemDeServicoResponseDto[]> {
    const items = await this.ordemDeServicoRepository.listarPorUsuario(usuarioId);
    return OrdemDeServicoResponseDto.fromEntities(items);
  }
}
