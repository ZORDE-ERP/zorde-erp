import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { LogoImageService } from '../../../../shared/infra/services/logoImage.service';
import type { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
import { IFORNECEDOR_REPOSITORY } from '../../domain/repositories/fornecedor.repository';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { fornecedorToResponse } from '../mappers/fornecedorResponse.mapper';

@Injectable()
export class RemoverLogoFornecedorUseCase {
	public constructor(
		@Inject(IFORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
		private readonly logoImageService: LogoImageService,
	) {}

	public async execute(fornecedorId: number, usuarioId: number): Promise<FornecedorResponseDto> {
		const fornecedor = await this.fornecedorRepository.findById(fornecedorId, usuarioId);
		if (!fornecedor) {
			throw new EntityNotFoundException('Fornecedor não encontrado');
		}

		const previousPublicId = fornecedor.getLogoPublicId();
		const updated = await this.fornecedorRepository.updateLogo(fornecedorId, usuarioId, {
			logoUrl: null,
			logoPublicId: null,
		});

		await this.logoImageService.destroy(previousPublicId);

		return fornecedorToResponse(updated);
	}
}
