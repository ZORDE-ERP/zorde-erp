import { StatusPessoa } from '../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../shared/enums/tipo-pessoa.enum';
import { EntityNotFoundException } from '../../../shared/errors/app.exception';
import { CriarClienteUseCase } from '../application/use-cases/criarCliente.useCase';
import { GerarQrCodeClienteUseCase } from '../application/use-cases/gerarQrCodeCliente.useCase';
import { ClienteEntity } from '../domain/entities/cliente.entity';
import type { IClienteRepository } from '../domain/repositories/cliente.repository';
import type { QrCodeImageService } from '../infrastructure/services/qrCodeImage.service';

describe('Cliente QR Unit Tests', () => {
	let clienteRepository: jest.Mocked<IClienteRepository>;
	let qrCodeImageService: jest.Mocked<Pick<QrCodeImageService, 'generateAndUpload' | 'destroy'>>;
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

		qrCodeImageService = {
			generateAndUpload: jest.fn().mockResolvedValue({
				secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/zorde/qr-codes/cliente-1.svg',
				publicId: 'zorde/qr-codes/cliente-1',
			}),
			destroy: jest.fn(),
		};

		enderecoAdapterRepository = {
			create: jest.fn(),
		};
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
});
