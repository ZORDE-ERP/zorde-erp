import { Inject, Injectable } from '@nestjs/common';
import { IUSUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { UsuarioResponseDto } from '../dtos/usuario-response.dto';

@Injectable()
export class FindByEmailUserUseCase {
  constructor(
    @Inject(IUSUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  public async execute(email: string): Promise<UsuarioResponseDto | null> {

    const user = await this.usuarioRepository.buscarPorEmail(email);
    
    if (!user?.getId()) return null;

    return UsuarioResponseDto.fromEntity(user);
  }
}
