import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from 'src/shared/errors/app.exception';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { IUSUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';
import type { UsuarioResponseDto } from '../dtos/usuarioResponse.dto';
import { usuarioToResponse } from '../mappers/usuarioResponse.mapper';

@Injectable()
export class BuscarUsuarioPorEmailUseCase {
	public constructor(
		@Inject(IUSUARIO_REPOSITORY)
		private readonly usuarioRepository: IUsuarioRepository,
	) {}

	public async execute(email: string): Promise<UsuarioResponseDto | null> {
		const user = await this.usuarioRepository.buscarPorEmail(email);
		if (!user) throw new EntityNotFoundException('Usuário não encontrado');
		return usuarioToResponse(user);
	}
}
