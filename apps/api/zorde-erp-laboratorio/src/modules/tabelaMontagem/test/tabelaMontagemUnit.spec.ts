import { StatusPessoa } from '../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../shared/enums/tipo-pessoa.enum';
import { EntityNotFoundException } from '../../../shared/errors/app.exception';
import { ClienteEntity } from '../../cliente/domain/entities/cliente.entity';
import type { IClienteRepository } from '../../cliente/domain/repositories/cliente.repository';
import { ServicoEntity } from '../../servico/domain/entities/servico.entity';
import type { IServicoRepository } from '../../servico/domain/repositories/servico.repository';
import { tabelaMontagemToResponse, tabelaMontagensToResponse } from '../application/mappers/tabelaMontagemResponse.mapper';
import { UpdateTabelaMontagemUseCase } from '../application/use-cases/atualizarTabelaMontagem.useCase';
import { FindByIdTabelaMontagemUseCase } from '../application/use-cases/buscarTabelaMontagem.useCase';
import { CreateTabelaMontagemUseCase } from '../application/use-cases/criarTabelaMontagem.useCase';
import { DeleteTabelaMontagemUseCase } from '../application/use-cases/deletarTabelaMontagem.useCase';
import { FindAllTabelaMontagemUseCase } from '../application/use-cases/listarTabelaMontagem.useCase';
import { TabelaMontagemEntity } from '../domain/entities/tabelaMontagem.entity';
import type { ITabelaMontagemRepository } from '../domain/repositories/tabelaMontagem.repository';
import { TabelaMontagemInfraMapper } from '../infrastructure/mappers/tabelaMontagemInfra.mapper';

