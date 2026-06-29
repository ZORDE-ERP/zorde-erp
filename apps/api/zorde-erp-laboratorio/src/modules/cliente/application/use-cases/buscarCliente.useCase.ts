import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import { clienteToResponse } from '../mappers/clienteResponse.mapper';

@Injectable()
export class BuscarClienteUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<ClienteResponseDto> {
		const cliente = await this.clienteRepository.findById(id, usuarioId);

		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		return clienteToResponse(cliente);
	}
}
