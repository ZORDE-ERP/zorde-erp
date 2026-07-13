import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { validateEnv } from '../../src/config/env.validation';
import { LoginUseCase } from '../../src/modules/auth/application/use-cases/login.use-case';
import { AutenticacaoEntity } from '../../src/modules/auth/domain/entities/autenticacao.entity';
import type { IAutenticacaoRepository } from '../../src/modules/auth/domain/repositories/i-autenticacao.repository';
import { IAUTENTICACAO_REPOSITORY } from '../../src/modules/auth/domain/repositories/i-autenticacao.repository';
import { PasswordHashingService } from '../../src/modules/auth/infra/services/password-hashing.service';
import { UsuarioEntity } from '../../src/modules/usuario/domain/entities/usuario.entity';
import type { IUsuarioRepository } from '../../src/modules/usuario/domain/repositories/i-usuario.repository';
import { IUSUARIO_REPOSITORY } from '../../src/modules/usuario/domain/repositories/i-usuario.repository';
import { UnauthorizedException } from '../../src/shared/errors/app.exception';

describe('LoginUseCase', () => {
	let loginUseCase: LoginUseCase;
	let usuarioRepositoryMock: jest.Mocked<IUsuarioRepository>;
	let autenticacaoRepositoryMock: jest.Mocked<IAutenticacaoRepository>;
	let passwordHashingServiceMock: jest.Mocked<PasswordHashingService>;
	let jwtServiceMock: jest.Mocked<JwtService>;

	beforeAll(() => {
		validateEnv({
			DATABASE_URL: 'postgresql://localhost:5432/db',
			POSTGRES_DB: 'db',
			POSTGRES_USER: 'user',
			POSTGRES_PASSWORD: 'password',
			API_PORT: 3000,
			JWT_SECRET: 'test_secret',
			JWT_SECRET_EXPIRES_IN: '1h',
			REFRESH_TOKEN_EXPIRES_IN: '7d',
			APP_ENV: 'test',
			RESEND_API_KEY: 're_test',
			SALT_ROUNDS_BCRYPT: 10,
			SERVER_URL: 'http://localhost:3000',
		});
	});

	beforeEach(async () => {
		usuarioRepositoryMock = {
			buscarPorEmail: jest.fn(),
			atualizar: jest.fn(),
		} as unknown as jest.Mocked<IUsuarioRepository>;

		autenticacaoRepositoryMock = {
			criar: jest.fn(),
		} as unknown as jest.Mocked<IAutenticacaoRepository>;

		passwordHashingServiceMock = {
			comparar: jest.fn(),
			hash: jest.fn(),
		} as unknown as jest.Mocked<PasswordHashingService>;

		jwtServiceMock = {
			signAsync: jest.fn(),
		} as unknown as jest.Mocked<JwtService>;

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
		const usuarioMock = new UsuarioEntity({
			id: 123,
			nome: 'Luis Guilherme',
			email: 'luis@zorde.com.br',
			senha: 'hashed_password',
			documento: '12345678900',
			contato: '11999999999',
			tipoUsuario: 'USUARIO',
			ultimoAcesso: null,
		});

		usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(usuarioMock);
		passwordHashingServiceMock.hash.mockResolvedValue('hashed_refresh_token');
		jwtServiceMock.signAsync.mockResolvedValue('jwt_token_stub');
		autenticacaoRepositoryMock.criar.mockResolvedValue({} as unknown as AutenticacaoEntity);
		usuarioRepositoryMock.atualizar.mockResolvedValue({} as unknown as UsuarioEntity);

		const result = await loginUseCase.execute(
			{ email: 'luis@zorde.com.br', senha: 'correct_password' },
			'127.0.0.1',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
		);

		expect(usuarioRepositoryMock.buscarPorEmail).toHaveBeenCalledWith('luis@zorde.com.br');
		expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);
		expect(autenticacaoRepositoryMock.criar).toHaveBeenCalled();
		expect(usuarioRepositoryMock.atualizar).toHaveBeenCalledWith(123, expect.any(Object));

		expect(result).toEqual({
			accessToken: 'jwt_token_stub',
			refreshToken: 'jwt_token_stub',
			usuario: {
				id: 123,
				nome: 'Luis Guilherme',
				email: 'luis@zorde.com.br',
				role: 'USUARIO',
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
	});
});
