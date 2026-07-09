import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../../shared/errors/app.exception';
import type { ISolicitacaoCadastroRepository } from '../../domain/repositories/solicitacaoCadastro.repository';
import { ISOLICITACAO_CADASTRO_REPOSITORY } from '../../domain/repositories/solicitacaoCadastro.repository';
import type { VerificarEmailDto } from '../dtos/verificarEmail.dto';

@Injectable()
export class VerificarEmailUseCase {
	public constructor(
		@Inject(ISOLICITACAO_CADASTRO_REPOSITORY)
		private readonly solicitacaoCadastroRepository: ISolicitacaoCadastroRepository,
	) {}

	public async execute(dto: VerificarEmailDto): Promise<{ success: boolean; message: string }> {
		const solicitacao = await this.solicitacaoCadastroRepository.buscarPorEmail(dto.email);

		if (!solicitacao) {
			throw new BusinessRuleException('Código inválido ou inexistente');
		}

		if (new Date() > solicitacao.expiracao) {
			await this.solicitacaoCadastroRepository.deletarPorEmail(dto.email);
			throw new BusinessRuleException('Código expirado');
		}

		if (solicitacao.codigo !== dto.codigo) {
			throw new BusinessRuleException('Código inválido');
		}

		await this.solicitacaoCadastroRepository.deletarPorEmail(dto.email);

		return {
			success: true,
			message: 'E-mail verificado com sucesso',
		};
	}
}
