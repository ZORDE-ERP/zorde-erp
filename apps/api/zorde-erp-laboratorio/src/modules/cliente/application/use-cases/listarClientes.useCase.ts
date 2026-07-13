import { Inject, Injectable } from '@nestjs/common';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import { clientesToResponse } from '../mappers/clienteResponse.mapper';

@Injectable()
export class ListarClientesUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(usuarioId: number): Promise<ClienteResponseDto[]> {
		const clients = await this.clienteRepository.findByUsuarioId(usuarioId);
		return clientesToResponse(clients);
	}
}
