import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { I_USUARIO_REPOSITORY } from '../../../usuario/domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../../usuario/domain/repositories/i-usuario.repository';
import { I_SOLICITACAO_CADASTRO_REPOSITORY } from '../../domain/repositories/i-solicitacao-cadastro.repository';
import type { ISolicitacaoCadastroRepository } from '../../domain/repositories/i-solicitacao-cadastro.repository';
import { ResendEmailService } from '../../infrastructure/services/resend-email.service';
import { SolicitarCadastroDto } from '../dtos/solicitar-cadastro.dto';
import { SolicitacaoCadastroEntity } from '../../domain/entities/solicitacao-cadastro.entity';
import { ConflictException } from '../../../../shared/errors/app.exception';

@Injectable()
export class SolicitarCadastroUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(I_SOLICITACAO_CADASTRO_REPOSITORY)
    private readonly solicitacaoCadastroRepository: ISolicitacaoCadastroRepository,
    private readonly emailService: ResendEmailService,
  ) {}

  async execute(dto: SolicitarCadastroDto): Promise<{ message: string }> {
    // 1. Verificar se e-mail já existe na base de usuários
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (usuarioExistente) {
      throw new ConflictException('E-mail já cadastrado no sistema');
    }

    // 2. Remover qualquer solicitação pendente anterior para o e-mail
    await this.solicitacaoCadastroRepository.deletarPorEmail(dto.email);

    // 3. Gerar código OTP de 6 dígitos seguro
    const codigo = crypto.randomInt(100000, 999999).toString();

    // 4. Definir expiração para exatamente 5 minutos a partir do momento atual
    const expiracao = new Date(Date.now() + 5 * 60 * 1000);

    // 5. Salvar a nova solicitação de cadastro
    const solicitacao = SolicitacaoCadastroEntity.create({
      email: dto.email,
      codigo,
      expiracao,
    });

    await this.solicitacaoCadastroRepository.criar(solicitacao);

    // 6. Disparar e-mail via ResendEmailService (assincronamente, mas aguardando conclusão para tratamento de erros)
    await this.emailService.enviarCodigoOtp(dto.email, codigo);

    return {
      message: 'Código de confirmação enviado com sucesso para o e-mail informado',
    };
  }
}
