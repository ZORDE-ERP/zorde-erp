import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import type { UserInfo } from 'src/shared/interfaces/user.interface';
import { User } from '../../../../shared/decorators/user.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type CreateTabelaMontagemDto,
	createTabelaMontagemSchema,
	type ListTabelaMontagemQueryDto,
	listTabelaMontagemQuerySchema,
	type UpdateTabelaMontagemDto,
	updateTabelaMontagemSchema,
} from '../../application/dtos/tabelaMontagem.dto';
import type { TabelaMontagemResponseDto } from '../../application/dtos/tabelaMontagemResponse.dto';
import { TabelaMontagemService } from '../../application/services/tabelaMontagem.service';

@Controller('api/tabela-montagem')
export class TabelaMontagemController {
	public constructor(private readonly tabelaMontagemService: TabelaMontagemService) {}

	@Post()
	public async create(
		@Body(new ZodValidationPipe(createTabelaMontagemSchema)) body: CreateTabelaMontagemDto,
		@User() user: UserInfo,
	): Promise<TabelaMontagemResponseDto> {
		return this.tabelaMontagemService.create(body, user.userId);
	}

	@Get()
	public async findAll(
		@Query(new ZodValidationPipe(listTabelaMontagemQuerySchema)) query: ListTabelaMontagemQueryDto,
		@User() user: UserInfo,
	): Promise<{ items: TabelaMontagemResponseDto[]; total: number }> {
		return this.tabelaMontagemService.findAllPaginated(query, user.userId);
	}

	@Get(':id')
	public async findById(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<TabelaMontagemResponseDto> {
		return this.tabelaMontagemService.findById(id, user.userId);
	}

	@Put(':id')
	public async update(
		@Param('id', ParseIntPipe) id: number,
		@Body(new ZodValidationPipe(updateTabelaMontagemSchema)) body: UpdateTabelaMontagemDto,
		@User() user: UserInfo,
	): Promise<TabelaMontagemResponseDto> {
		return this.tabelaMontagemService.update(id, body, user.userId);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<void> {
		await this.tabelaMontagemService.delete(id, user.userId);
	}
}
