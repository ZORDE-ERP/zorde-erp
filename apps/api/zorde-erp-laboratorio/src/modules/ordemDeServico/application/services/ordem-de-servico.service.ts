import { Injectable } from '@nestjs/common';
import { CriarOrdemUseCase } from '../use-cases/criar-ordem.use-case';
import { BuscarOrdemUseCase } from '../use-cases/buscar-ordem.use-case';
import { ListarOrdemUseCase } from '../use-cases/listar-ordem.use-case';
import { AtualizarOrdemUseCase } from '../use-cases/atualizar-ordem.use-case';
import { DeletarOrdemUseCase } from '../use-cases/deletar-ordem.use-case';
import { CriarOrdemDto } from '../dtos/criar-ordem.dto';
import { AtualizarOrdemDto } from '../dtos/atualizar-ordem.dto';
import { OrdemDeServicoResponseDto } from '../dtos/ordem-de-servico-response.dto';

@Injectable()
export class OrdemDeServicoService {
  constructor(
    private readonly criarOrdemUseCase: CriarOrdemUseCase,
    private readonly buscarOrdemUseCase: BuscarOrdemUseCase,
    private readonly listarOrdemUseCase: ListarOrdemUseCase,
    private readonly atualizarOrdemUseCase: AtualizarOrdemUseCase,
    private readonly deletarOrdemUseCase: DeletarOrdemUseCase,
  ) {}

  async criar(dto: CriarOrdemDto, usuarioId: number): Promise<OrdemDeServicoResponseDto> {
    return this.criarOrdemUseCase.execute(dto, usuarioId);
  }

  async buscarPorId(id: number, usuarioId: number): Promise<OrdemDeServicoResponseDto> {
    return this.buscarOrdemUseCase.execute(id, usuarioId);
  }

  async listarPorUsuario(usuarioId: number): Promise<OrdemDeServicoResponseDto[]> {
    return this.listarOrdemUseCase.execute(usuarioId);
  }

  async atualizar(
    id: number,
    dto: AtualizarOrdemDto,
    usuarioId: number,
  ): Promise<OrdemDeServicoResponseDto> {
    return this.atualizarOrdemUseCase.execute(id, dto, usuarioId);
  }

  async deletar(id: number, usuarioId: number): Promise<void> {
    return this.deletarOrdemUseCase.execute(id, usuarioId);
  }
}
