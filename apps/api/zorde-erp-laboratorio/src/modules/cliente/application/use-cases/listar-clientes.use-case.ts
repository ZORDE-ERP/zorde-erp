import { Inject, Injectable } from '@nestjs/common';
import type { IClienteRepository } from '../../domain/repositories/i-cliente.repository';
import { I_CLIENTE_REPOSITORY } from '../../domain/repositories/i-cliente.repository';
import { ClienteResponseDto } from '../dtos/cliente-response.dto';

@Injectable()
export class ListarClientesUseCase {
	public constructor(
		@Inject(I_CLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(usuarioId: number): Promise<ClienteResponseDto[]> {
		const list = await this.clienteRepository.listarPorUsuario(usuarioId);
		return ClienteResponseDto.fromEntities(list);
	}
}
