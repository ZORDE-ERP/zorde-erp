import { Inject, Injectable } from '@nestjs/common';
import type { IAutenticacaoRepository } from '../../domain/repositories/i-autenticacao.repository';
import { IAUTENTICACAO_REPOSITORY } from '../../domain/repositories/i-autenticacao.repository';

@Injectable()
export class LogoutUseCase {
	public constructor(@Inject(IAUTENTICACAO_REPOSITORY) private readonly autenticacaoRepository: IAutenticacaoRepository) {}

	public async execute(userId: number): Promise<void> {
		await this.autenticacaoRepository.deletarPorUsuario(userId);
	}
}
