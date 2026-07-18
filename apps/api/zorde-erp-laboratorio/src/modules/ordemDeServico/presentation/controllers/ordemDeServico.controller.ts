import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import type { UserInfo } from 'src/shared/interfaces/user.interface';
import { User } from '../../../../shared/decorators/user.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type CreateOrderDto,
	createOrderSchema,
	type FaturarOrdensDto,
	type FechamentoQueryDto,
	faturarOrdensSchema,
	fechamentoQuerySchema,
	type ListOrdersQueryDto,
	listOrdersQuerySchema,
	type UpdateOrderDto,
	updateOrderSchema,
} from '../../application/dtos/ordemDeServico.dto';

import type {
	FaturarOrdensResponseDto,
	FechamentoResponseDto,
	ServiceOrderResponseDto,
} from '../../application/dtos/ordemDeServicoResponse.dto';
import { ServiceOrderService } from '../../application/services/ordemDeServico.service';

@Controller('api/ordens-de-servico')
export class ServiceOrderController {
	public constructor(private readonly serviceOrderService: ServiceOrderService) {}

	@Post()
	public async create(
		@Body(new ZodValidationPipe(createOrderSchema)) body: CreateOrderDto,
		@User() user: UserInfo,
	): Promise<ServiceOrderResponseDto | null> {
		return this.serviceOrderService.create(body, user.userId);
	}

	@Get()
	public async findAll(
		@Query(new ZodValidationPipe(listOrdersQuerySchema)) query: ListOrdersQueryDto,
		@User() user: UserInfo,
	): Promise<{ items: ServiceOrderResponseDto[]; total: number }> {
		return this.serviceOrderService.findAll(query, user.userId);
	}

	@Get('fechamento')
	public async fechamento(
		@Query(new ZodValidationPipe(fechamentoQuerySchema)) query: FechamentoQueryDto,
		@User() user: UserInfo,
	): Promise<FechamentoResponseDto> {
		return this.serviceOrderService.fechamento(query, user.userId);
	}

	@Patch('faturar')
	public async faturar(
		@Body(new ZodValidationPipe(faturarOrdensSchema)) body: FaturarOrdensDto,
		@User() user: UserInfo,
	): Promise<FaturarOrdensResponseDto> {
		return this.serviceOrderService.faturar(body, user.userId);
	}

	@Get(':id')
	public async findById(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<ServiceOrderResponseDto> {
		return this.serviceOrderService.findById(id, user.userId);
	}

	@Put()
	public async update(
		@Body(new ZodValidationPipe(updateOrderSchema)) body: UpdateOrderDto,
		@User() user: UserInfo,
	): Promise<ServiceOrderResponseDto> {
		return this.serviceOrderService.update(body, user.userId);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<void> {
		await this.serviceOrderService.delete(id, user.userId);
	}
}
