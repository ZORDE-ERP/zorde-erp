import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import type { UserInfo } from 'src/shared/interfaces/user.interface';
import { User } from '../../../../shared/decorators/user.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type CreateFornecedorDto,
	createFornecedorSchema,
	type UpdateFornecedorDto,
	updateFornecedorSchema,
} from '../../application/dtos/fornecedor.dto';
import type { FornecedorResponseDto } from '../../application/dtos/fornecedorResponse.dto';
import { FornecedorService } from '../../application/services/fornecedor.service';

@Controller('api/fornecedores')
export class FornecedorController {
	public constructor(private readonly fornecedorService: FornecedorService) {}

	@Post()
	public async create(
		@Body(new ZodValidationPipe(createFornecedorSchema)) body: CreateFornecedorDto,
		@User() user: UserInfo,
	): Promise<FornecedorResponseDto | null> {
		return this.fornecedorService.create(body, user.userId);
	}

	@Get()
	public async listar(@User() user: UserInfo): Promise<FornecedorResponseDto[]> {
		return this.fornecedorService.findByUsuarioId(user.userId);
	}

	@Get(':id')
	public async buscarPorId(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<FornecedorResponseDto> {
		return this.fornecedorService.findById(id, user.userId);
	}

	@Put()
	public async update(
		@Body(new ZodValidationPipe(updateFornecedorSchema)) body: UpdateFornecedorDto,
		@User() user: UserInfo,
	): Promise<FornecedorResponseDto> {
		return this.fornecedorService.update(body, user.userId);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserInfo): Promise<void> {
		await this.fornecedorService.delete(id, user.userId);
	}
}
