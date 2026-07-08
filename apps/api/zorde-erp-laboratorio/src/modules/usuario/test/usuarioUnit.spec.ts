import type { Usuario } from '@prisma/client';
import { ConflictException, EntityNotFoundException } from '../../../shared/errors/app.exception';
import type { PasswordHashingService } from '../../auth/infra/services/password-hashing.service';
import type { AtualizarUsuarioDto, CriarUsuarioDto } from '../application/dtos/usuario.dto';
import { usuariosToResponse, usuarioToResponse } from '../application/mappers/usuarioResponse.mapper';
import { AtualizarUsuarioUseCase } from '../application/use-cases/atualizarUsuario.useCase';
import { BuscarUsuarioPorEmailUseCase } from '../application/use-cases/buscarUsuarioPorEmail.useCase';
import { CriarUsuarioUseCase } from '../application/use-cases/criarUsuario.useCase';
import { DeletarUsuarioUseCase } from '../application/use-cases/deletarUsuario.useCase';
import { UsuarioEntity } from '../domain/entities/usuario.entity';
import type { IUsuarioRepository } from '../domain/repositories/i-usuario.repository';
import { UsuarioInfraMapper } from '../infrastructure/mappers/usuarioInfra.mapper';

function createPasswordHashingServiceMock(
	hash: jest.MockedFunction<PasswordHashingService['hash']> = jest.fn(),
): PasswordHashingService {
	return { hash } as unknown as PasswordHashingService;
}

