import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import type { UserInfo } from 'src/shared/interfaces/user.interface';
import { User } from '../../../../shared/decorators/user.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type CreateServicoDto,
	createServicoSchema,
	type ListServicoQueryDto,
	listServicoQuerySchema,
	type UpdateServicoDto,
	updateServicoSchema,
} from '../../application/dtos/servico.dto';
import type { ServicoResponseDto } from '../../application/dtos/servicoResponse.dto';
import { ServicoService } from '../../application/services/servico.service';

@Controller('api/servico')
export class ServicoController {
	public constructor(private readonly servicoService: ServicoService) {}

	@Post()
	public async create(
		@Body(new ZodValidationPipe(createServicoSchema)) body: CreateServicoDto,
		@User() user: UserInfo,
	): Promise<ServicoResponseDto> {
		return this.servicoService.create(body, user.userId);
	}

	@Get()
	public async findAll(
		@Query(new ZodValidationPipe(listServicoQuerySchema)) query: ListServicoQueryDto,
		@User() user: UserInfo,
	): Promise<{ items: ServicoResponseDto[]; total: number }> {
		return this.servicoService.findAllPaginated(query, user.userId);
	}

	@Get(':id')
	public async findById(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<ServicoResponseDto> {
		return this.servicoService.findById(id, user.userId);
	}

	@Put(':id')
	public async update(
		@Param('id', ParseIntPipe) id: number,
		@Body(new ZodValidationPipe(updateServicoSchema)) body: UpdateServicoDto,
		@User() user: UserInfo,
	): Promise<ServicoResponseDto> {
		return this.servicoService.update(id, body, user.userId);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<void> {
		await this.servicoService.delete(id, user.userId);
	}
}
