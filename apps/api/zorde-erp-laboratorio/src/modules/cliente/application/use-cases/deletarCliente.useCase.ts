import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';

@Injectable()
export class DeletarClienteUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<void> {
		const existing = await this.clienteRepository.findById(id, usuarioId);

		if (!existing) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		await this.clienteRepository.softDelete(id, usuarioId);
	}
}
