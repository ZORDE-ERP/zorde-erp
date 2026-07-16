import { randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import { QrCodeImageService } from '../../infrastructure/services/qrCodeImage.service';
import { ClienteQrCodeResponseDto } from '../dtos/clienteQrCodeResponse.dto';

@Injectable()
export class GerarQrCodeClienteUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		private readonly qrCodeImageService: QrCodeImageService,
	) {}

	/**
	 * Gera (ou regenera) o qrToken do cliente + imagem SVG no Cloudinary.
	 * Regenerar sobrescreve o token anterior e invalida o QR físico antigo.
	 */
	public async execute(clienteId: number, usuarioId: number): Promise<ClienteQrCodeResponseDto> {
		const cliente = await this.clienteRepository.findById(clienteId, usuarioId);
		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const previousPublicId = cliente.getQrCodePublicId();
		const token = randomBytes(32).toString('hex');
		const qrGeradoEm = new Date();
		const image = await this.qrCodeImageService.generateAndUpload(clienteId, token);

		const updated = await this.clienteRepository.updateQrCode(clienteId, usuarioId, {
			qrToken: token,
			qrGeradoEm,
			qrCodeUrl: image.secureUrl,
			qrCodePublicId: image.publicId,
		});

		if (previousPublicId && previousPublicId !== image.publicId) {
			await this.qrCodeImageService.destroy(previousPublicId);
		}

		return {
			clienteId: updated.getId() as number,
			token: updated.getQrToken() as string,
			qrGeradoEm: updated.getQrGeradoEm() as Date,
			qrCodeUrl: updated.getQrCodeUrl() as string,
			message: 'QR Code gerado. Regenerar invalida o token anterior e exige reimpressão das folhas.',
		};
	}
}
