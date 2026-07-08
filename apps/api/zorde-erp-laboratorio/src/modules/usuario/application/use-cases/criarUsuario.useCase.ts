import { Inject, Injectable } from '@nestjs/common';
import { ConflictException } from '../../../../shared/errors/app.exception';
import { PasswordHashingService } from '../../../auth/infra/services/password-hashing.service';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { IUSUARIO_REPOSITORY, type IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import type { CriarUsuarioDto } from '../dtos/usuario.dto';
import type { UsuarioResponseDto } from '../dtos/usuarioResponse.dto';
import { usuarioToResponse } from '../mappers/usuarioResponse.mapper';

@Injectable()
export class CriarUsuarioUseCase {
	public constructor(
		@Inject(IUSUARIO_REPOSITORY)
		private readonly usuarioRepository: IUsuarioRepository,
		private readonly passwordHashingService: PasswordHashingService,
	) {}

	public async execute(dto: CriarUsuarioDto): Promise<UsuarioResponseDto> {
		const user = await this.usuarioRepository.buscarPorEmail(dto.email);
		if (user) throw new ConflictException('E-mail já cadastrado');

		const hashedPassword = await this.passwordHashingService.hash(dto.senha);

		const newUser = new UsuarioEntity({
			email: dto.email,
			senha: hashedPassword,
			nome: dto.nome,
			documento: dto.documento,
			contato: dto.contato,
			ultimoAcesso: null,
			tipoUsuario: dto.tipoUsuario,
		});

		const created = await this.usuarioRepository.criar(newUser);
		return usuarioToResponse(created);
	}
}
