import { Inject, Injectable } from '@nestjs/common';
import { I_USUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { UsuarioResponseDto } from '../dtos/usuario-response.dto';

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(): Promise<UsuarioResponseDto[]> {
    const list = await this.usuarioRepository.listar();
    return UsuarioResponseDto.fromEntities(list);
  }
}