describe('TabelaMontagem Unit Tests', () => {
	const mockTabelaMontagemProps = {
		id: 1,
		clienteId: 10,
		servicoId: 3,
		valor: 150.5,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		nomeCliente: 'Cliente Teste',
		nomeServico: 'MONTAGEM SIMPLES',
	};

	const mockClienteProps = {
		id: 10,
		nome: 'Cliente Teste',
		email: 'cliente@teste.com',
		contato: '11999999999',
		tipoPessoa: TipoPessoa.FISICA,
		documento: '12345678900',
		status: StatusPessoa.ATIVO,
		usuarioId: 5,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
	};

	const mockServicoProps = {
		id: 3,
		usuarioId: 5,
		nome: 'MONTAGEM SIMPLES',
		descricao: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	describe('TabelaMontagemEntity', () => {
		it('should create a TabelaMontagemEntity with props', () => {
			const entity = new TabelaMontagemEntity(mockTabelaMontagemProps);

			expect(entity.getId()).toBe(1);
			expect(entity.getClienteId()).toBe(10);
			expect(entity.getServicoId()).toBe(3);
			expect(entity.getValor()).toBe(150.5);
			expect(entity.getNomeCliente()).toBe('Cliente Teste');
			expect(entity.getNomeServico()).toBe('MONTAGEM SIMPLES');
			expect(entity.getCreatedAt()).toBeInstanceOf(Date);
			expect(entity.getUpdatedAt()).toBeInstanceOf(Date);
			expect(entity.getDeletedAt()).toBeNull();
		});
	});

	describe('Mappers', () => {
		it('should map TabelaMontagemEntity to Response DTO', () => {
			const entity = new TabelaMontagemEntity(mockTabelaMontagemProps);
			const response = tabelaMontagemToResponse(entity);

			expect(response.id).toBe(entity.getId());
			expect(response.clienteId).toBe(entity.getClienteId());
			expect(response.servicoId).toBe(entity.getServicoId());
			expect(response.valor).toBe(entity.getValor());
			expect(response.nomeCliente).toBe(entity.getNomeCliente());
			expect(response.nomeServico).toBe(entity.getNomeServico());
		});

		it('should map list of TabelaMontagemEntity to Response DTO list', () => {
			const entity = new TabelaMontagemEntity(mockTabelaMontagemProps);
			const responses = tabelaMontagensToResponse([entity]);

			expect(responses).toHaveLength(1);
			expect(responses[0].id).toBe(entity.getId());
		});

		it('should map Prisma raw object to domain entity', () => {
			const raw = {
				id: 1,
				clienteId: 10,
				servicoId: 3,
				valor: 150.5,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
				Cliente: {
					id: 10,
					nome: 'Cliente Teste',
				},
				Servico: {
					id: 3,
					nome: 'MONTAGEM SIMPLES',
				},
			};

			const entity = TabelaMontagemInfraMapper.toDomain(raw);
			expect(entity.getId()).toBe(raw.id);
			expect(entity.getClienteId()).toBe(raw.clienteId);
			expect(entity.getServicoId()).toBe(raw.servicoId);
			expect(entity.getNomeCliente()).toBe('Cliente Teste');
			expect(entity.getNomeServico()).toBe('MONTAGEM SIMPLES');
		});

		it('should map domain entity to Prisma persistence object', () => {
			const entity = new TabelaMontagemEntity(mockTabelaMontagemProps);
			const persistence = TabelaMontagemInfraMapper.toPersistence(entity);

			expect(persistence.clienteId).toBe(entity.getClienteId());
			expect(persistence.servicoId).toBe(entity.getServicoId());
			expect(persistence.valor).toBe(entity.getValor());
		});
	});

	describe('Use Cases', () => {
		let mockRepository: jest.Mocked<ITabelaMontagemRepository>;
		let mockClienteRepository: jest.Mocked<IClienteRepository>;
		let mockServicoRepository: jest.Mocked<IServicoRepository>;

		beforeEach(() => {
			mockRepository = {
				create: jest.fn(),
				update: jest.fn(),
				findById: jest.fn(),
				findAllPaginated: jest.fn(),
				softDelete: jest.fn(),
			} as unknown as jest.Mocked<ITabelaMontagemRepository>;

			mockClienteRepository = {
				findById: jest.fn(),
			} as unknown as jest.Mocked<IClienteRepository>;

			mockServicoRepository = {
				findById: jest.fn(),
			} as unknown as jest.Mocked<IServicoRepository>;
		});

		describe('CreateTabelaMontagemUseCase', () => {
			it('should create assembly table successfully', async () => {
				const useCase = new CreateTabelaMontagemUseCase(mockRepository, mockClienteRepository, mockServicoRepository);
				const dto = {
					clienteId: 10,
					servicoId: 3,
					valor: 200,
				};

				const cliente = new ClienteEntity(mockClienteProps);
				const servico = new ServicoEntity(mockServicoProps);
				const returnedEntity = new TabelaMontagemEntity({
					...dto,
					id: 123,
					createdAt: new Date(),
				});

				mockClienteRepository.findById.mockResolvedValue(cliente);
				mockServicoRepository.findById.mockResolvedValue(servico);
				mockRepository.create.mockResolvedValue(returnedEntity);

				const result = await useCase.execute(dto, 5);

				expect(mockClienteRepository.findById).toHaveBeenCalledWith(10, 5);
				expect(mockServicoRepository.findById).toHaveBeenCalledWith(3, 5);
				expect(mockRepository.create).toHaveBeenCalled();
				expect(result.id).toBe(123);
				expect(result.nomeCliente).toBe('Cliente Teste');
				expect(result.nomeServico).toBe('MONTAGEM SIMPLES');
			});

			it('should throw EntityNotFoundException if client does not exist', async () => {
				const useCase = new CreateTabelaMontagemUseCase(mockRepository, mockClienteRepository, mockServicoRepository);
				mockClienteRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute({ clienteId: 10, servicoId: 3, valor: 200 }, 5)).rejects.toThrow(
					EntityNotFoundException,
				);
			});

			it('should throw EntityNotFoundException if servico does not exist', async () => {
				const useCase = new CreateTabelaMontagemUseCase(mockRepository, mockClienteRepository, mockServicoRepository);
				mockClienteRepository.findById.mockResolvedValue(new ClienteEntity(mockClienteProps));
				mockServicoRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute({ clienteId: 10, servicoId: 3, valor: 200 }, 5)).rejects.toThrow(
					EntityNotFoundException,
				);
			});
		});

		describe('FindByIdTabelaMontagemUseCase', () => {
			it('should find assembly table by id and usuarioId', async () => {
				const useCase = new FindByIdTabelaMontagemUseCase(mockRepository);
				const entity = new TabelaMontagemEntity(mockTabelaMontagemProps);

				mockRepository.findById.mockResolvedValue(entity);

				const result = await useCase.execute(1, 5);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 5);
				expect(result.id).toBe(1);
			});

			it('should throw EntityNotFoundException if assembly table does not exist', async () => {
				const useCase = new FindByIdTabelaMontagemUseCase(mockRepository);
				mockRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute(1, 5)).rejects.toThrow(EntityNotFoundException);
			});
		});

		describe('FindAllTabelaMontagemUseCase', () => {
			it('should return a paginated list of assembly table responses', async () => {
				const useCase = new FindAllTabelaMontagemUseCase(mockRepository);
				const entity = new TabelaMontagemEntity(mockTabelaMontagemProps);

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

		describe('DeleteTabelaMontagemUseCase', () => {
			it('should soft delete assembly table if found', async () => {
				const useCase = new DeleteTabelaMontagemUseCase(mockRepository);
				const entity = new TabelaMontagemEntity(mockTabelaMontagemProps);

				mockRepository.findById.mockResolvedValue(entity);
				mockRepository.softDelete.mockResolvedValue(undefined);

				await useCase.execute(1, 5);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 5);
				expect(mockRepository.softDelete).toHaveBeenCalledWith(1, 5);
			});

			it('should throw EntityNotFoundException if assembly table to delete is not found', async () => {
				const useCase = new DeleteTabelaMontagemUseCase(mockRepository);
				mockRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute(1, 5)).rejects.toThrow(EntityNotFoundException);
			});
		});

		describe('UpdateTabelaMontagemUseCase', () => {
			it('should update assembly table entity with new values', async () => {
				const useCase = new UpdateTabelaMontagemUseCase(mockRepository, mockClienteRepository, mockServicoRepository);
				const existingEntity = new TabelaMontagemEntity(mockTabelaMontagemProps);
				const cliente = new ClienteEntity(mockClienteProps);
				const servico = new ServicoEntity({ ...mockServicoProps, id: 4, nome: 'COLORACAO' });

				mockRepository.findById.mockResolvedValue(existingEntity);
				mockClienteRepository.findById.mockResolvedValue(cliente);
				mockServicoRepository.findById.mockResolvedValue(servico);

				const dto = {
					servicoId: 4,
					valor: 300,
				};

				const expectedUpdatedEntity = new TabelaMontagemEntity({
					...mockTabelaMontagemProps,
					servicoId: 4,
					nomeServico: 'COLORACAO',
					valor: 300,
				});

				mockRepository.update.mockResolvedValue(expectedUpdatedEntity);

				const result = await useCase.execute(1, dto, 5);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 5);
				expect(mockServicoRepository.findById).toHaveBeenCalledWith(4, 5);
				expect(mockRepository.update).toHaveBeenCalled();
				expect(result.servicoId).toBe(4);
				expect(result.valor).toBe(300);
			});
		});
	});
});
