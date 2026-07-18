import { StatusFolhaOs } from '../../../shared/enums/folha-os.enum';
import { OrigemOrdemServico, OrigemValorItem, StatusOrdemServico } from '../../../shared/enums/ordem-de-servico.enum';
import { StatusPessoa } from '../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../shared/enums/tipo-pessoa.enum';
import {
	BusinessRuleException,
	ConflictException,
	EntityNotFoundException,
	ForbiddenException,
} from '../../../shared/errors/app.exception';
import { GerarQrCodeClienteUseCase } from '../../cliente/application/use-cases/gerarQrCodeCliente.useCase';
import { ListarTabelaMontagemPorQrUseCase } from '../../cliente/application/use-cases/listarTabelaMontagemPorQr.useCase';
import { ClienteEntity } from '../../cliente/domain/entities/cliente.entity';
import { FolhaOsImpressaEntity } from '../../cliente/domain/entities/folhaOsImpressa.entity';
import type { IClienteRepository } from '../../cliente/domain/repositories/cliente.repository';
import type { IFolhaOsRepository } from '../../cliente/domain/repositories/folhaOs.repository';
import type { QrCodeImageService } from '../../cliente/infrastructure/services/qrCodeImage.service';
import { TabelaMontagemEntity } from '../../tabelaMontagem/domain/entities/tabelaMontagem.entity';
import type { ITabelaMontagemRepository } from '../../tabelaMontagem/domain/repositories/tabelaMontagem.repository';
import { createOrderSchema } from '../application/dtos/ordemDeServico.dto';
import { serviceOrderToResponse } from '../application/mappers/ordemDeServicoResponse.mapper';
import { CreateServiceOrderUseCase } from '../application/use-cases/criarOrdem.useCase';
import { ServiceOrderEntity, ServiceOrderItemEntity } from '../domain/entities/ordemDeServico.entity';
import type { IServiceOrderRepository } from '../domain/repositories/ordemDeServico.repository';

