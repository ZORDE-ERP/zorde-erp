import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { LogoImageService } from '../../../../shared/infra/services/logoImage.service';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import { clienteToResponse } from '../mappers/clienteResponse.mapper';

export interface UploadLogoClienteInput {
	buffer: Buffer;
	mimetype: string;
	size: number;
}

@Injectable()
export class UploadLogoClienteUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		private readonly logoImageService: LogoImageService,
	) {}

	public async execute(clienteId: number, usuarioId: number, file: UploadLogoClienteInput): Promise<ClienteResponseDto> {
		const cliente = await this.clienteRepository.findById(clienteId, usuarioId);
		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		this.logoImageService.validateFile(file);

		const previousPublicId = cliente.getLogoPublicId();
		const image = await this.logoImageService.uploadBuffer(file.buffer, {
			kind: 'cliente',
			entityId: clienteId,
			mimeType: file.mimetype,
		});

		const updated = await this.clienteRepository.updateLogo(clienteId, usuarioId, {
			logoUrl: image.secureUrl,
			logoPublicId: image.publicId,
		});

		if (previousPublicId && previousPublicId !== image.publicId) {
			await this.logoImageService.destroy(previousPublicId);
		}

		return clienteToResponse(updated);
	}
}
