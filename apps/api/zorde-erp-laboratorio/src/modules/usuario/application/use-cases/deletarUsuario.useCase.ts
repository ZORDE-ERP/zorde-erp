import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { IUSUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';

@Injectable()
export class DeletarUsuarioUseCase {
	public constructor(
		@Inject(IUSUARIO_REPOSITORY)
		private readonly usuarioRepository: IUsuarioRepository,
	) {}

	public async execute(id: number): Promise<void> {
		const existing = await this.usuarioRepository.buscarPorId(id);
		if (!existing) throw new EntityNotFoundException('Usuário não encontrado');
		await this.usuarioRepository.deletar(id);
	}
}
