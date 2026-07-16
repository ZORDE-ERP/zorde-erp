jest.mock('puppeteer', () => ({
	__esModule: true,
	default: {
		launch: jest.fn(),
	},
}));

import { StatusFolhaOs } from '../../../shared/enums/folha-os.enum';
import { StatusPessoa } from '../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../shared/enums/tipo-pessoa.enum';
import { BusinessRuleException, EntityNotFoundException } from '../../../shared/errors/app.exception';
import { impressaoOsSchema } from '../application/dtos/impressaoOs.dto';
import { CriarClienteUseCase } from '../application/use-cases/criarCliente.useCase';
import { GerarQrCodeClienteUseCase } from '../application/use-cases/gerarQrCodeCliente.useCase';
import { ImprimirFolhasOsUseCase } from '../application/use-cases/imprimirFolhasOs.useCase';
import { ClienteEntity } from '../domain/entities/cliente.entity';
import { FolhaOsImpressaEntity } from '../domain/entities/folhaOsImpressa.entity';
import type { IClienteRepository } from '../domain/repositories/cliente.repository';
import type { IFolhaOsRepository } from '../domain/repositories/folhaOs.repository';
import type { OsFolhaPdfService } from '../infrastructure/services/osFolhaPdf.service';
import type { QrCodeImageService } from '../infrastructure/services/qrCodeImage.service';

