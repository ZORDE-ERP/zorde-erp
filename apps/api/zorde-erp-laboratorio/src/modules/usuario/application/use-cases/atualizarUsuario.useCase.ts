import { Inject, Injectable } from '@nestjs/common';
import { ConflictException, EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { PasswordHashingService } from '../../../auth/infra/services/password-hashing.service';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { IUSUARIO_REPOSITORY } from '../../domain/repositories/i-usuario.repository';
import type { AtualizarUsuarioDto } from '../dtos/usuario.dto';
import type { UsuarioResponseDto } from '../dtos/usuarioResponse.dto';
import { usuarioToResponse } from '../mappers/usuarioResponse.mapper';

@Injectable()
export class AtualizarUsuarioUseCase {
	public constructor(
		@Inject(IUSUARIO_REPOSITORY)
		private readonly usuarioRepository: IUsuarioRepository,
		private readonly passwordHashingService: PasswordHashingService,
	) {}

	public async execute(id: number, dto: AtualizarUsuarioDto): Promise<UsuarioResponseDto> {
		const existing = await this.usuarioRepository.buscarPorId(id);
		if (!existing) throw new EntityNotFoundException('Usuário não encontrado');

		if (dto.email !== undefined && dto.email !== existing.getEmail()) {
			const other = await this.usuarioRepository.buscarPorEmail(dto.email);
			if (other && other.getId() !== id) throw new ConflictException('E-mail já cadastrado');
		}

		if (dto.documento !== undefined && dto.documento !== existing.getDocumento()) {
			const other = await this.usuarioRepository.buscarPorDocumento(dto.documento);
			if (other && other.getId() !== id) throw new ConflictException('Documento já cadastrado');
		}

		const senhaHash = dto.senha ? await this.passwordHashingService.hash(dto.senha) : undefined;

		const updated = await this.usuarioRepository.atualizar(id, {
			...dto,
			senha: senhaHash,
			updatedAt: new Date(),
		});

		const { senha, ...responseDto } = usuarioToResponse(updated);
		return responseDto;
	}
}
