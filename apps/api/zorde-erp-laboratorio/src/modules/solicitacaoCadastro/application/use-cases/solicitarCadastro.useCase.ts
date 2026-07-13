import * as crypto from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConflictException } from '../../../../shared/errors/app.exception';
import type { IUsuarioRepository } from '../../../usuario/domain/repositories/i-usuario.repository';
import { IUSUARIO_REPOSITORY } from '../../../usuario/domain/repositories/i-usuario.repository';
import { SolicitacaoCadastroEntity } from '../../domain/entities/solicitacaoCadastro.entity';
import type { ISolicitacaoCadastroRepository } from '../../domain/repositories/solicitacaoCadastro.repository';
import { ISOLICITACAO_CADASTRO_REPOSITORY } from '../../domain/repositories/solicitacaoCadastro.repository';
import { ResendEmailService } from '../../infrastructure/services/resendEmail.service';
import type { SolicitarCadastroDto } from '../dtos/solicitarCadastro.dto';

@Injectable()
export class SolicitarCadastroUseCase {
	public constructor(
		@Inject(IUSUARIO_REPOSITORY)
		private readonly usuarioRepository: IUsuarioRepository,
		@Inject(ISOLICITACAO_CADASTRO_REPOSITORY)
		private readonly solicitacaoCadastroRepository: ISolicitacaoCadastroRepository,
		private readonly emailService: ResendEmailService,
	) {}

	public async execute(dto: SolicitarCadastroDto): Promise<{ message: string }> {
		const usuarioExistente = await this.usuarioRepository.buscarPorEmail(dto.email);
		if (usuarioExistente) {
			throw new ConflictException('E-mail já cadastrado no sistema');
		}

		await this.solicitacaoCadastroRepository.deletarPorEmail(dto.email);

		const codigo = crypto.randomInt(100000, 999999).toString();

		const expiracao = new Date(Date.now() + 5 * 60 * 1000);

		const solicitacao = SolicitacaoCadastroEntity.create({
			email: dto.email,
			codigo,
			expiracao,
		});

		await this.solicitacaoCadastroRepository.criar(solicitacao);

		await this.emailService.enviarCodigoOtp(dto.email, codigo);

		return {
			message: 'Código de confirmação enviado com sucesso para o e-mail informado',
		};
	}
}
