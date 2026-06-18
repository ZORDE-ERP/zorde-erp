import { Injectable } from '@nestjs/common';
import { CriarUsuarioUseCase } from '../use-cases/criar-usuario.use-case';
import { FindByEmailUserUseCase } from '../use-cases/findByEmailUser';
import { AtualizarUsuarioUseCase } from '../use-cases/atualizar-usuario.use-case';
import { DeletarUsuarioUseCase } from '../use-cases/deletar-usuario.use-case';
import { CriarUsuarioDto } from '../dtos/criar-usuario.dto';
import { AtualizarUsuarioDto } from '../dtos/atualizar-usuario.dto';
import { UsuarioResponseDto } from '../dtos/usuario-response.dto';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly criarUsuarioUseCase: CriarUsuarioUseCase,
    private readonly findByEmailUserUseCase: FindByEmailUserUseCase,
    private readonly atualizarUsuarioUseCase: AtualizarUsuarioUseCase,
    private readonly deletarUsuarioUseCase: DeletarUsuarioUseCase,
  ) {}

  async criar(dto: CriarUsuarioDto): Promise<UsuarioResponseDto> {
    return this.criarUsuarioUseCase.execute(dto);
  }

  async findByEmail(email: string): Promise<UsuarioResponseDto | null> {
    return this.findByEmailUserUseCase.execute(email);
  }

  async atualizar(id: number, dto: AtualizarUsuarioDto): Promise<UsuarioResponseDto> {
    return this.atualizarUsuarioUseCase.execute(id, dto);
  }

  async deletar(id: number): Promise<void> {
    return this.deletarUsuarioUseCase.execute(id);
  }
}
