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
	UsePipes,
} from '@nestjs/common';
import { User } from '../../../../shared/decorators/user.decorator';
import type { JwtPayload } from '../../../../shared/interfaces/jwtPayload.interface';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import type { AtualizarFornecedorDto } from '../../application/dtos/atualizar-fornecedor.dto';
import { atualizarFornecedorSchema } from '../../application/dtos/atualizar-fornecedor.dto';
import type { CriarFornecedorDto } from '../../application/dtos/criar-fornecedor.dto';
import { criarFornecedorSchema } from '../../application/dtos/criar-fornecedor.dto';
import type { FornecedorResponseDto } from '../../application/dtos/fornecedor-response.dto';
import { FornecedorService } from '../../application/services/fornecedor.service';

@Controller('api/fornecedores')
export class FornecedorController {
	public constructor(private readonly fornecedorService: FornecedorService) {}

	@Post()
	@UsePipes(new ZodValidationPipe(criarFornecedorSchema))
	public async criar(@Body() dto: CriarFornecedorDto, @User() user: JwtPayload): Promise<FornecedorResponseDto> {
		return this.fornecedorService.criar(dto, user.sub);
	}

	@Get()
	public async listar(@User() user: JwtPayload): Promise<FornecedorResponseDto[]> {
		return this.fornecedorService.listarPorUsuario(user.sub);
	}

	@Get(':id')
	public async buscarPorId(@Param('id', ParseIntPipe) id: number, @User() user: JwtPayload): Promise<FornecedorResponseDto> {
		return this.fornecedorService.buscarPorId(id, user.sub);
	}

	@Put(':id')
	@UsePipes(new ZodValidationPipe(atualizarFornecedorSchema))
	public async atualizar(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: AtualizarFornecedorDto,
		@User() user: JwtPayload,
	): Promise<FornecedorResponseDto> {
		return this.fornecedorService.atualizar(id, dto, user.sub);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async deletar(@Param('id', ParseIntPipe) id: number, @User() user: JwtPayload): Promise<void> {
		await this.fornecedorService.deletar(id, user.sub);
	}
}
