import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { UserInfo } from 'src/shared/interfaces/user.interface';
import { User } from '../../../../shared/decorators/user.decorator';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import {
	type CreateFornecedorDto,
	createFornecedorSchema,
	type ListFornecedorQueryDto,
	listFornecedorQuerySchema,
	type UpdateFornecedorDto,
	updateFornecedorSchema,
} from '../../application/dtos/fornecedor.dto';
import type { FornecedorResponseDto } from '../../application/dtos/fornecedorResponse.dto';
import { FornecedorService } from '../../application/services/fornecedor.service';
import type { ListFornecedoresResult } from '../../application/use-cases/listarFornecedores.useCase';

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
	public async listar(
		@Query(new ZodValidationPipe(listFornecedorQuerySchema)) query: ListFornecedorQueryDto,
		@User() user: UserInfo,
	): Promise<ListFornecedoresResult> {
		return this.fornecedorService.listar(query, user.userId);
	}

	@Post(':id/logo')
	@UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
	public async uploadLogo(
		@Param('id', ParseIntPipe) id: number,
		@UploadedFile() file: { buffer: Buffer; mimetype: string; size: number } | undefined,
		@User() user: UserInfo,
	): Promise<FornecedorResponseDto> {
		return this.fornecedorService.uploadLogo(id, user.userId, {
			buffer: file?.buffer ?? Buffer.alloc(0),
			mimetype: file?.mimetype ?? '',
			size: file?.size ?? 0,
		});
	}

	@Delete(':id/logo')
	public async removerLogo(
		@Param('id', ParseIntPipe) id: number,
		@User() user: UserInfo,
	): Promise<FornecedorResponseDto> {
		return this.fornecedorService.removerLogo(id, user.userId);
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
