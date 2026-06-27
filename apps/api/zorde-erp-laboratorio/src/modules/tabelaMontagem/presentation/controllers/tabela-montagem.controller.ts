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
	UseGuards,
	UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import type { JwtPayload } from '../../../../shared/interfaces/jwt-payload.interface';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import type { AtualizarTabelaMontagemDto } from '../../application/dtos/atualizar-tabela-montagem.dto';
import { atualizarTabelaMontagemSchema } from '../../application/dtos/atualizar-tabela-montagem.dto';
import type { CriarTabelaMontagemDto } from '../../application/dtos/criar-tabela-montagem.dto';
import { criarTabelaMontagemSchema } from '../../application/dtos/criar-tabela-montagem.dto';
import type { TabelaMontagemResponseDto } from '../../application/dtos/tabela-montagem-response.dto';
import { TabelaMontagemService } from '../../application/services/tabela-montagem.service';

const listarQuerySchema = z.object({
	page: z.preprocess((val) => Number(val || 1), z.number().int().min(1)).default(1),
	limit: z.preprocess((val) => Number(val || 10), z.number().int().min(1)).default(10),
	search: z.string().optional().default(''),
});

type ListarQueryDto = z.infer<typeof listarQuerySchema>;

@Controller('api/tabela-montagem')
@UseGuards(JwtAuthGuard)
export class TabelaMontagemController {
	public constructor(private readonly tabelaMontagemService: TabelaMontagemService) {}

	@Post()
	@UsePipes(new ZodValidationPipe(criarTabelaMontagemSchema))
	public async criar(
		@Body() dto: CriarTabelaMontagemDto,
		@CurrentUser() user: JwtPayload,
	): Promise<TabelaMontagemResponseDto> {
		return this.tabelaMontagemService.criar(dto, user.sub);
	}

	@Get()
	@UsePipes(new ZodValidationPipe(listarQuerySchema))
	public async listar(
		@Query() query: ListarQueryDto,
		@CurrentUser() user: JwtPayload,
	): Promise<{ items: TabelaMontagemResponseDto[]; total: number }> {
		return this.tabelaMontagemService.listarPaginado(query, user.sub);
	}

	@Put(':id')
	@UsePipes(new ZodValidationPipe(atualizarTabelaMontagemSchema))
	public async atualizar(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: AtualizarTabelaMontagemDto,
		@CurrentUser() user: JwtPayload,
	): Promise<TabelaMontagemResponseDto> {
		return this.tabelaMontagemService.atualizar(id, dto, user.sub);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async deletar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload): Promise<void> {
		await this.tabelaMontagemService.deletar(id, user.sub);
	}
}
