import { Injectable } from '@nestjs/common';
import type { AtualizarUsuarioDto } from '../dtos/atualizar-usuario.dto';
import type { CriarUsuarioDto } from '../dtos/criar-usuario.dto';
import type { UsuarioResponseDto } from '../dtos/usuario-response.dto';
import { AtualizarUsuarioUseCase } from '../use-cases/atualizar-usuario.use-case';
import { CriarUsuarioUseCase } from '../use-cases/criar-usuario.use-case';
import { DeletarUsuarioUseCase } from '../use-cases/deletar-usuario.use-case';
import { FindByEmailUserUseCase } from '../use-cases/findByEmailUser';

@Injectable()
export class UsuarioService {
	public constructor(
		private readonly criarUsuarioUseCase: CriarUsuarioUseCase,
		private readonly findByEmailUserUseCase: FindByEmailUserUseCase,
		private readonly atualizarUsuarioUseCase: AtualizarUsuarioUseCase,
		private readonly deletarUsuarioUseCase: DeletarUsuarioUseCase,
	) {}

	public async criar(dto: CriarUsuarioDto): Promise<UsuarioResponseDto> {
		return this.criarUsuarioUseCase.execute(dto);
	}

	public async findByEmail(email: string): Promise<UsuarioResponseDto | null> {
		return this.findByEmailUserUseCase.execute(email);
	}

	public async atualizar(id: number, dto: AtualizarUsuarioDto): Promise<UsuarioResponseDto> {
		return this.atualizarUsuarioUseCase.execute(id, dto);
	}

	public async deletar(id: number): Promise<void> {
		return this.deletarUsuarioUseCase.execute(id);
	}
}
