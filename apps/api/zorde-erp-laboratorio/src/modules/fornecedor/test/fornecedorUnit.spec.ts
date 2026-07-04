import { StatusPessoa } from '../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../shared/enums/tipo-pessoa.enum';
import { BusinessRuleException, EntityNotFoundException } from '../../../shared/errors/app.exception';
import { EnderecoAdapterRepository } from '../../../shared/infra/persistence/enderecoAdapter.repository';
import { fornecedoresToResponse, fornecedorToResponse } from '../application/mappers/fornecedorResponse.mapper';
import { AtualizarFornecedorUseCase } from '../application/use-cases/atualizarFornecedor.useCase';
import { BuscarFornecedorUseCase } from '../application/use-cases/buscarFornecedor.useCase';
import { CriarFornecedorUseCase } from '../application/use-cases/criarFornecedor.useCase';
import { DeletarFornecedorUseCase } from '../application/use-cases/deletarFornecedor.useCase';
import { ListarFornecedoresUseCase } from '../application/use-cases/listarFornecedores.useCase';
import { FornecedorEntity } from '../domain/entities/fornecedor.entity';
import { IFornecedorRepository } from '../domain/repositories/fornecedor.repository';
import { FornecedorInfraMapper } from '../infrastructure/mappers/fornecedorInfra.mapper';

