import { Injectable } from '@nestjs/common';
import type { CreateOrderDto, UpdateOrderDto } from '../dtos/ordemDeServico.dto';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';
import { UpdateServiceOrderUseCase } from '../use-cases/atualizarOrdem.useCase';
import { FindByIdServiceOrderUseCase } from '../use-cases/buscarOrdem.useCase';
import { CreateServiceOrderUseCase } from '../use-cases/criarOrdem.useCase';
import { DeleteServiceOrderUseCase } from '../use-cases/deletarOrdem.useCase';
import { FindAllServiceOrdersUseCase } from '../use-cases/listarOrdem.useCase';

@Injectable()
export class ServiceOrderService {
	public constructor(
		private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
		private readonly findByIdServiceOrderUseCase: FindByIdServiceOrderUseCase,
		private readonly findAllServiceOrdersUseCase: FindAllServiceOrdersUseCase,
		private readonly updateServiceOrderUseCase: UpdateServiceOrderUseCase,
		private readonly deleteServiceOrderUseCase: DeleteServiceOrderUseCase,
	) {}

	public async create(dto: CreateOrderDto, usuarioId: number): Promise<ServiceOrderResponseDto> {
		return this.createServiceOrderUseCase.execute(dto, usuarioId);
	}

	public async findById(id: number, usuarioId: number): Promise<ServiceOrderResponseDto> {
		return this.findByIdServiceOrderUseCase.execute(id, usuarioId);
	}

	public async findByUsuarioId(usuarioId: number): Promise<ServiceOrderResponseDto[]> {
		return this.findAllServiceOrdersUseCase.execute(usuarioId);
	}

	public async update(dto: UpdateOrderDto, usuarioId: number): Promise<ServiceOrderResponseDto> {
		return this.updateServiceOrderUseCase.execute(dto, usuarioId);
	}

	public async delete(id: number, usuarioId: number): Promise<void> {
		return this.deleteServiceOrderUseCase.execute(id, usuarioId);
	}
}
