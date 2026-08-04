import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { LogoImageService } from '../../../../shared/infra/services/logoImage.service';
import type { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
import { IFORNECEDOR_REPOSITORY } from '../../domain/repositories/fornecedor.repository';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { fornecedorToResponse } from '../mappers/fornecedorResponse.mapper';

export interface UploadLogoFornecedorInput {
	buffer: Buffer;
	mimetype: string;
	size: number;
}

@Injectable()
export class UploadLogoFornecedorUseCase {
	public constructor(
		@Inject(IFORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
		private readonly logoImageService: LogoImageService,
	) {}

	public async execute(
		fornecedorId: number,
		usuarioId: number,
		file: UploadLogoFornecedorInput,
	): Promise<FornecedorResponseDto> {
		const fornecedor = await this.fornecedorRepository.findById(fornecedorId, usuarioId);
		if (!fornecedor) {
			throw new EntityNotFoundException('Fornecedor não encontrado');
		}

		this.logoImageService.validateFile(file);

		const previousPublicId = fornecedor.getLogoPublicId();
		const image = await this.logoImageService.uploadBuffer(file.buffer, {
			kind: 'fornecedor',
			entityId: fornecedorId,
			mimeType: file.mimetype,
		});

		const updated = await this.fornecedorRepository.updateLogo(fornecedorId, usuarioId, {
			logoUrl: image.secureUrl,
			logoPublicId: image.publicId,
		});

		if (previousPublicId && previousPublicId !== image.publicId) {
			await this.logoImageService.destroy(previousPublicId);
		}

		return fornecedorToResponse(updated);
	}
}
