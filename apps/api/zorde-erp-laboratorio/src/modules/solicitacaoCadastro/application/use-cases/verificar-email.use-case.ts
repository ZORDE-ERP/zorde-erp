import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../../shared/errors/app.exception';
import type { ISolicitacaoCadastroRepository } from '../../domain/repositories/i-solicitacao-cadastro.repository';
import { I_SOLICITACAO_CADASTRO_REPOSITORY } from '../../domain/repositories/i-solicitacao-cadastro.repository';
import type { VerificarEmailDto } from '../dtos/verificar-email.dto';

@Injectable()
export class VerificarEmailUseCase {
	public constructor(
		@Inject(I_SOLICITACAO_CADASTRO_REPOSITORY)
		private readonly solicitacaoCadastroRepository: ISolicitacaoCadastroRepository,
	) {}

	public async execute(dto: VerificarEmailDto): Promise<{ success: boolean; message: string }> {
		const solicitacao = await this.solicitacaoCadastroRepository.buscarPorEmail(dto.email);

		if (!solicitacao) {
			throw new BusinessRuleException('Código inválido ou inexistente');
		}

		// Verificar se o código expirou
		if (new Date() > solicitacao.expiracao) {
			// Deleta a expiração para não deixar lixo
			await this.solicitacaoCadastroRepository.deletarPorEmail(dto.email);
			throw new BusinessRuleException('Código expirado');
		}

		// Validar se o código confere exatamente
		if (solicitacao.codigo !== dto.codigo) {
			throw new BusinessRuleException('Código inválido');
		}

		// Remover a solicitação para garantir o uso único (OTP)
		await this.solicitacaoCadastroRepository.deletarPorEmail(dto.email);

		return {
			success: true,
			message: 'E-mail verificado com sucesso',
		};
	}
}
