import { InternalServerErrorException } from '@nestjs/common';
import type { SolicitacaoCadastro } from '@prisma/client';
import { BusinessRuleException, ConflictException } from '../../../shared/errors/app.exception';
import { UsuarioEntity } from '../../usuario/domain/entities/usuario.entity';
import type { IUsuarioRepository } from '../../usuario/domain/repositories/i-usuario.repository';
import { ReenviarCodigoUseCase } from '../application/use-cases/reenviarCodigo.useCase';
import { SolicitarCadastroUseCase } from '../application/use-cases/solicitarCadastro.useCase';
import { VerificarEmailUseCase } from '../application/use-cases/verificarEmail.useCase';
import { SolicitacaoCadastroEntity } from '../domain/entities/solicitacaoCadastro.entity';
import type { ISolicitacaoCadastroRepository } from '../domain/repositories/solicitacaoCadastro.repository';
import { SolicitacaoCadastroInfraMapper } from '../infrastructure/mappers/solicitacaoCadastroInfra.mapper';
import type { ResendEmailService } from '../infrastructure/services/resendEmail.service';

function createEmailServiceMock(
	enviarCodigoOtp: jest.MockedFunction<ResendEmailService['enviarCodigoOtp']> = jest.fn().mockResolvedValue(undefined),
): ResendEmailService {
	return { enviarCodigoOtp } as unknown as ResendEmailService;
}