describe('Usuario Unit Tests', () => {
	const mockUsuarioProps = {
		id: 1,
		email: 'user@zorde.com',
		senha: 'HASH',
		nome: 'Fulano de Tal',
		documento: '12345678901',
		contato: '11999999999',
		tipoUsuario: 'ADMIN' as const,
		ultimoAcesso: null,
		ativo: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
	};

	describe('UsuarioEntity', () => {
		it('should create a UsuarioEntity with props', () => {
			const entity = new UsuarioEntity(mockUsuarioProps);

			expect(entity.getId()).toBe(1);
			expect(entity.getEmail()).toBe(mockUsuarioProps.email);
			expect(entity.getNome()).toBe(mockUsuarioProps.nome);
			expect(entity.getDocumento()).toBe(mockUsuarioProps.documento);
			expect(entity.getContato()).toBe(mockUsuarioProps.contato);
			expect(entity.getTipoUsuario()).toBe(mockUsuarioProps.tipoUsuario);
			expect(entity.getUltimoAcesso()).toBeNull();
		});
	});

	describe('Mappers', () => {
		it('should map UsuarioEntity to Response DTO', () => {
			const entity = new UsuarioEntity(mockUsuarioProps);
			const response = usuarioToResponse(entity);

			expect(response.id).toBe(entity.getId());
			expect(response.email).toBe(entity.getEmail());
			expect(response.nome).toBe(entity.getNome());
			expect(response.documento).toBe(entity.getDocumento());
			expect(response.contato).toBe(entity.getContato());
			expect(response.tipoUsuario).toBe(entity.getTipoUsuario());
		});

		it('should map list of UsuarioEntity to Response DTO list', () => {
			const entity = new UsuarioEntity(mockUsuarioProps);
			const responses = usuariosToResponse([entity]);

			expect(responses).toHaveLength(1);
			expect(responses[0].id).toBe(entity.getId());
		});

		it('should map Prisma raw object to domain entity', () => {
			const raw: Usuario = {
				id: 1,
				email: 'user@zorde.com',
				senha: 'HASH',
				nome: 'Fulano de Tal',
				documento: '12345678901',
				contato: '11999999999',
				tipoUsuario: 'ADMIN',
				ultimoAcesso: null,
				ativo: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			};

			const entity = UsuarioInfraMapper.toDomain(raw);
			expect(entity.getId()).toBe(raw.id);
			expect(entity.getEmail()).toBe(raw.email);
			expect(entity.getDocumento()).toBe(raw.documento);
		});

		it('should map domain entity to Prisma persistence object', () => {
			const entity = new UsuarioEntity(mockUsuarioProps);
			const persistence = UsuarioInfraMapper.toPersistence(entity);

			expect(persistence.email).toBe(entity.getEmail());
			expect(persistence.nome).toBe(entity.getNome());
			expect(persistence.documento).toBe(entity.getDocumento());
			expect(persistence.contato).toBe(entity.getContato());
			expect(persistence.tipoUsuario).toBe(entity.getTipoUsuario());
		});
	});

	describe('Use Cases', () => {
		let mockRepository: jest.Mocked<IUsuarioRepository>;

		beforeEach(() => {
			mockRepository = {
				criar: jest.fn(),
				buscarPorId: jest.fn(),
				buscarPorEmail: jest.fn(),
				buscarPorDocumento: jest.fn(),
				atualizar: jest.fn(),
				deletar: jest.fn(),
			} as unknown as jest.Mocked<IUsuarioRepository>;
		});

		describe('CriarUsuarioUseCase', () => {
			it('should create user successfully', async () => {
				const passwordHashingService = createPasswordHashingServiceMock(jest.fn().mockResolvedValue('HASHED'));
				const useCase = new CriarUsuarioUseCase(mockRepository, passwordHashingService);
				const dto: CriarUsuarioDto = {
					email: 'new@zorde.com',
					senha: '123456',
					nome: 'Novo',
					documento: '12345678901',
					contato: '11999999999',
					tipoUsuario: 'ADMIN',
				};

				mockRepository.buscarPorEmail.mockResolvedValue(null);
				mockRepository.criar.mockResolvedValue(
					new UsuarioEntity({
						...mockUsuarioProps,
						id: 123,
						email: dto.email,
						senha: 'HASHED',
						nome: dto.nome,
						documento: dto.documento,
						contato: dto.contato,
						tipoUsuario: dto.tipoUsuario,
					}),
				);

				const result = await useCase.execute(dto);

				expect(mockRepository.buscarPorEmail).toHaveBeenCalledWith(dto.email);
				expect(passwordHashingService.hash).toHaveBeenCalledWith(dto.senha);
				expect(result.id).toBe(123);
				expect(result.email).toBe(dto.email);
			});

			it('should throw ConflictException if email already exists', async () => {
				const passwordHashingService = createPasswordHashingServiceMock();
				const useCase = new CriarUsuarioUseCase(mockRepository, passwordHashingService);
				mockRepository.buscarPorEmail.mockResolvedValue(new UsuarioEntity(mockUsuarioProps));

				const dto: CriarUsuarioDto = {
					email: mockUsuarioProps.email,
					senha: '123456',
					nome: 'Novo',
					documento: '12345678901',
					contato: '11999999999',
					tipoUsuario: 'ADMIN',
				};

				await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
			});
		});

		describe('BuscarUsuarioPorEmailUseCase', () => {
			it('should return response if found', async () => {
				const useCase = new BuscarUsuarioPorEmailUseCase(mockRepository);
				mockRepository.buscarPorEmail.mockResolvedValue(new UsuarioEntity(mockUsuarioProps));

				const result = await useCase.execute(mockUsuarioProps.email);

				expect(result?.email).toBe(mockUsuarioProps.email);
			});

			it('should throw EntityNotFoundException if not found', async () => {
				const useCase = new BuscarUsuarioPorEmailUseCase(mockRepository);
				mockRepository.buscarPorEmail.mockResolvedValue(null);

				await expect(useCase.execute('missing@zorde.com')).rejects.toThrow(EntityNotFoundException);
			});
		});

		describe('AtualizarUsuarioUseCase', () => {
			it('should update user successfully', async () => {
				const passwordHashingService = createPasswordHashingServiceMock(jest.fn().mockResolvedValue('HASHED2'));
				const useCase = new AtualizarUsuarioUseCase(mockRepository, passwordHashingService);
				const existing = new UsuarioEntity(mockUsuarioProps);
				mockRepository.buscarPorId.mockResolvedValue(existing);
				mockRepository.buscarPorEmail.mockResolvedValue(null);
				mockRepository.buscarPorDocumento.mockResolvedValue(null);

				mockRepository.atualizar.mockResolvedValue(
					new UsuarioEntity({
						...mockUsuarioProps,
						nome: 'Atualizado',
						senha: 'HASHED2',
					}),
				);

				const dto: AtualizarUsuarioDto = { nome: 'Atualizado', senha: 'nova' };
				const result = await useCase.execute(1, dto);

				expect(mockRepository.buscarPorId).toHaveBeenCalledWith(1);
				expect(passwordHashingService.hash).toHaveBeenCalledWith('nova');
				expect(result.nome).toBe('Atualizado');
			});

			it('should throw EntityNotFoundException if user does not exist', async () => {
				const passwordHashingService = createPasswordHashingServiceMock();
				const useCase = new AtualizarUsuarioUseCase(mockRepository, passwordHashingService);
				mockRepository.buscarPorId.mockResolvedValue(null);

				const dto: AtualizarUsuarioDto = { nome: 'X' };
				await expect(useCase.execute(1, dto)).rejects.toThrow(EntityNotFoundException);
			});

			it('should throw ConflictException if new email belongs to another user', async () => {
				const passwordHashingService = createPasswordHashingServiceMock();
				const useCase = new AtualizarUsuarioUseCase(mockRepository, passwordHashingService);
				mockRepository.buscarPorId.mockResolvedValue(new UsuarioEntity(mockUsuarioProps));
				mockRepository.buscarPorEmail.mockResolvedValue(new UsuarioEntity({ ...mockUsuarioProps, id: 999 }));

				const dto: AtualizarUsuarioDto = { email: 'other@zorde.com' };
				await expect(useCase.execute(1, dto)).rejects.toThrow(ConflictException);
			});
		});

		describe('DeletarUsuarioUseCase', () => {
			it('should delete user if found', async () => {
				const useCase = new DeletarUsuarioUseCase(mockRepository);
				mockRepository.buscarPorId.mockResolvedValue(new UsuarioEntity(mockUsuarioProps));
				mockRepository.deletar.mockResolvedValue(undefined);

				await useCase.execute(1);

				expect(mockRepository.buscarPorId).toHaveBeenCalledWith(1);
				expect(mockRepository.deletar).toHaveBeenCalledWith(1);
			});

			it('should throw EntityNotFoundException if user to delete is not found', async () => {
				const useCase = new DeletarUsuarioUseCase(mockRepository);
				mockRepository.buscarPorId.mockResolvedValue(null);

				await expect(useCase.execute(1)).rejects.toThrow(EntityNotFoundException);
			});
		});
	});
});