describe('Cliente QR + Impressão Unit Tests', () => {
	let clienteRepository: jest.Mocked<IClienteRepository>;
	let folhaOsRepository: jest.Mocked<IFolhaOsRepository>;
	let qrCodeImageService: jest.Mocked<Pick<QrCodeImageService, 'generateAndUpload' | 'destroy'>>;
	let osFolhaPdfService: jest.Mocked<Pick<OsFolhaPdfService, 'generatePdf'>>;
	let enderecoAdapterRepository: { create: jest.Mock };

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

		folhaOsRepository = {
			createLoteComFolhas: jest.fn(),
			findById: jest.fn(),
			findByCodigoFolha: jest.fn(),
			vincularOrdem: jest.fn(),
		};

		qrCodeImageService = {
			generateAndUpload: jest.fn().mockResolvedValue({
				secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/zorde/qr-codes/cliente-1.svg',
				publicId: 'zorde/qr-codes/cliente-1',
			}),
			destroy: jest.fn(),
		};

		osFolhaPdfService = {
			generatePdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock')),
		};

		enderecoAdapterRepository = {
			create: jest.fn(),
		};
	});

	describe('impressaoOsSchema', () => {
		it('accepts quantidade between 1 and 1000', () => {
			expect(impressaoOsSchema.safeParse({ quantidade: 400 }).success).toBe(true);
		});

		it('rejects quantidade above 1000', () => {
			expect(impressaoOsSchema.safeParse({ quantidade: 1001 }).success).toBe(false);
		});
	});

	describe('CriarClienteUseCase', () => {
		it('creates client with automatic qrToken and Cloudinary SVG url', async () => {
			clienteRepository.create.mockResolvedValue(
				new ClienteEntity({
					id: 1,
					nome: 'Ótica Alpha',
					email: 'otica@alpha.com',
					tipoPessoa: TipoPessoa.JURIDICA,
					documento: '12345678000199',
					status: StatusPessoa.ATIVO,
					usuarioId: 5,
					createdAt: new Date(),
				}),
			);
			clienteRepository.updateQrCode.mockImplementation(async (_id, _uid, data) => {
				return new ClienteEntity({
					id: 1,
					nome: 'Ótica Alpha',
					email: 'otica@alpha.com',
					tipoPessoa: TipoPessoa.JURIDICA,
					documento: '12345678000199',
					status: StatusPessoa.ATIVO,
					usuarioId: 5,
					qrToken: data.qrToken,
					qrGeradoEm: data.qrGeradoEm,
					qrCodeUrl: data.qrCodeUrl,
					qrCodePublicId: data.qrCodePublicId,
					createdAt: new Date(),
				});
			});

			const useCase = new CriarClienteUseCase(
				clienteRepository,
				enderecoAdapterRepository as never,
				qrCodeImageService as unknown as QrCodeImageService,
			);

			const result = await useCase.execute(
				{
					nome: 'Ótica Alpha',
					email: 'otica@alpha.com',
					tipoPessoa: TipoPessoa.JURIDICA,
					documento: '12.345.678/0001-99',
					status: StatusPessoa.ATIVO,
				} as never,
				5,
			);

			expect(qrCodeImageService.generateAndUpload).toHaveBeenCalledWith(1, expect.any(String));
			expect(clienteRepository.updateQrCode).toHaveBeenCalled();
			expect(result.qrCodeUrl).toContain('cloudinary');
			expect(result).not.toHaveProperty('qrToken');
		});
	});

	describe('GerarQrCodeClienteUseCase', () => {
		it('regenerates token and replaces Cloudinary asset', async () => {
			clienteRepository.findById.mockResolvedValue(
				new ClienteEntity({
					id: 1,
					nome: 'Ótica Alpha',
					email: 'otica@alpha.com',
					tipoPessoa: TipoPessoa.JURIDICA,
					documento: '12345678000199',
					status: StatusPessoa.ATIVO,
					usuarioId: 5,
					qrToken: 'a'.repeat(64),
					qrGeradoEm: new Date(),
					qrCodeUrl: 'https://old.url/qr.svg',
					qrCodePublicId: 'zorde/qr-codes/cliente-1-old',
				}),
			);
			qrCodeImageService.generateAndUpload.mockResolvedValue({
				secureUrl: 'https://new.url/qr.svg',
				publicId: 'zorde/qr-codes/cliente-1',
			});
			clienteRepository.updateQrCode.mockImplementation(async (_id, _uid, data) => {
				return new ClienteEntity({
					id: 1,
					nome: 'Ótica Alpha',
					email: 'otica@alpha.com',
					tipoPessoa: TipoPessoa.JURIDICA,
					documento: '12345678000199',
					status: StatusPessoa.ATIVO,
					usuarioId: 5,
					qrToken: data.qrToken,
					qrGeradoEm: data.qrGeradoEm,
					qrCodeUrl: data.qrCodeUrl,
					qrCodePublicId: data.qrCodePublicId,
				});
			});

			const useCase = new GerarQrCodeClienteUseCase(
				clienteRepository,
				qrCodeImageService as unknown as QrCodeImageService,
			);
			const result = await useCase.execute(1, 5);

			expect(result.token).toHaveLength(64);
			expect(result.token).not.toBe('a'.repeat(64));
			expect(result.qrCodeUrl).toBe('https://new.url/qr.svg');
			expect(qrCodeImageService.destroy).toHaveBeenCalledWith('zorde/qr-codes/cliente-1-old');
		});

		it('throws when cliente does not exist', async () => {
			clienteRepository.findById.mockResolvedValue(null);
			const useCase = new GerarQrCodeClienteUseCase(
				clienteRepository,
				qrCodeImageService as unknown as QrCodeImageService,
			);
			await expect(useCase.execute(1, 5)).rejects.toBeInstanceOf(EntityNotFoundException);
		});
	});

	describe('ImprimirFolhasOsUseCase', () => {
		it('creates N folhas with unique codes and returns PDF buffer', async () => {
			clienteRepository.findById.mockResolvedValue(
				new ClienteEntity({
					id: 10,
					nome: 'Mercadão dos Óculos',
					nomeFantasia: 'Mercadão',
					email: 'm@x.com',
					tipoPessoa: TipoPessoa.JURIDICA,
					documento: '1',
					status: StatusPessoa.ATIVO,
					usuarioId: 5,
					qrToken: 't'.repeat(64),
					qrCodeUrl: 'https://res.cloudinary.com/demo/qr.svg',
				}),
			);

			const folhas = [
				new FolhaOsImpressaEntity({
					id: 1,
					loteId: 9,
					clienteId: 10,
					usuarioId: 5,
					codigoFolha: 'OS-10-000001',
					status: StatusFolhaOs.IMPRESSA,
				}),
				new FolhaOsImpressaEntity({
					id: 2,
					loteId: 9,
					clienteId: 10,
					usuarioId: 5,
					codigoFolha: 'OS-10-000002',
					status: StatusFolhaOs.IMPRESSA,
				}),
				new FolhaOsImpressaEntity({
					id: 3,
					loteId: 9,
					clienteId: 10,
					usuarioId: 5,
					codigoFolha: 'OS-10-000003',
					status: StatusFolhaOs.IMPRESSA,
				}),
			];

			folhaOsRepository.createLoteComFolhas.mockResolvedValue({
				loteId: 9,
				quantidade: 3,
				folhas,
			});

			const useCase = new ImprimirFolhasOsUseCase(
				clienteRepository,
				folhaOsRepository,
				osFolhaPdfService as unknown as OsFolhaPdfService,
			);

			const result = await useCase.execute(10, 5, { quantidade: 3 });

			expect(folhaOsRepository.createLoteComFolhas).toHaveBeenCalledWith({
				clienteId: 10,
				usuarioId: 5,
				quantidade: 3,
			});
			expect(result.codigosFolha).toEqual(['OS-10-000001', 'OS-10-000002', 'OS-10-000003']);
			expect(new Set(result.codigosFolha).size).toBe(3);
			expect(result.buffer.toString()).toContain('%PDF');
			expect(osFolhaPdfService.generatePdf).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						nomeOtica: 'Mercadão',
						codigoFolha: 'OS-10-000001',
					}),
				]),
			);
		});

		it('rejects print when cliente has no QR image', async () => {
			clienteRepository.findById.mockResolvedValue(
				new ClienteEntity({
					id: 10,
					nome: 'Sem QR',
					email: 's@x.com',
					tipoPessoa: TipoPessoa.FISICA,
					documento: '1',
					status: StatusPessoa.ATIVO,
					usuarioId: 5,
				}),
			);

			const useCase = new ImprimirFolhasOsUseCase(
				clienteRepository,
				folhaOsRepository,
				osFolhaPdfService as unknown as OsFolhaPdfService,
			);

			await expect(useCase.execute(10, 5, { quantidade: 1 })).rejects.toBeInstanceOf(
				BusinessRuleException,
			);
		});
	});
});
