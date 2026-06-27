import { Inject, Injectable } from '@nestjs/common';
import { IUSUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';

@Injectable()
export class DeletarUsuarioUseCase {
  constructor(
    @Inject(IUSUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.usuarioRepository.buscarPorId(id);
    if (!existing) {
      throw new EntityNotFoundException('Usuário não encontrado');
    }
    await this.usuarioRepository.deletar(id);
  }
}
