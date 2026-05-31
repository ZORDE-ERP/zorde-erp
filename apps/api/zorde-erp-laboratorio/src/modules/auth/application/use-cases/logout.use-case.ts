import { Inject, Injectable } from '@nestjs/common';
import { I_AUTENTICACAO_REPOSITORY } from '../../domain/repositories/i-autenticacao.repository';
import type { IAutenticacaoRepository } from '../../domain/repositories/i-autenticacao.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(I_AUTENTICACAO_REPOSITORY)
    private readonly autenticacaoRepository: IAutenticacaoRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    await this.autenticacaoRepository.deletarPorUsuario(userId);
  }
}
