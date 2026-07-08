import { EntityNotFoundException } from '../../../shared/errors/app.exception';
import { servicosToResponse, servicoToResponse } from '../application/mappers/servicoResponse.mapper';
import { UpdateServicoUseCase } from '../application/use-cases/atualizarServico.useCase';
import { FindByIdServicoUseCase } from '../application/use-cases/buscarServico.useCase';
import { CreateServicoUseCase } from '../application/use-cases/criarServico.useCase';
import { DeleteServicoUseCase } from '../application/use-cases/deletarServico.useCase';
import { FindAllServicoUseCase } from '../application/use-cases/listarServico.useCase';
import { ServicoEntity } from '../domain/entities/servico.entity';
import type { IServicoRepository } from '../domain/repositories/servico.repository';
import { ServicoInfraMapper } from '../infrastructure/mappers/servicoInfra.mapper';

describe('Servico Unit Tests', () => {
	const mockServicoProps = {
		id: 1,
		usuarioId: 5,
		nome: 'Montagem Simples',
		descricao: 'Serviço de montagem básica',
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	describe('ServicoEntity', () => {
		it('should create a ServicoEntity with props', () => {
			const entity = new ServicoEntity(mockServicoProps);

			expect(entity.getId()).toBe(1);
			expect(entity.getUsuarioId()).toBe(5);
			expect(entity.getNome()).toBe('Montagem Simples');
			expect(entity.getDescricao()).toBe('Serviço de montagem básica');
			expect(entity.getCreatedAt()).toBeInstanceOf(Date);
			expect(entity.getUpdatedAt()).toBeInstanceOf(Date);
		});
	});

	describe('Mappers', () => {
		it('should map ServicoEntity to Response DTO', () => {
			const entity = new ServicoEntity(mockServicoProps);
			const response = servicoToResponse(entity);

			expect(response.id).toBe(entity.getId());
			expect(response.usuarioId).toBe(entity.getUsuarioId());
			expect(response.nome).toBe(entity.getNome());
			expect(response.descricao).toBe(entity.getDescricao());
		});

		it('should map list of ServicoEntity to Response DTO list', () => {
			const entity = new ServicoEntity(mockServicoProps);
			const responses = servicosToResponse([entity]);

			expect(responses).toHaveLength(1);
			expect(responses[0].id).toBe(entity.getId());
		});

		it('should map Prisma raw object to domain entity', () => {
			const raw = {
				id: 1,
				usuarioId: 5,
				nome: 'Montagem Simples',
				descricao: 'Serviço de montagem básica',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const entity = ServicoInfraMapper.toDomain(raw);
			expect(entity.getId()).toBe(raw.id);
			expect(entity.getUsuarioId()).toBe(raw.usuarioId);
			expect(entity.getNome()).toBe(raw.nome);
			expect(entity.getDescricao()).toBe(raw.descricao);
		});

		it('should map domain entity to Prisma persistence object', () => {
			const entity = new ServicoEntity(mockServicoProps);
			const persistence = ServicoInfraMapper.toPersistence(entity);

			expect(persistence.usuarioId).toBe(entity.getUsuarioId());
			expect(persistence.nome).toBe(entity.getNome());
			expect(persistence.descricao).toBe(entity.getDescricao());
		});
	});

	describe('Use Cases', () => {
		let mockRepository: jest.Mocked<IServicoRepository>;

		beforeEach(() => {
			mockRepository = {
				create: jest.fn(),
				update: jest.fn(),
				findById: jest.fn(),
				findAllPaginated: jest.fn(),
				delete: jest.fn(),
			} as unknown as jest.Mocked<IServicoRepository>;
		});

		describe('CreateServicoUseCase', () => {
			it('should create servico successfully', async () => {
				const useCase = new CreateServicoUseCase(mockRepository);
				const dto = {
					nome: 'Coloração',
					descricao: 'Serviço de coloração',
				};

				const returnedEntity = new ServicoEntity({
					...dto,
					id: 123,
					usuarioId: 5,
					createdAt: new Date(),
				});

				mockRepository.create.mockResolvedValue(returnedEntity);

				const result = await useCase.execute(dto, 5);

				expect(mockRepository.create).toHaveBeenCalled();
				expect(result.id).toBe(123);
				expect(result.nome).toBe('Coloração');
				expect(result.usuarioId).toBe(5);
			});
		});

		describe('FindByIdServicoUseCase', () => {
			it('should find servico by id and usuarioId', async () => {
				const useCase = new FindByIdServicoUseCase(mockRepository);
				const entity = new ServicoEntity(mockServicoProps);

				mockRepository.findById.mockResolvedValue(entity);

				const result = await useCase.execute(1, 5);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 5);
				expect(result.id).toBe(1);
			});

			it('should throw EntityNotFoundException if servico does not exist', async () => {
				const useCase = new FindByIdServicoUseCase(mockRepository);
				mockRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute(1, 5)).rejects.toThrow(EntityNotFoundException);
			});
		});

		describe('FindAllServicoUseCase', () => {
			it('should return a paginated list of servico responses', async () => {
				const useCase = new FindAllServicoUseCase(mockRepository);
				const entity = new ServicoEntity(mockServicoProps);

				mockRepository.findAllPaginated.mockResolvedValue({ items: [entity], total: 1 });

				const result = await useCase.execute({ page: 1, limit: 10, search: '' }, 5);

				expect(mockRepository.findAllPaginated).toHaveBeenCalledWith({
					page: 1,
					limit: 10,
					search: '',
					usuarioId: 5,
				});
				expect(result.items).toHaveLength(1);
				expect(result.total).toBe(1);
			});
		});

		describe('DeleteServicoUseCase', () => {
			it('should delete servico if found', async () => {
				const useCase = new DeleteServicoUseCase(mockRepository);
				const entity = new ServicoEntity(mockServicoProps);

				mockRepository.findById.mockResolvedValue(entity);
				mockRepository.delete.mockResolvedValue(undefined);

				await useCase.execute(1, 5);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 5);
				expect(mockRepository.delete).toHaveBeenCalledWith(1, 5);
			});

			it('should throw EntityNotFoundException if servico to delete is not found', async () => {
				const useCase = new DeleteServicoUseCase(mockRepository);
				mockRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute(1, 5)).rejects.toThrow(EntityNotFoundException);
			});
		});

		describe('UpdateServicoUseCase', () => {
			it('should update servico entity with new values', async () => {
				const useCase = new UpdateServicoUseCase(mockRepository);
				const existingEntity = new ServicoEntity(mockServicoProps);

				mockRepository.findById.mockResolvedValue(existingEntity);

				const dto = {
					nome: 'Transposição',
					descricao: 'Serviço de transposição',
				};

				const expectedUpdatedEntity = new ServicoEntity({
					...mockServicoProps,
					nome: 'Transposição',
					descricao: 'Serviço de transposição',
				});

				mockRepository.update.mockResolvedValue(expectedUpdatedEntity);

				const result = await useCase.execute(1, dto, 5);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 5);
				expect(mockRepository.update).toHaveBeenCalled();
				expect(result.nome).toBe('Transposição');
				expect(result.descricao).toBe('Serviço de transposição');
			});

			it('should throw EntityNotFoundException if servico to update is not found', async () => {
				const useCase = new UpdateServicoUseCase(mockRepository);
				mockRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute(1, { nome: 'Novo Nome' }, 5)).rejects.toThrow(EntityNotFoundException);
			});
		});
	});
});
