import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { LogoImageService } from '../../../../shared/infra/services/logoImage.service';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import { clienteToResponse } from '../mappers/clienteResponse.mapper';

@Injectable()
export class RemoverLogoClienteUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		private readonly logoImageService: LogoImageService,
	) {}

	public async execute(clienteId: number, usuarioId: number): Promise<ClienteResponseDto> {
		const cliente = await this.clienteRepository.findById(clienteId, usuarioId);
		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const previousPublicId = cliente.getLogoPublicId();
		const updated = await this.clienteRepository.updateLogo(clienteId, usuarioId, {
			logoUrl: null,
			logoPublicId: null,
		});

		await this.logoImageService.destroy(previousPublicId);

		return clienteToResponse(updated);
	}
}
