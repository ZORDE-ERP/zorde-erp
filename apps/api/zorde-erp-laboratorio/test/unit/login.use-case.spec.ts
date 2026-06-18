import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../../src/modules/auth/application/use-cases/login.use-case';
import { IUSUARIO_REPOSITORY } from '../../src/modules/usuario/domain/repositories/i-usuario.repository';
import { IAUTENTICACAO_REPOSITORY } from '../../src/modules/auth/domain/repositories/i-autenticacao.repository';
import { PasswordHashingService } from '../../src/modules/auth/infra/services/password-hashing.service';
import { UnauthorizedException } from '../../src/shared/errors/app.exception';
import { StatusSessao } from '../../src/shared/enums/status-sessao.enum';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let usuarioRepositoryMock: any;
  let autenticacaoRepositoryMock: any;
  let passwordHashingServiceMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    usuarioRepositoryMock = {
      buscarPorEmail: jest.fn(),
      atualizar: jest.fn(),
    };

    autenticacaoRepositoryMock = {
      criar: jest.fn(),
    };

    passwordHashingServiceMock = {
      comparar: jest.fn(),
    };

    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: IUSUARIO_REPOSITORY,
          useValue: usuarioRepositoryMock,
        },
        {
          provide: IAUTENTICACAO_REPOSITORY,
          useValue: autenticacaoRepositoryMock,
        },
        {
          provide: PasswordHashingService,
          useValue: passwordHashingServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should successfully authenticate user and return tokens and user details', async () => {
    const usuarioMock = {
      id: 'user-123',
      nome: 'Luis Guilherme',
      email: 'luis@zorde.com.br',
      senha: 'hashed_password',
    };

    usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(usuarioMock);
    passwordHashingServiceMock.comparar.mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt_token_stub');
    autenticacaoRepositoryMock.criar.mockResolvedValue(null);
    usuarioRepositoryMock.atualizar.mockResolvedValue(null);

    const result = await loginUseCase.execute(
      { email: 'luis@zorde.com.br', senha: 'correct_password' },
      '127.0.0.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    );

    expect(usuarioRepositoryMock.buscarPorEmail).toHaveBeenCalledWith('luis@zorde.com.br');
    expect(passwordHashingServiceMock.comparar).toHaveBeenCalledWith('correct_password', 'hashed_password');
    expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);
    expect(autenticacaoRepositoryMock.criar).toHaveBeenCalled();
    expect(usuarioRepositoryMock.atualizar).toHaveBeenCalledWith('user-123', expect.any(Object));

    expect(result).toEqual({
      accessToken: 'jwt_token_stub',
      refreshToken: 'jwt_token_stub',
      usuario: {
        id: 'user-123',
        nome: 'Luis Guilherme',
        email: 'luis@zorde.com.br',
      },
    });
  });

  it('should throw UnauthorizedException if email does not exist', async () => {
    usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute(
        { email: 'nonexistent@zorde.com.br', senha: 'any_password' },
        '127.0.0.1',
        'Mozilla/5.0 Chrome/120.0.0.0',
      ),
    ).rejects.toThrow(UnauthorizedException);

    expect(passwordHashingServiceMock.comparar).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if password comparison fails', async () => {
    const usuarioMock = {
      id: 'user-123',
      nome: 'Luis Guilherme',
      email: 'luis@zorde.com.br',
      senha: 'hashed_password',
    };

    usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(usuarioMock);
    passwordHashingServiceMock.comparar.mockResolvedValue(false);

    await expect(
      loginUseCase.execute(
        { email: 'luis@zorde.com.br', senha: 'wrong_password' },
        '127.0.0.1',
        'Mozilla/5.0 Chrome/120.0.0.0',
      ),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });
});
