import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { I_SOLICITACAO_CADASTRO_REPOSITORY } from '../../domain/repositories/i-solicitacao-cadastro.repository';
import type { ISolicitacaoCadastroRepository } from '../../domain/repositories/i-solicitacao-cadastro.repository';
import { ResendEmailService } from '../../infrastructure/services/resend-email.service';
import { ReenviarCodigoDto } from '../dtos/reenviar-codigo.dto';
import { SolicitacaoCadastroEntity } from '../../domain/entities/solicitacao-cadastro.entity';
import { BusinessRuleException } from '../../../../shared/errors/app.exception';

@Injectable()
export class ReenviarCodigoUseCase {
  constructor(
    @Inject(I_SOLICITACAO_CADASTRO_REPOSITORY)
    private readonly solicitacaoCadastroRepository: ISolicitacaoCadastroRepository,
    private readonly emailService: ResendEmailService,
  ) {}

  async execute(dto: ReenviarCodigoDto): Promise<{ message: string }> {
    const solicitacao = await this.solicitacaoCadastroRepository.buscarPorEmail(dto.email);

    if (!solicitacao) {
      throw new BusinessRuleException('Nenhuma solicitação de cadastro pendente encontrada para este e-mail');
    }

    // Validar tempo mínimo (cooldown) de reenvio de 30 segundos
    const diffInSeconds = (Date.now() - solicitacao.criadoEm.getTime()) / 1000;
    if (diffInSeconds < 30) {
      const restSecs = Math.ceil(30 - diffInSeconds);
      throw new BusinessRuleException(`Aguarde ${restSecs} segundos antes de solicitar um novo envio`);
    }

    // Remover solicitação antiga
    await this.solicitacaoCadastroRepository.deletarPorEmail(dto.email);

    // Regenerar código OTP
    const novoCodigo = crypto.randomInt(100000, 999999).toString();
    const novaExpiracao = new Date(Date.now() + 5 * 60 * 1000);

    const novaSolicitacao = SolicitacaoCadastroEntity.create({
      email: dto.email,
      codigo: novoCodigo,
      expiracao: novaExpiracao,
    });

    await this.solicitacaoCadastroRepository.criar(novaSolicitacao);

    // Enviar o novo e-mail
    await this.emailService.enviarCodigoOtp(dto.email, novoCodigo);

    return {
      message: 'Novo código de confirmação enviado com sucesso',
    };
  }
}
