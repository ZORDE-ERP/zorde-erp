import * as crypto from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../../shared/errors/app.exception';
import { SolicitacaoCadastroEntity } from '../../domain/entities/solicitacaoCadastro.entity';
import type { ISolicitacaoCadastroRepository } from '../../domain/repositories/solicitacaoCadastro.repository';
import { ISOLICITACAO_CADASTRO_REPOSITORY } from '../../domain/repositories/solicitacaoCadastro.repository';
import { ResendEmailService } from '../../infrastructure/services/resendEmail.service';
import type { ReenviarCodigoDto } from '../dtos/reenviarCodigo.dto';

@Injectable()
export class ReenviarCodigoUseCase {
	public constructor(
		@Inject(ISOLICITACAO_CADASTRO_REPOSITORY)
		private readonly solicitacaoCadastroRepository: ISolicitacaoCadastroRepository,
		private readonly emailService: ResendEmailService,
	) {}

	public async execute(dto: ReenviarCodigoDto): Promise<{ message: string }> {
		const solicitacao = await this.solicitacaoCadastroRepository.buscarPorEmail(dto.email);

		if (!solicitacao) {
			throw new BusinessRuleException('Nenhuma solicitação de cadastro pendente encontrada para este e-mail');
		}

		const diffInSeconds = (Date.now() - solicitacao.criadoEm.getTime()) / 1000;
		if (diffInSeconds < 30) {
			const restSecs = Math.ceil(30 - diffInSeconds);
			throw new BusinessRuleException(`Aguarde ${restSecs} segundos antes de solicitar um novo envio`);
		}

		await this.solicitacaoCadastroRepository.deletarPorEmail(dto.email);

		const novoCodigo = crypto.randomInt(100000, 999999).toString();
		const novaExpiracao = new Date(Date.now() + 5 * 60 * 1000);

		const novaSolicitacao = SolicitacaoCadastroEntity.create({
			email: dto.email,
			codigo: novoCodigo,
			expiracao: novaExpiracao,
		});

		await this.solicitacaoCadastroRepository.criar(novaSolicitacao);

		await this.emailService.enviarCodigoOtp(dto.email, novoCodigo);

		return {
			message: 'Novo código de confirmação enviado com sucesso',
		};
	}
}
