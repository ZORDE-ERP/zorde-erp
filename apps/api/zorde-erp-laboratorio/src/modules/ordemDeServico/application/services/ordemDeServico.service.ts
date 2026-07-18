import { Injectable } from '@nestjs/common';
import type {
	CreateOrderDto,
	FaturarOrdensDto,
	FechamentoQueryDto,
	ListOrdersQueryDto,
	UpdateOrderDto,
} from '../dtos/ordemDeServico.dto';
import type {
	FaturarOrdensResponseDto,
	FechamentoResponseDto,
	ServiceOrderResponseDto,
} from '../dtos/ordemDeServicoResponse.dto';
import { UpdateServiceOrderUseCase } from '../use-cases/atualizarOrdem.useCase';
import { FindByIdServiceOrderUseCase } from '../use-cases/buscarOrdem.useCase';
import { CreateServiceOrderUseCase } from '../use-cases/criarOrdem.useCase';
import { DeleteServiceOrderUseCase } from '../use-cases/deletarOrdem.useCase';
import { FaturarOrdensUseCase } from '../use-cases/faturarOrdens.useCase';
import { FechamentoOrdensUseCase } from '../use-cases/fechamentoOrdens.useCase';
import { FindAllServiceOrdersUseCase } from '../use-cases/listarOrdem.useCase';

@Injectable()
export class ServiceOrderService {
	public constructor(
		private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
		private readonly findByIdServiceOrderUseCase: FindByIdServiceOrderUseCase,
		private readonly findAllServiceOrdersUseCase: FindAllServiceOrdersUseCase,
		private readonly updateServiceOrderUseCase: UpdateServiceOrderUseCase,
		private readonly deleteServiceOrderUseCase: DeleteServiceOrderUseCase,
		private readonly fechamentoOrdensUseCase: FechamentoOrdensUseCase,
		private readonly faturarOrdensUseCase: FaturarOrdensUseCase,
	) {}

	public async create(dto: CreateOrderDto, usuarioId: number): Promise<ServiceOrderResponseDto> {
		return this.createServiceOrderUseCase.execute(dto, usuarioId);
	}

	public async findById(id: number, usuarioId: number): Promise<ServiceOrderResponseDto> {
		return this.findByIdServiceOrderUseCase.execute(id, usuarioId);
	}

	public async findAll(
		query: ListOrdersQueryDto,
		usuarioId: number,
	): Promise<{ items: ServiceOrderResponseDto[]; total: number }> {
		return this.findAllServiceOrdersUseCase.execute(query, usuarioId);
	}

	public async update(dto: UpdateOrderDto, usuarioId: number): Promise<ServiceOrderResponseDto> {
		return this.updateServiceOrderUseCase.execute(dto, usuarioId);
	}

	public async delete(id: number, usuarioId: number): Promise<void> {
		return this.deleteServiceOrderUseCase.execute(id, usuarioId);
	}

	public async fechamento(query: FechamentoQueryDto, usuarioId: number): Promise<FechamentoResponseDto> {
		return this.fechamentoOrdensUseCase.execute(query, usuarioId);
	}

	public async faturar(dto: FaturarOrdensDto, usuarioId: number): Promise<FaturarOrdensResponseDto> {
		return this.faturarOrdensUseCase.execute(dto, usuarioId);
	}
}