describe('OrdemDeServico + QR Unit Tests', () => {
	const mockCliente = new ClienteEntity({
		id: 10,
		nome: 'Cliente Teste',
		email: 'cliente@teste.com',
		contato: '11999999999',
		tipoPessoa: TipoPessoa.FISICA,
		documento: '12345678900',
		status: StatusPessoa.ATIVO,
		usuarioId: 5,
		qrToken: 'token-atual',
		qrGeradoEm: new Date(),
		qrCodeUrl: 'https://res.cloudinary.com/demo/image/upload/qr.svg',
		qrCodePublicId: 'zorde/qr-codes/cliente-10',
		createdAt: new Date(),
	});

	const tabela25 = new TabelaMontagemEntity({
		id: 7,
		clienteId: 10,
		servicoId: 1,
		valor: 25,
		nomeServico: 'Servico A',
	});

	const tabela40 = new TabelaMontagemEntity({
		id: 9,
		clienteId: 10,
		servicoId: 2,
		valor: 40,
		nomeServico: 'Servico B',
	});

	const tabelaOutroCliente = new TabelaMontagemEntity({
		id: 99,
		clienteId: 999,
		servicoId: 1,
		valor: 10,
		nomeServico: 'Outro',
	});

	const folhaImpressa = new FolhaOsImpressaEntity({
		id: 77,
		loteId: 1,
		clienteId: 10,
		usuarioId: 5,
		codigoFolha: 'OS-10-000077',
		status: StatusFolhaOs.IMPRESSA,
	});

	let clienteRepository: jest.Mocked<IClienteRepository>;
	let tabelaRepository: jest.Mocked<ITabelaMontagemRepository>;
	let orderRepository: jest.Mocked<IServiceOrderRepository>;
	let folhaOsRepository: jest.Mocked<IFolhaOsRepository>;
	let qrCodeImageService: jest.Mocked<Pick<QrCodeImageService, 'generateAndUpload' | 'destroy'>>;

	beforeEach(() => {
		clienteRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			findByUsuarioId: jest.fn(),
			update: jest.fn(),
			updateQrToken: jest.fn(),
			updateQrCode: jest.fn(),
			softDelete: jest.fn(),
		};

		tabelaRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			findByClienteId: jest.fn(),
			findByIds: jest.fn(),
			findAllPaginated: jest.fn(),
			update: jest.fn(),
			softDelete: jest.fn(),
		};

		orderRepository = {
			createWithItems: jest.fn(),
			findById: jest.fn(),
			findByUsuarioId: jest.fn(),
			findAllPaginated: jest.fn(),
			countByCliente: jest.fn(),
			update: jest.fn(),
			softDelete: jest.fn(),
			sumFechamento: jest.fn(),
			faturarPorPeriodo: jest.fn(),
		};

		folhaOsRepository = {
			createLoteComFolhas: jest.fn(),
			findById: jest.fn(),
			findByCodigoFolha: jest.fn(),
			vincularOrdem: jest.fn(),
		};

		qrCodeImageService = {
			generateAndUpload: jest.fn().mockResolvedValue({
				secureUrl: 'https://res.cloudinary.com/demo/image/upload/qr-novo.svg',
				publicId: 'zorde/qr-codes/cliente-10',
			}),
			destroy: jest.fn(),
		};
	});

	const createUseCase = (): CreateServiceOrderUseCase =>
		new CreateServiceOrderUseCase(orderRepository, clienteRepository, tabelaRepository, folhaOsRepository);

	describe('createOrderSchema', () => {
		it('rejects item without tabelaMontagemId and without descricaoManual', () => {
			const result = createOrderSchema.safeParse({
				clienteId: 10,
				origem: 'MANUAL',
				itens: [{ quantidade: 1, valorUnitario: 10, origemValor: 'MANUAL' }],
			});
			expect(result.success).toBe(false);
		});

		it('rejects folhaId and codigoFolha together', () => {
			const result = createOrderSchema.safeParse({
				clienteId: 10,
				folhaId: 1,
				codigoFolha: 'OS-10-000001',
				itens: [
					{
						descricaoManual: 'X',
						quantidade: 1,
						valorUnitario: 10,
						origemValor: 'MANUAL',
					},
				],
			});
			expect(result.success).toBe(false);
		});
	});

	describe('CreateServiceOrderUseCase', () => {
		it('creates OS via QR_SCAN with multiple table items', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			tabelaRepository.findByIds.mockResolvedValue([tabela25, tabela40]);
			orderRepository.countByCliente.mockResolvedValue(0);
			orderRepository.createWithItems.mockImplementation(async (data) => {
				return new ServiceOrderEntity({
					id: 1,
					codigoOs: data.codigoOs,
					clienteId: data.clienteId,
					usuarioId: data.usuarioId,
					valorTotal: data.valorTotal,
					status: data.status,
					origem: data.origem,
					observacao: data.observacao,
					createdAt: new Date(),
					cliente: mockCliente,
					itens: data.itens.map(
						(item, index) =>
							new ServiceOrderItemEntity({
								id: index + 1,
								tabelaMontagemId: item.tabelaMontagemId,
								descricaoManual: item.descricaoManual,
								quantidade: item.quantidade,
								valorUnitario: item.valorUnitario,
								valorTotal: item.valorTotal,
								origemValor: item.origemValor as OrigemValorItem,
							}),
					),
				});
			});

			const result = await createUseCase().execute(
				{
					clienteId: 10,
					origem: OrigemOrdemServico.QR_SCAN,
					itens: [
						{
							tabelaMontagemId: 7,
							quantidade: 1,
							valorUnitario: 25,
							origemValor: OrigemValorItem.TABELA,
						},
						{
							tabelaMontagemId: 9,
							quantidade: 2,
							valorUnitario: 40,
							origemValor: OrigemValorItem.TABELA,
						},
					],
				},
				5,
			);

			expect(result.origem).toBe(OrigemOrdemServico.QR_SCAN);
			expect(result.itens).toHaveLength(2);
			expect(result.valorTotal).toBe(105);
			expect(orderRepository.createWithItems).toHaveBeenCalled();
		});

		it('creates manual OS with standalone item', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			tabelaRepository.findByIds.mockResolvedValue([]);
			orderRepository.countByCliente.mockResolvedValue(2);
			orderRepository.createWithItems.mockImplementation(async (data) => {
				return new ServiceOrderEntity({
					id: 2,
					codigoOs: data.codigoOs,
					clienteId: data.clienteId,
					usuarioId: data.usuarioId,
					valorTotal: data.valorTotal,
					status: StatusOrdemServico.LANCADA,
					origem: OrigemOrdemServico.MANUAL,
					itens: data.itens.map(
						(item) =>
							new ServiceOrderItemEntity({
								id: 1,
								...item,
								origemValor: item.origemValor as OrigemValorItem,
							}),
					),
				});
			});

			const result = await createUseCase().execute(
				{
					clienteId: 10,
					origem: OrigemOrdemServico.MANUAL,
					itens: [
						{
							tabelaMontagemId: null,
							descricaoManual: 'Reparo de armação',
							quantidade: 1,
							valorUnitario: 30,
							origemValor: OrigemValorItem.MANUAL,
						},
					],
				},
				5,
			);

			expect(result.itens[0].descricaoManual).toBe('Reparo de armação');
			expect(result.valorTotal).toBe(30);
			expect(result.codigoOs).toBe('OS-10-00003');
		});

		it('links printed sheet by codigoFolha', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			tabelaRepository.findByIds.mockResolvedValue([]);
			folhaOsRepository.findByCodigoFolha.mockResolvedValue(folhaImpressa);
			orderRepository.countByCliente.mockResolvedValue(0);
			orderRepository.createWithItems.mockImplementation(async (data) => {
				expect(data.folhaId).toBe(77);
				return new ServiceOrderEntity({
					id: 8,
					codigoOs: data.codigoOs,
					clienteId: data.clienteId,
					usuarioId: data.usuarioId,
					valorTotal: data.valorTotal,
					status: StatusOrdemServico.LANCADA,
					origem: OrigemOrdemServico.QR_SCAN,
					itens: data.itens.map(
						(item) =>
							new ServiceOrderItemEntity({
								id: 1,
								...item,
								origemValor: item.origemValor as OrigemValorItem,
							}),
					),
				});
			});

			await createUseCase().execute(
				{
					clienteId: 10,
					origem: OrigemOrdemServico.QR_SCAN,
					codigoFolha: 'OS-10-000077',
					itens: [
						{
							descricaoManual: 'Via folha impressa',
							quantidade: 1,
							valorUnitario: 10,
							origemValor: OrigemValorItem.MANUAL,
						},
					],
				},
				5,
			);

			expect(folhaOsRepository.findByCodigoFolha).toHaveBeenCalledWith('OS-10-000077', 5);
		});

		it('rejects reused printed sheet', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			folhaOsRepository.findByCodigoFolha.mockResolvedValue(
				new FolhaOsImpressaEntity({
					id: 77,
					loteId: 1,
					clienteId: 10,
					usuarioId: 5,
					codigoFolha: 'OS-10-000077',
					status: StatusFolhaOs.LANCADA,
					ordemDeServicoId: 1,
				}),
			);

			await expect(
				createUseCase().execute(
					{
						clienteId: 10,
						origem: OrigemOrdemServico.QR_SCAN,
						codigoFolha: 'OS-10-000077',
						itens: [
							{
								descricaoManual: 'X',
								quantidade: 1,
								valorUnitario: 10,
								origemValor: OrigemValorItem.MANUAL,
							},
						],
					},
					5,
				),
			).rejects.toBeInstanceOf(ConflictException);
		});

		it('rejects folha from another cliente', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			folhaOsRepository.findById.mockResolvedValue(
				new FolhaOsImpressaEntity({
					id: 88,
					loteId: 1,
					clienteId: 999,
					usuarioId: 5,
					codigoFolha: 'OS-999-000088',
					status: StatusFolhaOs.IMPRESSA,
				}),
			);

			await expect(
				createUseCase().execute(
					{
						clienteId: 10,
						origem: OrigemOrdemServico.QR_SCAN,
						folhaId: 88,
						itens: [
							{
								descricaoManual: 'X',
								quantidade: 1,
								valorUnitario: 10,
								origemValor: OrigemValorItem.MANUAL,
							},
						],
					},
					5,
				),
			).rejects.toBeInstanceOf(BusinessRuleException);
		});

		it('rejects tabelaMontagemId that belongs to another cliente', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			tabelaRepository.findByIds.mockResolvedValue([tabelaOutroCliente]);

			await expect(
				createUseCase().execute(
					{
						clienteId: 10,
						origem: OrigemOrdemServico.MANUAL,
						itens: [
							{
								tabelaMontagemId: 99,
								quantidade: 1,
								valorUnitario: 10,
								origemValor: OrigemValorItem.TABELA,
							},
						],
					},
					5,
				),
			).rejects.toBeInstanceOf(BusinessRuleException);
		});

		it('uses vigente table price when origemValor=TABELA even if payload is outdated', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			tabelaRepository.findByIds.mockResolvedValue([tabela25]);
			orderRepository.countByCliente.mockResolvedValue(0);
			orderRepository.createWithItems.mockImplementation(async (data) => {
				return new ServiceOrderEntity({
					id: 3,
					codigoOs: data.codigoOs,
					clienteId: data.clienteId,
					usuarioId: data.usuarioId,
					valorTotal: data.valorTotal,
					status: StatusOrdemServico.LANCADA,
					origem: OrigemOrdemServico.QR_SCAN,
					itens: data.itens.map(
						(item) =>
							new ServiceOrderItemEntity({
								id: 1,
								...item,
								origemValor: item.origemValor as OrigemValorItem,
							}),
					),
				});
			});

			const result = await createUseCase().execute(
				{
					clienteId: 10,
					origem: OrigemOrdemServico.QR_SCAN,
					itens: [
						{
							tabelaMontagemId: 7,
							quantidade: 2,
							valorUnitario: 999,
							origemValor: OrigemValorItem.TABELA,
						},
					],
				},
				5,
			);

			expect(result.itens[0].valorUnitario).toBe(25);
			expect(result.itens[0].valorTotal).toBe(50);
			expect(result.valorTotal).toBe(50);
		});

		it('isolates tenant: user B cannot create OS for client of user A', async () => {
			clienteRepository.findById.mockResolvedValue(null);

			await expect(
				createUseCase().execute(
					{
						clienteId: 10,
						origem: OrigemOrdemServico.MANUAL,
						itens: [
							{
								descricaoManual: 'X',
								quantidade: 1,
								valorUnitario: 10,
								origemValor: OrigemValorItem.MANUAL,
							},
						],
					},
					999,
				),
			).rejects.toBeInstanceOf(EntityNotFoundException);
		});
	});

	describe('QR token flows', () => {
		it('returns 403 for invalid qrToken on tabela lookup', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			const useCase = new ListarTabelaMontagemPorQrUseCase(clienteRepository, tabelaRepository);

			await expect(useCase.execute(10, 'token-errado', 5)).rejects.toBeInstanceOf(ForbiddenException);
		});

		it('regeneration invalidates previous token and updates image', async () => {
			clienteRepository.findById.mockResolvedValue(mockCliente);
			clienteRepository.updateQrCode.mockImplementation(async (_id, _uid, data) => {
				return new ClienteEntity({
					id: 10,
					nome: mockCliente.getNome(),
					email: mockCliente.getEmail(),
					tipoPessoa: mockCliente.getTipoPessoa(),
					documento: mockCliente.getDocumento(),
					status: mockCliente.getStatus(),
					usuarioId: 5,
					qrToken: data.qrToken,
					qrGeradoEm: data.qrGeradoEm,
					qrCodeUrl: data.qrCodeUrl,
					qrCodePublicId: data.qrCodePublicId,
				});
			});

			const gerar = new GerarQrCodeClienteUseCase(clienteRepository, qrCodeImageService as unknown as QrCodeImageService);
			const novo = await gerar.execute(10, 5);
			expect(novo.token).not.toBe('token-atual');
			expect(novo.token).toHaveLength(64);
			expect(novo.qrCodeUrl).toContain('cloudinary');
			expect(qrCodeImageService.generateAndUpload).toHaveBeenCalled();

			const clienteComNovoToken = new ClienteEntity({
				id: 10,
				nome: mockCliente.getNome(),
				email: mockCliente.getEmail(),
				tipoPessoa: mockCliente.getTipoPessoa(),
				documento: mockCliente.getDocumento(),
				status: mockCliente.getStatus(),
				usuarioId: 5,
				qrToken: novo.token,
				qrGeradoEm: novo.qrGeradoEm,
				qrCodeUrl: novo.qrCodeUrl,
			});
			clienteRepository.findById.mockResolvedValue(clienteComNovoToken);

			const listar = new ListarTabelaMontagemPorQrUseCase(clienteRepository, tabelaRepository);
			await expect(listar.execute(10, 'token-atual', 5)).rejects.toBeInstanceOf(ForbiddenException);

			tabelaRepository.findByClienteId.mockResolvedValue([tabela25]);
			const ok = await listar.execute(10, novo.token, 5);
			expect(ok.itens).toHaveLength(1);
		});

		it('returns 403 when user tries to read QR of another tenant cliente', async () => {
			clienteRepository.findById.mockResolvedValue(null);
			const useCase = new ListarTabelaMontagemPorQrUseCase(clienteRepository, tabelaRepository);
			await expect(useCase.execute(10, 'token-atual', 999)).rejects.toBeInstanceOf(ForbiddenException);
		});
	});

	describe('Response mapper', () => {
		it('maps entity with items', () => {
			const entity = new ServiceOrderEntity({
				id: 1,
				codigoOs: 'OS-1',
				clienteId: 10,
				usuarioId: 5,
				valorTotal: 25,
				status: StatusOrdemServico.LANCADA,
				origem: OrigemOrdemServico.QR_SCAN,
				cliente: mockCliente,
				itens: [
					new ServiceOrderItemEntity({
						id: 1,
						tabelaMontagemId: 7,
						quantidade: 1,
						valorUnitario: 25,
						valorTotal: 25,
						origemValor: OrigemValorItem.TABELA,
						nomeServico: 'Servico A',
					}),
				],
			});

			const response = serviceOrderToResponse(entity);
			expect(response.valorTotal).toBe(25);
			expect(response.itens[0].nomeServico).toBe('Servico A');
		});
	});
});
