import { Test, TestingModule } from '@nestjs/testing';
import { SolicitarCadastroUseCase } from '../../src/modules/solicitacaoCadastro/application/use-cases/solicitar-cadastro.use-case';
import { IUSUARIO_REPOSITORY } from '../../src/modules/usuario/domain/repositories/i-usuario.repository';
import { I_SOLICITACAO_CADASTRO_REPOSITORY } from '../../src/modules/solicitacaoCadastro/domain/repositories/i-solicitacao-cadastro.repository';
import { ResendEmailService } from '../../src/modules/solicitacaoCadastro/infrastructure/services/resend-email.service';
import { ConflictException } from '../../src/shared/errors/app.exception';

describe('SolicitarCadastroUseCase', () => {
  let solicitarCadastroUseCase: SolicitarCadastroUseCase;
  let usuarioRepositoryMock: any;
  let solicitacaoCadastroRepositoryMock: any;
  let emailServiceMock: any;

  beforeEach(async () => {
    usuarioRepositoryMock = {
      buscarPorEmail: jest.fn(),
    };

    solicitacaoCadastroRepositoryMock = {
      deletarPorEmail: jest.fn(),
      criar: jest.fn(),
    };

    emailServiceMock = {
      enviarCodigoOtp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitarCadastroUseCase,
        {
          provide: IUSUARIO_REPOSITORY,
          useValue: usuarioRepositoryMock,
        },
        {
          provide: I_SOLICITACAO_CADASTRO_REPOSITORY,
          useValue: solicitacaoCadastroRepositoryMock,
        },
        {
          provide: ResendEmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    solicitarCadastroUseCase = module.get<SolicitarCadastroUseCase>(SolicitarCadastroUseCase);
  });

  it('should successfully request registration by sending OTP', async () => {
    usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(null);
    solicitacaoCadastroRepositoryMock.deletarPorEmail.mockResolvedValue(null);
    solicitacaoCadastroRepositoryMock.criar.mockResolvedValue(null);
    emailServiceMock.enviarCodigoOtp.mockResolvedValue(null);

    const result = await solicitarCadastroUseCase.execute({ email: 'new_user@zorde.com.br' });

    expect(usuarioRepositoryMock.buscarPorEmail).toHaveBeenCalledWith('new_user@zorde.com.br');
    expect(solicitacaoCadastroRepositoryMock.deletarPorEmail).toHaveBeenCalledWith('new_user@zorde.com.br');
    expect(solicitacaoCadastroRepositoryMock.criar).toHaveBeenCalled();
    expect(emailServiceMock.enviarCodigoOtp).toHaveBeenCalledWith('new_user@zorde.com.br', expect.stringMatching(/^\d{6}$/));
    
    expect(result).toEqual({
      message: 'Código de confirmação enviado com sucesso para o e-mail informado',
    });
  });

  it('should throw ConflictException if user email already exists', async () => {
    usuarioRepositoryMock.buscarPorEmail.mockResolvedValue({
      id: 'existing-user-id',
      email: 'existing_user@zorde.com.br',
    });

    await expect(
      solicitarCadastroUseCase.execute({ email: 'existing_user@zorde.com.br' }),
    ).rejects.toThrow(ConflictException);

    expect(solicitacaoCadastroRepositoryMock.deletarPorEmail).not.toHaveBeenCalled();
    expect(solicitacaoCadastroRepositoryMock.criar).not.toHaveBeenCalled();
    expect(emailServiceMock.enviarCodigoOtp).not.toHaveBeenCalled();
  });
});
