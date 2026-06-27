import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../domain/repositories/i-cliente.repository';
import { I_CLIENTE_REPOSITORY } from '../../domain/repositories/i-cliente.repository';
import { ClienteResponseDto } from '../dtos/cliente-response.dto';

@Injectable()
export class BuscarClienteUseCase {
	public constructor(
		@Inject(I_CLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<ClienteResponseDto> {
		const cliente = await this.clienteRepository.buscarPorId(id);

		if (!cliente || cliente.deletedAt || cliente.usuarioId !== usuarioId) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		return ClienteResponseDto.fromEntity(cliente);
	}
}
