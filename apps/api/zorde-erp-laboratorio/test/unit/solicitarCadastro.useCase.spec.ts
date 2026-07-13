import { Test, type TestingModule } from '@nestjs/testing';
import { SolicitarCadastroUseCase } from '../../src/modules/solicitacaoCadastro/application/use-cases/solicitarCadastro.useCase';
import { SolicitacaoCadastroEntity } from '../../src/modules/solicitacaoCadastro/domain/entities/solicitacaoCadastro.entity';
import type { ISolicitacaoCadastroRepository } from '../../src/modules/solicitacaoCadastro/domain/repositories/solicitacaoCadastro.repository';
import { ISOLICITACAO_CADASTRO_REPOSITORY } from '../../src/modules/solicitacaoCadastro/domain/repositories/solicitacaoCadastro.repository';
import { ResendEmailService } from '../../src/modules/solicitacaoCadastro/infrastructure/services/resendEmail.service';
import { UsuarioEntity } from '../../src/modules/usuario/domain/entities/usuario.entity';
import type { IUsuarioRepository } from '../../src/modules/usuario/domain/repositories/i-usuario.repository';
import { IUSUARIO_REPOSITORY } from '../../src/modules/usuario/domain/repositories/i-usuario.repository';
import { ConflictException } from '../../src/shared/errors/app.exception';

function createEmailServiceMock(
	enviarCodigoOtp: jest.MockedFunction<ResendEmailService['enviarCodigoOtp']> = jest.fn().mockResolvedValue(undefined),
): ResendEmailService {
	return { enviarCodigoOtp } as unknown as ResendEmailService;
}

describe('SolicitarCadastroUseCase', () => {
	let solicitarCadastroUseCase: SolicitarCadastroUseCase;
	let usuarioRepositoryMock: jest.Mocked<IUsuarioRepository>;
	let solicitacaoCadastroRepositoryMock: jest.Mocked<ISolicitacaoCadastroRepository>;
	let emailServiceMock: ResendEmailService;

	beforeEach(async () => {
		usuarioRepositoryMock = {
			buscarPorEmail: jest.fn(),
			criar: jest.fn(),
			buscarPorId: jest.fn(),
			buscarPorDocumento: jest.fn(),
			atualizar: jest.fn(),
			deletar: jest.fn(),
		} as unknown as jest.Mocked<IUsuarioRepository>;

		solicitacaoCadastroRepositoryMock = {
			buscarPorEmail: jest.fn(),
			deletarPorEmail: jest.fn(),
			criar: jest.fn(),
		} as unknown as jest.Mocked<ISolicitacaoCadastroRepository>;

		emailServiceMock = createEmailServiceMock();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SolicitarCadastroUseCase,
				{
					provide: IUSUARIO_REPOSITORY,
					useValue: usuarioRepositoryMock,
				},
				{
					provide: ISOLICITACAO_CADASTRO_REPOSITORY,
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
		solicitacaoCadastroRepositoryMock.deletarPorEmail.mockResolvedValue(undefined);
		solicitacaoCadastroRepositoryMock.criar.mockResolvedValue(
			new SolicitacaoCadastroEntity({
				id: 1,
				email: 'new_user@zorde.com.br',
				codigo: '123456',
				expiracao: new Date(),
				criadoEm: new Date(),
			}),
		);

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
		usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(
			new UsuarioEntity({
				id: 1,
				email: 'existing_user@zorde.com.br',
				senha: 'HASH',
				nome: 'Teste',
				documento: '12345678901',
				contato: '11999999999',
				tipoUsuario: 'ADMIN',
				ultimoAcesso: null,
				ativo: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}),
		);

		await expect(solicitarCadastroUseCase.execute({ email: 'existing_user@zorde.com.br' })).rejects.toThrow(
			ConflictException,
		);

		expect(solicitacaoCadastroRepositoryMock.deletarPorEmail).not.toHaveBeenCalled();
		expect(solicitacaoCadastroRepositoryMock.criar).not.toHaveBeenCalled();
		expect(emailServiceMock.enviarCodigoOtp).not.toHaveBeenCalled();
	});
});
