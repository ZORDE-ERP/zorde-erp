import { Injectable } from '@nestjs/common';
import { CriarClienteUseCase } from '../use-cases/criar-cliente.use-case';
import { BuscarClienteUseCase } from '../use-cases/buscar-cliente.use-case';
import { ListarClientesUseCase } from '../use-cases/listar-clientes.use-case';
import { AtualizarClienteUseCase } from '../use-cases/atualizar-cliente.use-case';
import { DeletarClienteUseCase } from '../use-cases/deletar-cliente.use-case';
import { CriarClienteDto } from '../dtos/criar-cliente.dto';
import { AtualizarClienteDto } from '../dtos/atualizar-cliente.dto';
import { ClienteResponseDto } from '../dtos/cliente-response.dto';

@Injectable()
export class ClienteService {
  constructor(
    private readonly criarClienteUseCase: CriarClienteUseCase,
    private readonly buscarClienteUseCase: BuscarClienteUseCase,
    private readonly listarClientesUseCase: ListarClientesUseCase,
    private readonly atualizarClienteUseCase: AtualizarClienteUseCase,
    private readonly deletarClienteUseCase: DeletarClienteUseCase,
  ) {}

  async criar(dto: CriarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
    return this.criarClienteUseCase.execute(dto, usuarioId);
  }

  async buscarPorId(id: number, usuarioId: number): Promise<ClienteResponseDto> {
    return this.buscarClienteUseCase.execute(id, usuarioId);
  }

  async listarPorUsuario(usuarioId: number): Promise<ClienteResponseDto[]> {
    return this.listarClientesUseCase.execute(usuarioId);
  }

  async atualizar(id: number, dto: AtualizarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
    return this.atualizarClienteUseCase.execute(id, dto, usuarioId);
  }

  async deletar(id: number, usuarioId: number): Promise<void> {
    return this.deletarClienteUseCase.execute(id, usuarioId);
  }
}