describe('SolicitacaoCadastro Unit Tests', () => {
	const mockSolicitacaoProps = {
		id: 1,
		email: 'teste@zorde.com',
		codigo: '123456',
		expiracao: new Date(Date.now() + 5 * 60 * 1000),
		criadoEm: new Date(),
	};

	describe('SolicitacaoCadastroEntity', () => {
		it('deve criar uma entidade com as propriedades corretas', () => {
			const entity = new SolicitacaoCadastroEntity(mockSolicitacaoProps);

			expect(entity.id).toBe(mockSolicitacaoProps.id);
			expect(entity.email).toBe(mockSolicitacaoProps.email);
			expect(entity.codigo).toBe(mockSolicitacaoProps.codigo);
			expect(entity.expiracao).toEqual(mockSolicitacaoProps.expiracao);
			expect(entity.criadoEm).toEqual(mockSolicitacaoProps.criadoEm);
		});

		it('deve criar uma entidade via factory method com criadoEm padrão', () => {
			const entity = SolicitacaoCadastroEntity.create({
				email: 'novo@zorde.com',
				codigo: '654321',
				expiracao: new Date(),
			});

			expect(entity.email).toBe('novo@zorde.com');
			expect(entity.codigo).toBe('654321');
			expect(entity.criadoEm).toBeInstanceOf(Date);
			expect(entity.id).toBeUndefined();
		});

		it('deve respeitar criadoEm quando fornecido no factory method', () => {
			const criadoEm = new Date('2026-01-01');
			const entity = SolicitacaoCadastroEntity.create({
				email: 'x@zorde.com',
				codigo: '111111',
				expiracao: new Date(),
				criadoEm,
			});

			expect(entity.criadoEm).toEqual(criadoEm);
		});
	});

	describe('SolicitacaoCadastroInfraMapper', () => {
		it('deve mapear objeto Prisma para entidade de domínio', () => {
			const raw: SolicitacaoCadastro = {
				id: 1,
				email: 'mapper@zorde.com',
				codigo: '987654',
				expiracao: new Date(Date.now() + 300_000),
				createdAt: new Date(),
			};

			const entity = SolicitacaoCadastroInfraMapper.toDomain(raw);

			expect(entity.id).toBe(raw.id);
			expect(entity.email).toBe(raw.email);
			expect(entity.codigo).toBe(raw.codigo);
			expect(entity.expiracao).toEqual(raw.expiracao);
			expect(entity.criadoEm).toEqual(raw.createdAt);
		});

		it('deve mapear entidade de domínio para objeto de persistência', () => {
			const entity = new SolicitacaoCadastroEntity(mockSolicitacaoProps);
			const persistence = SolicitacaoCadastroInfraMapper.toPersistence(entity);

			expect(persistence.email).toBe(entity.email);
			expect(persistence.codigo).toBe(entity.codigo);
			expect(persistence.expiracao).toEqual(entity.expiracao);
			expect(persistence.createdAt).toEqual(entity.criadoEm);
		});
	});

	describe('Use Cases', () => {
		let mockRepository: jest.Mocked<ISolicitacaoCadastroRepository>;

		beforeEach(() => {
			mockRepository = {
				criar: jest.fn(),
				buscarPorEmail: jest.fn(),
				deletarPorEmail: jest.fn(),
			} as jest.Mocked<ISolicitacaoCadastroRepository>;
		});

		describe('SolicitarCadastroUseCase', () => {
			let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;

			beforeEach(() => {
				mockUsuarioRepository = {
					criar: jest.fn(),
					buscarPorId: jest.fn(),
					buscarPorEmail: jest.fn(),
					buscarPorDocumento: jest.fn(),
					atualizar: jest.fn(),
					deletar: jest.fn(),
				} as unknown as jest.Mocked<IUsuarioRepository>;
			});

			it('deve enviar código OTP e retornar mensagem de sucesso', async () => {
				const emailService = createEmailServiceMock();
				const useCase = new SolicitarCadastroUseCase(mockUsuarioRepository, mockRepository, emailService);

				mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
				mockRepository.deletarPorEmail.mockResolvedValue(undefined);
				mockRepository.criar.mockResolvedValue(new SolicitacaoCadastroEntity(mockSolicitacaoProps));

				const result = await useCase.execute({ email: 'novo@zorde.com' });

				expect(mockUsuarioRepository.buscarPorEmail).toHaveBeenCalledWith('novo@zorde.com');
				expect(mockRepository.deletarPorEmail).toHaveBeenCalledWith('novo@zorde.com');
				expect(mockRepository.criar).toHaveBeenCalled();
				expect(emailService.enviarCodigoOtp).toHaveBeenCalledWith('novo@zorde.com', expect.any(String));
				expect(result.message).toBeDefined();
			});

			it('deve lançar ConflictException se o e-mail já estiver cadastrado', async () => {
				const emailService = createEmailServiceMock();
				const useCase = new SolicitarCadastroUseCase(mockUsuarioRepository, mockRepository, emailService);

				mockUsuarioRepository.buscarPorEmail.mockResolvedValue(
					new UsuarioEntity({
						id: 1,
						email: 'existente@zorde.com',
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

				await expect(useCase.execute({ email: 'existente@zorde.com' })).rejects.toThrow(ConflictException);
			});

			it('deve lançar erro se o serviço de e-mail falhar', async () => {
				const emailService = createEmailServiceMock(
					jest.fn().mockRejectedValue(new InternalServerErrorException('Falha ao enviar e-mail de confirmação')),
				);
				const useCase = new SolicitarCadastroUseCase(mockUsuarioRepository, mockRepository, emailService);

				mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
				mockRepository.deletarPorEmail.mockResolvedValue(undefined);
				mockRepository.criar.mockResolvedValue(new SolicitacaoCadastroEntity(mockSolicitacaoProps));

				await expect(useCase.execute({ email: 'novo@zorde.com' })).rejects.toThrow(InternalServerErrorException);
			});
		});

		describe('VerificarEmailUseCase', () => {
			it('deve verificar o e-mail com sucesso quando código e prazo estão válidos', async () => {
				const useCase = new VerificarEmailUseCase(mockRepository);
				const solicitacao = new SolicitacaoCadastroEntity({
					...mockSolicitacaoProps,
					codigo: '999888',
					expiracao: new Date(Date.now() + 60_000),
				});

				mockRepository.buscarPorEmail.mockResolvedValue(solicitacao);
				mockRepository.deletarPorEmail.mockResolvedValue(undefined);

				const result = await useCase.execute({ email: 'teste@zorde.com', codigo: '999888' });

				expect(result.success).toBe(true);
				expect(mockRepository.deletarPorEmail).toHaveBeenCalledWith('teste@zorde.com');
			});

			it('deve lançar BusinessRuleException quando não existe solicitação para o e-mail', async () => {
				const useCase = new VerificarEmailUseCase(mockRepository);
				mockRepository.buscarPorEmail.mockResolvedValue(null);

				await expect(useCase.execute({ email: 'nao@existe.com', codigo: '111111' })).rejects.toThrow(BusinessRuleException);
			});

			it('deve lançar BusinessRuleException quando o código está expirado', async () => {
				const useCase = new VerificarEmailUseCase(mockRepository);
				const solicitacaoExpirada = new SolicitacaoCadastroEntity({
					...mockSolicitacaoProps,
					expiracao: new Date(Date.now() - 1000),
				});

				mockRepository.buscarPorEmail.mockResolvedValue(solicitacaoExpirada);
				mockRepository.deletarPorEmail.mockResolvedValue(undefined);

				await expect(useCase.execute({ email: 'teste@zorde.com', codigo: '123456' })).rejects.toThrow(BusinessRuleException);
				expect(mockRepository.deletarPorEmail).toHaveBeenCalledWith('teste@zorde.com');
			});

			it('deve lançar BusinessRuleException quando o código é inválido', async () => {
				const useCase = new VerificarEmailUseCase(mockRepository);
				const solicitacao = new SolicitacaoCadastroEntity({
					...mockSolicitacaoProps,
					codigo: '123456',
					expiracao: new Date(Date.now() + 60_000),
				});

				mockRepository.buscarPorEmail.mockResolvedValue(solicitacao);

				await expect(useCase.execute({ email: 'teste@zorde.com', codigo: '000000' })).rejects.toThrow(BusinessRuleException);
			});
		});

		describe('ReenviarCodigoUseCase', () => {
			it('deve reenviar código com sucesso após o cooldown', async () => {
				const emailService = createEmailServiceMock();
				const useCase = new ReenviarCodigoUseCase(mockRepository, emailService);
				const solicitacaoAntiga = new SolicitacaoCadastroEntity({
					...mockSolicitacaoProps,
					criadoEm: new Date(Date.now() - 60_000),
				});

				mockRepository.buscarPorEmail.mockResolvedValue(solicitacaoAntiga);
				mockRepository.deletarPorEmail.mockResolvedValue(undefined);
				mockRepository.criar.mockResolvedValue(new SolicitacaoCadastroEntity(mockSolicitacaoProps));

				const result = await useCase.execute({ email: 'teste@zorde.com' });

				expect(mockRepository.deletarPorEmail).toHaveBeenCalledWith('teste@zorde.com');
				expect(mockRepository.criar).toHaveBeenCalled();
				expect(emailService.enviarCodigoOtp).toHaveBeenCalledWith('teste@zorde.com', expect.any(String));
				expect(result.message).toBeDefined();
			});

			it('deve lançar BusinessRuleException quando não existe solicitação pendente', async () => {
				const emailService = createEmailServiceMock();
				const useCase = new ReenviarCodigoUseCase(mockRepository, emailService);
				mockRepository.buscarPorEmail.mockResolvedValue(null);

				await expect(useCase.execute({ email: 'nao@existe.com' })).rejects.toThrow(BusinessRuleException);
			});

			it('deve lançar BusinessRuleException quando cooldown de 30s ainda não passou', async () => {
				const emailService = createEmailServiceMock();
				const useCase = new ReenviarCodigoUseCase(mockRepository, emailService);
				const solicitacaoRecente = new SolicitacaoCadastroEntity({
					...mockSolicitacaoProps,
					criadoEm: new Date(Date.now() - 10_000),
				});

				mockRepository.buscarPorEmail.mockResolvedValue(solicitacaoRecente);

				await expect(useCase.execute({ email: 'teste@zorde.com' })).rejects.toThrow(BusinessRuleException);
			});
		});
	});
});
