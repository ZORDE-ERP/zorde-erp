import { Injectable } from '@nestjs/common';
import type { AtualizarUsuarioDto, CriarUsuarioDto } from '../dtos/usuario.dto';
import type { UsuarioResponseDto } from '../dtos/usuarioResponse.dto';
import { AtualizarUsuarioUseCase } from '../use-cases/atualizarUsuario.useCase';
import { BuscarUsuarioPorEmailUseCase } from '../use-cases/buscarUsuarioPorEmail.useCase';
import { CriarUsuarioUseCase } from '../use-cases/criarUsuario.useCase';
import { DeletarUsuarioUseCase } from '../use-cases/deletarUsuario.useCase';

@Injectable()
export class UsuarioService {
	public constructor(
		private readonly createUserUseCase: CriarUsuarioUseCase,
		private readonly findUserByEmailUseCase: BuscarUsuarioPorEmailUseCase,
		private readonly updateUserUseCase: AtualizarUsuarioUseCase,
		private readonly deleteUserUseCase: DeletarUsuarioUseCase,
	) {}

	public async criar(dto: CriarUsuarioDto): Promise<UsuarioResponseDto> {
		return this.createUserUseCase.execute(dto);
	}

	public async findByEmail(email: string): Promise<UsuarioResponseDto | null> {
		return this.findUserByEmailUseCase.execute(email);
	}

	public async atualizar(id: number, dto: AtualizarUsuarioDto): Promise<UsuarioResponseDto> {
		return this.updateUserUseCase.execute(id, dto);
	}

	public async deletar(id: number): Promise<void> {
		return this.deleteUserUseCase.execute(id);
	}
}