describe('Fornecedor Unit Tests', () => {
	const mockFornecedorProps = {
		id: 1,
		nome: 'Fornecedor Teste',
		email: 'fornecedor@teste.com',
		contato: '11999999999',
		tipoPessoa: TipoPessoa.JURIDICA,
		documento: '12345678000199',
		status: StatusPessoa.ATIVO,
		cep: '01001000',
		razaoSocial: 'Fornecedor Teste LTDA',
		nomeFantasia: 'Fornecedor Teste',
		observacao: 'Observação teste',
		usuarioId: 10,
		logradouro: 'Praça da Sé',
		complemento: 'lado ímpar',
		bairro: 'Sé',
		cidade: 'São Paulo',
		uf: 'SP',
		ibge: '3550308',
		numeroEndereco: '100',
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
	};

	describe('FornecedorEntity', () => {
		it('should create a FornecedorEntity with props', () => {
			const entity = new FornecedorEntity(mockFornecedorProps);

			expect(entity.getId()).toBe(1);
			expect(entity.getNome()).toBe('Fornecedor Teste');
			expect(entity.getEmail()).toBe('fornecedor@teste.com');
			expect(entity.getContato()).toBe('11999999999');
			expect(entity.getTipoPessoa()).toBe(TipoPessoa.JURIDICA);
			expect(entity.getDocumento()).toBe('12345678000199');
			expect(entity.getStatus()).toBe(StatusPessoa.ATIVO);
			expect(entity.getCep()).toBe('01001000');
			expect(entity.getRazaoSocial()).toBe('Fornecedor Teste LTDA');
			expect(entity.getNomeFantasia()).toBe('Fornecedor Teste');
			expect(entity.getObservacao()).toBe('Observação teste');
			expect(entity.getUsuarioId()).toBe(10);
			expect(entity.getLogradouro()).toBe('Praça da Sé');
			expect(entity.getComplemento()).toBe('lado ímpar');
			expect(entity.getBairro()).toBe('Sé');
			expect(entity.getCidade()).toBe('São Paulo');
			expect(entity.getUf()).toBe('SP');
			expect(entity.getIbge()).toBe('3550308');
			expect(entity.getNumeroEndereco()).toBe('100');
			expect(entity.getCreatedAt()).toBeInstanceOf(Date);
			expect(entity.getUpdatedAt()).toBeInstanceOf(Date);
			expect(entity.getDeletedAt()).toBeNull();
		});
	});

	describe('Mappers', () => {
		it('should map FornecedorEntity to Response DTO', () => {
			const entity = new FornecedorEntity(mockFornecedorProps);
			const response = fornecedorToResponse(entity);

			expect(response.id).toBe(entity.getId());
			expect(response.nome).toBe(entity.getNome());
			expect(response.email).toBe(entity.getEmail());
			expect(response.documento).toBe(entity.getDocumento());
			expect(response.numeroEndereco).toBe(entity.getNumeroEndereco());
		});

		it('should map list of FornecedorEntity to Response DTO list', () => {
			const entity = new FornecedorEntity(mockFornecedorProps);
			const responses = fornecedoresToResponse([entity]);

			expect(responses).toHaveLength(1);
			expect(responses[0].id).toBe(entity.getId());
		});

		it('should map Prisma raw object to domain entity', () => {
			const raw = {
				id: 1,
				nome: 'Raw Nome',
				email: 'raw@email.com',
				contato: '123',
				tipoPessoa: 'JURIDICA',
				documento: '12345',
				status: 'ATIVO',
				cep: '12345678',
				razaoSocial: 'Raw Razao',
				nomeFantasia: 'Raw Fantasia',
				observacao: 'Raw Obs',
				usuarioId: 10,
				numeroEndereco: '456',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
				Endereco: {
					id: 5,
					cep: '12345678',
					uf: 'SP',
					cidade: 'SP',
					logradouro: 'Rua A',
					bairro: 'Bairro B',
					complemento: 'Apt 1',
					ibge: '123',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			const entity = FornecedorInfraMapper.toDomain(raw);
			expect(entity.getId()).toBe(raw.id);
			expect(entity.getNome()).toBe(raw.nome);
			expect(entity.getLogradouro()).toBe('Rua A');
			expect(entity.getNumeroEndereco()).toBe('456');
		});

		it('should map domain entity to Prisma persistence object', () => {
			const entity = new FornecedorEntity(mockFornecedorProps);
			const persistence = FornecedorInfraMapper.toPersistence(entity);

			expect(persistence.nome).toBe(entity.getNome());
			expect(persistence.email).toBe(entity.getEmail());
			expect(persistence.documento).toBe(entity.getDocumento());
			expect(persistence.numeroEndereco).toBe(entity.getNumeroEndereco());
		});
	});

	describe('Use Cases', () => {
		let mockRepository: jest.Mocked<IFornecedorRepository>;
		let mockEnderecoRepo: jest.Mocked<EnderecoAdapterRepository>;

		beforeEach(() => {
			mockRepository = {
				create: jest.fn(),
				update: jest.fn(),
				findById: jest.fn(),
				findByUsuarioId: jest.fn(),
				softDelete: jest.fn(),
			} as unknown as jest.Mocked<IFornecedorRepository>;
			mockEnderecoRepo = {
				create: jest.fn(),
				findByCep: jest.fn(),
			} as unknown as jest.Mocked<EnderecoAdapterRepository>;
		});

		describe('CriarFornecedorUseCase', () => {
			it('should create a supplier and address successfully', async () => {
				const useCase = new CriarFornecedorUseCase(mockRepository, mockEnderecoRepo);
				const dto = {
					nome: 'Fornecedor Novo',
					email: 'novo@fornecedor.com',
					contato: '11988888888',
					tipoPessoa: TipoPessoa.FISICA,
					documento: '123.456.789-00',
					status: StatusPessoa.ATIVO,
					cep: '01001-000',
					logradouro: 'Praça da Sé',
					bairro: 'Sé',
					cidade: 'São Paulo',
					uf: 'SP',
					numeroEndereco: '12',
				};

				const returnedEntity = new FornecedorEntity({
					...dto,
					id: 123,
					documento: '12345678900',
					usuarioId: 10,
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				});

				mockRepository.create.mockResolvedValue(returnedEntity);

				const result = await useCase.execute(dto, 10);

				expect(mockEnderecoRepo.create).toHaveBeenCalledWith({
					cep: dto.cep,
					uf: dto.uf,
					cidade: dto.cidade,
					logradouro: dto.logradouro,
					bairro: dto.bairro,
					complemento: undefined,
					ibge: undefined,
				});
				expect(mockRepository.create).toHaveBeenCalled();
				expect(result.id).toBe(123);
				expect(result.documento).toBe('12345678900');
			});
		});

		describe('BuscarFornecedorUseCase', () => {
			it('should find supplier by id and usuarioId', async () => {
				const useCase = new BuscarFornecedorUseCase(mockRepository);
				const entity = new FornecedorEntity(mockFornecedorProps);

				mockRepository.findById.mockResolvedValue(entity);

				const result = await useCase.execute(1, 10);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 10);
				expect(result.id).toBe(1);
			});

			it('should throw EntityNotFoundException if supplier does not exist', async () => {
				const useCase = new BuscarFornecedorUseCase(mockRepository);
				mockRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute(1, 10)).rejects.toThrow(EntityNotFoundException);
			});
		});

		describe('ListarFornecedoresUseCase', () => {
			it('should return a list of supplier responses', async () => {
				const useCase = new ListarFornecedoresUseCase(mockRepository);
				const entity = new FornecedorEntity(mockFornecedorProps);

				mockRepository.findByUsuarioId.mockResolvedValue([entity]);

				const result = await useCase.execute(10);

				expect(mockRepository.findByUsuarioId).toHaveBeenCalledWith(10);
				expect(result).toHaveLength(1);
				expect(result[0].id).toBe(1);
			});
		});

		describe('DeletarFornecedorUseCase', () => {
			it('should soft delete supplier if found', async () => {
				const useCase = new DeletarFornecedorUseCase(mockRepository);
				const entity = new FornecedorEntity(mockFornecedorProps);

				mockRepository.findById.mockResolvedValue(entity);
				mockRepository.softDelete.mockResolvedValue(undefined);

				await useCase.execute(1, 10);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 10);
				expect(mockRepository.softDelete).toHaveBeenCalledWith(1, 10);
			});

			it('should throw EntityNotFoundException if supplier to delete is not found', async () => {
				const useCase = new DeletarFornecedorUseCase(mockRepository);
				mockRepository.findById.mockResolvedValue(null);

				await expect(useCase.execute(1, 10)).rejects.toThrow(EntityNotFoundException);
			});
		});

		describe('AtualizarFornecedorUseCase', () => {
			it('should update supplier entity with new values', async () => {
				const useCase = new AtualizarFornecedorUseCase(mockRepository);
				const existingEntity = new FornecedorEntity(mockFornecedorProps);

				mockRepository.findById.mockResolvedValue(existingEntity);

				const dto = {
					id: 1,
					nome: 'Nome Atualizado',
					documento: '111.111.111-11',
					tipoPessoa: TipoPessoa.FISICA,
				};

				const expectedUpdatedEntity = new FornecedorEntity({
					...mockFornecedorProps,
					nome: 'Nome Atualizado',
					documento: '11111111111',
					tipoPessoa: TipoPessoa.FISICA,
					updatedAt: new Date(),
				});

				mockRepository.update.mockResolvedValue(expectedUpdatedEntity);

				const result = await useCase.execute(dto, 10);

				expect(mockRepository.findById).toHaveBeenCalledWith(1, 10);
				expect(mockRepository.update).toHaveBeenCalled();
				expect(result.nome).toBe('Nome Atualizado');
				expect(result.documento).toBe('11111111111');
				expect(result.tipoPessoa).toBe(TipoPessoa.FISICA);
			});

			it('should throw BusinessRuleException if document length does not match TipoPessoa (CPF)', async () => {
				const useCase = new AtualizarFornecedorUseCase(mockRepository);
				const existingEntity = new FornecedorEntity(mockFornecedorProps);

				mockRepository.findById.mockResolvedValue(existingEntity);

				const dto = {
					id: 1,
					documento: '12345', // too short
					tipoPessoa: TipoPessoa.FISICA,
				};

				await expect(useCase.execute(dto, 10)).rejects.toThrow(BusinessRuleException);
			});

			it('should throw BusinessRuleException if document length does not match TipoPessoa (CNPJ)', async () => {
				const useCase = new AtualizarFornecedorUseCase(mockRepository);
				const existingEntity = new FornecedorEntity({
					...mockFornecedorProps,
					tipoPessoa: TipoPessoa.FISICA,
					documento: '12345678900',
				});

				mockRepository.findById.mockResolvedValue(existingEntity);

				const dto = {
					id: 1,
					documento: '12345678900', // CPF length but type is JURIDICA
					tipoPessoa: TipoPessoa.JURIDICA,
				};

				await expect(useCase.execute(dto, 10)).rejects.toThrow(BusinessRuleException);
			});
		});
	});
});
