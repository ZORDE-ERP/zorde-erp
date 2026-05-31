import { Injectable } from '@nestjs/common';
import { CriarFornecedorUseCase } from '../use-cases/criar-fornecedor.use-case';
import { BuscarFornecedorUseCase } from '../use-cases/buscar-fornecedor.use-case';
import { ListarFornecedoresUseCase } from '../use-cases/listar-fornecedores.use-case';
import { AtualizarFornecedorUseCase } from '../use-cases/atualizar-fornecedor.use-case';
import { DeletarFornecedorUseCase } from '../use-cases/deletar-fornecedor.use-case';
import { CriarFornecedorDto } from '../dtos/criar-fornecedor.dto';
import { AtualizarFornecedorDto } from '../dtos/atualizar-fornecedor.dto';
import { FornecedorResponseDto } from '../dtos/fornecedor-response.dto';

@Injectable()
export class FornecedorService {
  constructor(
    private readonly criarFornecedorUseCase: CriarFornecedorUseCase,
    private readonly buscarFornecedorUseCase: BuscarFornecedorUseCase,
    private readonly listarFornecedoresUseCase: ListarFornecedoresUseCase,
    private readonly atualizarFornecedorUseCase: AtualizarFornecedorUseCase,
    private readonly deletarFornecedorUseCase: DeletarFornecedorUseCase,
  ) {}

  async criar(dto: CriarFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
    return this.criarFornecedorUseCase.execute(dto, usuarioId);
  }

  async buscarPorId(id: number, usuarioId: number): Promise<FornecedorResponseDto> {
    return this.buscarFornecedorUseCase.execute(id, usuarioId);
  }

  async listarPorUsuario(usuarioId: number): Promise<FornecedorResponseDto[]> {
    return this.listarFornecedoresUseCase.execute(usuarioId);
  }

  async atualizar(id: number, dto: AtualizarFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
    return this.atualizarFornecedorUseCase.execute(id, dto, usuarioId);
  }

  async deletar(id: number, usuarioId: number): Promise<void> {
    return this.deletarFornecedorUseCase.execute(id, usuarioId);
  }
}
